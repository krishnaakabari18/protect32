'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, API_BASE_URL, buildMediaUrl } from '@/config/api.config';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const PatientEducationCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const quillRef = useRef<any>(null);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const defaultValues = {
        id: null,
        title: '',
        category: '',
        content: '',
        summary: '',
        tags: [],
        status: 'Active',
        feature_image: null,
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [tagInput, setTagInput] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchItems();
    }, [pagination.page, pagination.limit, filterCategory, filterStatus, searchTerm]);

    // Initialize editor when modal opens
    useEffect(() => {
        if (addModal && modalMode !== 'view') {
            setIsEditorReady(false);
            const timer = setTimeout(() => {
                setIsEditorReady(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setIsEditorReady(false);
        }
    }, [addModal, modalMode]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.patientEducation}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterCategory && { category: filterCategory }),
                ...(filterStatus && { status: filterStatus }),
                ...(searchTerm && { search: searchTerm }),
            });

            const response = await fetch(`${API_ENDPOINTS.patientEducation}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setItems(data.data || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages,
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        if (!params.title) { newErrors.title = 'Title is required.'; newTouched.title = true; }
        if (!params.content) { newErrors.content = 'Content is required.'; newTouched.content = true; }
        setTouched(prev => ({ ...prev, ...newTouched }));
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstKey = Object.keys(newErrors)[0];
                const el = document.querySelector(`[name="${firstKey}"], [id="${firstKey}"]`) as HTMLElement;
                if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }, 50);
        }
        return Object.keys(newErrors).length === 0;
    };

    const saveItem = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.patientEducation}/${params.id}` : API_ENDPOINTS.patientEducation;
            const method = params.id ? 'PUT' : 'POST';

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('title', params.title);
            formData.append('category', params.category);
            formData.append('content', params.content);
            formData.append('summary', params.summary || '');
            formData.append('status', params.status);
            
            // Handle tags array
            if (params.tags && params.tags.length > 0) {
                formData.append('tags', JSON.stringify(params.tags));
            }

            // Handle image upload
            if (imageFile) {
                formData.append('feature_image', imageFile);
            }

            // Handle image removal
            if (removeImage) {
                formData.append('removeImage', 'true');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    // Don't set Content-Type for FormData - browser will set it with boundary
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Content has been ${params.id ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchItems();
                fetchCategories();
                setImageFile(null);
                setImagePreview(null);
                setRemoveImage(false);
            } else {
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (item: any) => {
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.patientEducation}/${item.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Status updated to ${newStatus}`);
                fetchItems();
            } else {
                showMessage(data.error || 'Status update failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        }
    };

    const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        const json = JSON.parse(JSON.stringify(defaultValues));
        
        if (item) {
            Object.keys(item).forEach(key => {
                if (json.hasOwnProperty(key)) {
                    json[key] = item[key];
                }
            });

            // Ensure tags is always an array
            if (!Array.isArray(json.tags)) {
                try {
                    json.tags = json.tags ? JSON.parse(json.tags) : [];
                } catch {
                    json.tags = [];
                }
            }
            
            // Set image preview if exists
            if (item.feature_image) {
                setImagePreview(buildMediaUrl(`uploads/${item.feature_image}`));
            } else {
                setImagePreview(null);
            }
        } else {
            setImagePreview(null);
        }
        
        setParams(json);
        setTagInput('');
        setImageFile(null);
        setRemoveImage(false);
        setIsEditorReady(false);
        setTouched({});
        setErrors({});
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_ENDPOINTS.patientEducation}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Content has been deleted successfully.');
                        fetchItems();
                        fetchCategories();
                    } else {
                        const data = await response.json();
                        showMessage(data.error || 'Delete failed', 'error');
                    }
                } catch (error: any) {
                    showMessage('Error: ' + error.message, 'error');
                }
            }
        });
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') {
            Swal.fire({
                icon: 'success',
                title: msg,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 3000,
                timerProgressBar: true,
            });
        } else {
            const toast: any = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'toast' },
            });
            toast.fire({ icon: type, title: msg, padding: '10px 20px' });
        }
    };

    const changeValue = (e: any) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const requiredFields: Record<string, string> = { title: 'Title' };
        if (requiredFields[name] && !value) {
            setErrors(prev => ({ ...prev, [name]: `${requiredFields[name]} is required.` }));
        } else {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const addTag = () => {
        const currentTags = Array.isArray(params.tags) ? params.tags : [];
        if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
            setParams({ ...params, tags: [...currentTags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        const currentTags = Array.isArray(params.tags) ? params.tags : [];
        setParams({ ...params, tags: currentTags.filter((_: any, i: number) => i !== index) });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showMessage('Please select an image file', 'error');
                return;
            }
            
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('Image size should be less than 5MB', 'error');
                return;
            }
            
            setImageFile(file);
            setRemoveImage(false);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
    };

    // Custom image handler for inline image uploads
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Validate file
            if (!file.type.startsWith('image/')) {
                showMessage('Please select an image file', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showMessage('Image size should be less than 5MB', 'error');
                return;
            }

            // Show loading
            Swal.fire({
                title: 'Uploading image...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const token = localStorage.getItem('auth_token');
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${API_ENDPOINTS.educationImages}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: formData,
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Insert image into editor
                    if (quillRef.current) {
                        const range = quillRef.current.getSelection(true);
                        const imageUrl = `${API_BASE_URL}${data.url}`;
                        quillRef.current.insertEmbed(range.index, 'image', imageUrl);
                        quillRef.current.setSelection(range.index + 1);
                    }
                    Swal.close();
                    showMessage('Image uploaded successfully');
                } else {
                    Swal.close();
                    showMessage(data.error || 'Image upload failed', 'error');
                }
            } catch (error: any) {
                Swal.close();
                showMessage('Error uploading image: ' + error.message, 'error');
            }
        };
    };

    // Memoize quill modules to prevent recreation
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), []);

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Patient Education Content</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Content
                            </button>
                        </div>
                        {/* <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'list' && 'bg-primary text-white'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'grid' && 'bg-primary text-white'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <IconLayoutGrid />
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div>
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                {(filterStatus || searchTerm) && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setFilterStatus('');
                                setSearchTerm('');
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block align-middle"></span>
                </div>
            ) : (
                <>
                    {viewMode === 'list' && (
                        <div className="panel mt-5 overflow-hidden border-0 p-0">
                            <div className="table-responsive">
                                <table className="table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Status</th>
                                            <th>Views</th>
                                            <th>Created Date</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                                <td className="font-semibold">{item.title}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`badge cursor-pointer ${
                                                            item.status === 'Active' ? 'bg-success' : 'bg-danger'
                                                        }`}
                                                        onClick={() => toggleStatus(item)}
                                                    >
                                                        {item.status}
                                                    </button>
                                                </td>
                                                <td>{item.view_count || 0}</td>
                                                <td>{formatDate(item.created_at)}</td>
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('view', item)}>
                                                            <IconEye />
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('edit', item)}>
                                                            <IconPencil />
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}>
                                                            <IconTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'grid' && (
                        <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                            {items.map((item: any) => (
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden shadow relative" key={item.id}>
                                    {item.feature_image && (
                                        <div className="h-48 overflow-hidden">
                                            <img 
                                                src={buildMediaUrl(`uploads/${item.feature_image}`)} 
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="text-lg font-semibold mb-2">{item.title}</div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Status:</span>
                                                <button
                                                    type="button"
                                                    className={`badge cursor-pointer ${
                                                        item.status === 'Active' ? 'bg-success' : 'bg-danger'
                                                    }`}
                                                    onClick={() => toggleStatus(item)}
                                                >
                                                    {item.status}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Views:</span>
                                                <span>{item.view_count || 0}</span>
                                            </div>
                                            {item.summary && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                        {item.summary}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center justify-center">
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('view', item)}>
                                                <IconEye />
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('edit', item)}>
                                                <IconPencil />
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}>
                                                <IconTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`btn btn-sm ${pagination.page === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={() => setAddModal(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel my-8 w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Content
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label htmlFor="title">Title <span className="text-red-500">*</span></label>
                                                <input
                                                    id="title"
                                                    type="text"
                                                    name="title"
                                                    placeholder="Enter content title"
                                                    className={`form-input ${touched.title && errors.title ? 'border-red-500' : ''}`}
                                                    value={params.title}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    disabled={modalMode === 'view'}
                                                />
                                                {touched.title && errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="status">Status *</label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    className="form-select"
                                                    value={params.status}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="summary">Summary</label>
                                                <textarea
                                                    id="summary"
                                                    name="summary"
                                                    rows={2}
                                                    placeholder="Brief summary of the content"
                                                    className="form-textarea"
                                                    value={params.summary}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="content">Content *</label>
                                                {modalMode === 'view' ? (
                                                    <div 
                                                        className="form-textarea min-h-[200px] p-3 bg-gray-50 dark:bg-gray-800"
                                                        dangerouslySetInnerHTML={{ __html: params.content }}
                                                    />
                                                ) : isEditorReady ? (
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={params.content || ''}
                                                        onChange={(value: string) => {
                                                            setParams({ ...params, content: value });
                                                            // Capture editor ref on first change
                                                            if (!quillRef.current) {
                                                                const editor = (document.querySelector('.ql-editor') as any)?.parentElement?.__quill;
                                                                if (editor) quillRef.current = editor;
                                                            }
                                                        }}
                                                        modules={quillModules}
                                                        formats={quillFormats}
                                                        className="bg-white dark:bg-gray-900"
                                                        style={{ height: '300px', marginBottom: '50px' }}
                                                        placeholder="Enter detailed content..."
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-10 h-10 inline-block"></span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="feature_image">Feature Image</label>
                                                {modalMode !== 'view' && (
                                                    <input
                                                        id="feature_image"
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-input"
                                                        onChange={handleImageChange}
                                                    />
                                                )}
                                                {imagePreview && (
                                                    <div className="mt-3 relative inline-block">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            className="max-w-xs max-h-48 rounded border"
                                                        />
                                                        {modalMode !== 'view' && (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveImage}
                                                                className="absolute top-2 right-2 btn btn-sm btn-danger"
                                                            >
                                                                <IconX className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {modalMode !== 'view' && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Max size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="tags">Tags</label>
                                                {modalMode !== 'view' && (
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Add tag and press Enter"
                                                            value={tagInput}
                                                            onChange={(e) => setTagInput(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addTag();
                                                                }
                                                            }}
                                                        />
                                                        <button type="button" className="btn btn-primary" onClick={addTag}>
                                                            Add
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    {params.tags && params.tags.map((tag: string, index: number) => (
                                                        <span key={index} className="badge bg-info flex items-center gap-2">
                                                            {tag}
                                                            {modalMode !== 'view' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTag(index)}
                                                                    className="hover:text-danger"
                                                                >
                                                                    <IconX className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center mt-8 gap-3">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                {modalMode === 'view' ? 'Close' : 'Cancel'}
                                            </button>
                                            {modalMode !== 'view' && (
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>
                                                    {loading ? 'Saving...' : modalMode === 'create' ? 'Add' : 'Update'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PatientEducationCRUD;
