'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconFile from '@/components/icon/icon-file';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';

const DocumentsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [filterPatient, setFilterPatient] = useState('');
    const [filterProvider, setFilterProvider] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const defaultValues = {
        id: null,
        patient_id: '',
        provider_id: '',
        name: '',
        document_type: '',
        notes: '',
        files: [],
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [keepExistingFiles, setKeepExistingFiles] = useState(true);

    const documentTypes = [
        'Medical Record',
        'X-Ray',
        'Lab Report',
        'Prescription',
        'Insurance',
        'Treatment Plan',
        'Consent Form',
        'Other'
    ];

    // Helper function to format date
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

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Get file icon based on mime type
    const getFileIcon = (mimetype: string) => {
        if (mimetype?.includes('pdf')) return '📄';
        if (mimetype?.includes('image')) return '🖼️';
        return '📎';
    };

    useEffect(() => {
        fetchPatients();
        fetchProviders();
        fetchItems();
    }, [pagination.page, pagination.limit, filterType, filterPatient, filterProvider]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.patients}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setPatients(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.providers}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setProviders(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterType && { document_type: filterType }),
                ...(filterPatient && { patient_id: filterPatient }),
                ...(filterProvider && { provider_id: filterProvider }),
            });

            const response = await fetch(`${API_ENDPOINTS.documents}?${queryParams}`, {
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
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file types
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            showMessage('Only PDF and image files (JPEG, PNG, GIF, WEBP) are allowed', 'error');
            return;
        }

        // Validate file sizes (10MB max)
        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showMessage('File size must be less than 10MB', 'error');
            return;
        }

        // Limit to 10 files
        if (files.length > 10) {
            showMessage('Maximum 10 files allowed', 'error');
            return;
        }

        setSelectedFiles(files);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!params.patient_id || !params.name || !params.document_type) {
            showMessage('Please fill all required fields', 'error');
            return false;
        }
        if (modalMode === 'create' && selectedFiles.length === 0) {
            showMessage('Please select at least one file', 'error');
            return false;
        }
        return true;
    };

    const saveItem = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.documents}/${params.id}` : API_ENDPOINTS.documents;
            const method = params.id ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('patient_id', params.patient_id);
            if (params.provider_id) formData.append('provider_id', params.provider_id);
            formData.append('name', params.name);
            formData.append('document_type', params.document_type);
            if (params.notes) formData.append('notes', params.notes);
            
            if (params.id) {
                formData.append('keep_existing_files', keepExistingFiles.toString());
            }

            // Append files
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Document has been ${params.id ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchItems();
            } else {
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
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
        }
        
        setParams(json);
        setSelectedFiles([]);
        setKeepExistingFiles(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "This will delete the document and all associated files!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_ENDPOINTS.documents}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showMessage(data.message || 'Document has been deleted successfully.');
                        fetchItems();
                    } else {
                        showMessage(data.error || 'Delete failed', 'error');
                    }
                } catch (error: any) {
                    showMessage('Error: ' + error.message, 'error');
                }
            }
        });
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const changeValue = (e: any) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    const getFilesCount = (item: any) => {
        if (!item.files) return 0;
        const files = typeof item.files === 'string' ? JSON.parse(item.files) : item.files;
        return files.length;
    };

    const downloadFile = (filePath: string, filename: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://abbey-stateliest-treva.ngrok-free.dev';
        const fileUrl = `${baseUrl}/${filePath}`;
        window.open(fileUrl, '_blank');
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Documents</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Document
                            </button>
                        </div>
                        <div>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div>
                    <select
                        className="form-select"
                        value={filterPatient}
                        onChange={(e) => {
                            setFilterPatient(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Patients</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.first_name} {patient.last_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        className="form-select"
                        value={filterProvider}
                        onChange={(e) => {
                            setFilterProvider(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Providers</option>
                        {providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                                Dr. {provider.first_name} {provider.last_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Types</option>
                        {documentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                {(filterPatient || filterProvider || filterType) && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setFilterPatient('');
                                setFilterProvider('');
                                setFilterType('');
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
                                            <th>Document Name</th>
                                            <th>Patient</th>
                                            <th>Provider</th>
                                            <th>Type</th>
                                            <th>Files</th>
                                            <th>Upload Date</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="font-semibold">{item.name}</td>
                                                <td>
                                                    {item.patient_first_name && item.patient_last_name
                                                        ? `${item.patient_first_name} ${item.patient_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `Dr. ${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary">{item.document_type}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">{getFilesCount(item)} files</span>
                                                </td>
                                                <td>{formatDate(item.upload_date)}</td>
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
                                    <div className="p-6">
                                        <div className="text-lg font-semibold mb-2 flex items-center gap-2">
                                            <IconFile className="w-5 h-5" />
                                            {item.name}
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Patient:</span>
                                                <span>
                                                    {item.patient_first_name && item.patient_last_name
                                                        ? `${item.patient_first_name} ${item.patient_last_name}`
                                                        : '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Provider:</span>
                                                <span>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `Dr. ${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Type:</span>
                                                <span className="badge bg-primary">{item.document_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Files:</span>
                                                <span className="badge bg-info">{getFilesCount(item)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Date:</span>
                                                <span>{formatDate(item.upload_date)}</span>
                                            </div>
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
                    <div className="flex justify-between items-center mt-5">
                        <div>
                            Showing {items.length} of {pagination.total} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
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
                                <DialogPanel className="panel my-8 w-full max-w-3xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Document
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="patient_id">Patient *</label>
                                                <select
                                                    id="patient_id"
                                                    name="patient_id"
                                                    className="form-select"
                                                    value={params.patient_id}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Patient</option>
                                                    {patients.map((patient) => (
                                                        <option key={patient.id} value={patient.id}>
                                                            {patient.first_name} {patient.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="provider_id">Provider</label>
                                                <select
                                                    id="provider_id"
                                                    name="provider_id"
                                                    className="form-select"
                                                    value={params.provider_id}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Provider (Optional)</option>
                                                    {providers.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            Dr. {provider.first_name} {provider.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="document_type">Document Type *</label>
                                                <select
                                                    id="document_type"
                                                    name="document_type"
                                                    className="form-select"
                                                    value={params.document_type}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Type</option>
                                                    {documentTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="name">Document Name *</label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter document name"
                                                    className="form-input"
                                                    value={params.name}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            
                                            {/* File Upload */}
                                            {modalMode !== 'view' && (
                                                <div className="col-span-2">
                                                    <label htmlFor="files">
                                                        Upload Files * (PDF, Images - Max 10 files, 10MB each)
                                                    </label>
                                                    <input
                                                        ref={fileInputRef}
                                                        id="files"
                                                        type="file"
                                                        className="form-input"
                                                        multiple
                                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                                        onChange={handleFileSelect}
                                                    />
                                                    
                                                    {/* Show selected files */}
                                                    {selectedFiles.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <div className="font-semibold">Selected Files ({selectedFiles.length}):</div>
                                                            {selectedFiles.map((file, index) => (
                                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{getFileIcon(file.type)}</span>
                                                                        <span className="text-sm">{file.name}</span>
                                                                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="text-danger hover:text-red-700"
                                                                        onClick={() => removeSelectedFile(index)}
                                                                    >
                                                                        <IconX className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Keep existing files option for edit mode */}
                                                    {modalMode === 'edit' && params.files && getFilesCount(params) > 0 && (
                                                        <div className="mt-3">
                                                            <label className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox"
                                                                    checked={keepExistingFiles}
                                                                    onChange={(e) => setKeepExistingFiles(e.target.checked)}
                                                                />
                                                                <span className="ml-2">Keep existing files ({getFilesCount(params)} files)</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Show existing files in view/edit mode */}
                                            {(modalMode === 'view' || modalMode === 'edit') && params.files && getFilesCount(params) > 0 && (
                                                <div className="col-span-2">
                                                    <label>Existing Files ({getFilesCount(params)}):</label>
                                                    <div className="mt-2 space-y-2">
                                                        {(typeof params.files === 'string' ? JSON.parse(params.files) : params.files).map((file: any, index: number) => (
                                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{getFileIcon(file.mimetype)}</span>
                                                                    <span className="text-sm">{file.originalname}</span>
                                                                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => downloadFile(file.path, file.originalname)}
                                                                >
                                                                    <IconDownload className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-span-2">
                                                <label htmlFor="notes">Notes</label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    rows={4}
                                                    placeholder="Additional notes"
                                                    className="form-textarea"
                                                    value={params.notes}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
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

export default DocumentsCRUD;
