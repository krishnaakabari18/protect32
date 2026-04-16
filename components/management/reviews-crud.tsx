'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';

const ReviewsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [procedures, setProcedures] = useState<any[]>([]);
    const [procedureDropdownOpen, setProcedureDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterRating, setFilterRating] = useState('');
    
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
        rating: '',
        comment: '',
        diagnosis: [] as string[],
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
    const [providerSearch, setProviderSearch] = useState('');
    const providerDropdownRef = React.useRef<HTMLDivElement>(null);

    // Close provider dropdown on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target as Node)) {
                setProviderDropdownOpen(false);
                setProviderSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch providers when patient changes
    React.useEffect(() => {
        if (params.patient_id && addModal) {
            fetchProvidersByPatient(params.patient_id);
        } else if (!params.patient_id) {
            setFilteredProviders([]);
        }
    }, [params.patient_id, addModal]);

    const fetchProvidersByPatient = async (patientId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.dropdowns}/patient-providers?parent_id=${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setFilteredProviders(data.data || []);
        } catch (e) {
            console.error('Error fetching providers by patient:', e);
            setFilteredProviders([]);
        }
    };

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

    useEffect(() => {
        fetchItems();
    }, [pagination.page, pagination.limit, filterRating]);

    const fetchProcedures = async (providerId: string) => {
        if (!providerId) { setProcedures([]); return; }
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.providers}/${providerId}/procedures`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setProcedures(data.data || []);
        } catch (e) { console.error(e); }
    };

    // Fetch procedures when provider changes
    useEffect(() => {
        fetchProcedures(params.provider_id);
        // Reset diagnosis when provider changes (only if modal is open)
        if (addModal) setParams((p: any) => ({ ...p, diagnosis: [] }));
        setProcedureDropdownOpen(false);
    }, [params.provider_id]);

    // Close procedure dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.procedure-dropdown-container')) {
                setProcedureDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterRating && { rating: filterRating }),
            });

            const response = await fetch(`${API_ENDPOINTS.reviews}?${queryParams}`, {
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
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        if (!params.patient_id) { newErrors.patient_id = 'Patient is required.'; newTouched.patient_id = true; }
        if (!params.provider_id) { newErrors.provider_id = 'Provider is required.'; newTouched.provider_id = true; }
        if (!params.rating) { newErrors.rating = 'Rating is required.'; newTouched.rating = true; }
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
            const url = params.id ? `${API_ENDPOINTS.reviews}/${params.id}` : API_ENDPOINTS.reviews;
            const method = params.id ? 'PUT' : 'POST';

            // Prepare data - remove id for new records
            const submitData = { ...params };
            if (!params.id) delete submitData.id;
            // Convert diagnosis array to comma-separated string
            if (Array.isArray(submitData.diagnosis)) {
                submitData.diagnosis = submitData.diagnosis.join(',');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Review has been ${params.id ? 'updated' : 'created'} successfully.`);
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
        setTouched({});
        setErrors({});
        setProcedureDropdownOpen(false);
        setProviderDropdownOpen(false);
        setProviderSearch('');
        const json = JSON.parse(JSON.stringify(defaultValues));
        
        if (item) {
            Object.keys(item).forEach(key => {
                if (json.hasOwnProperty(key)) {
                    json[key] = item[key];
                }
            });
            // Parse diagnosis: stored as comma-separated string, needs to be array
            if (typeof json.diagnosis === 'string' && json.diagnosis) {
                json.diagnosis = json.diagnosis.split(',').map((s: string) => s.trim()).filter(Boolean);
            } else if (!Array.isArray(json.diagnosis)) {
                json.diagnosis = [];
            }
            // Pre-load providers for this patient
            if (item.patient_id) fetchProvidersByPatient(item.patient_id);
            // Fetch procedures for this provider
            if (item.provider_id) fetchProcedures(item.provider_id);
        } else {
            setProcedures([]);
            setFilteredProviders([]);
        }
        
        setParams(json);
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
                    const response = await fetch(`${API_ENDPOINTS.reviews}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Review has been deleted successfully.');
                        fetchItems();
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
        const requiredFields: Record<string, string> = { patient_id: 'Patient', provider_id: 'Provider', rating: 'Rating' };
        if (requiredFields[name] && !value) {
            setErrors(prev => ({ ...prev, [name]: `${requiredFields[name]} is required.` }));
        } else {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const renderStars = (rating: number) => {
        return '⭐'.repeat(rating || 0);
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Reviews</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Review
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
                    <select
                        className="form-select"
                        value={filterRating}
                        onChange={(e) => {
                            setFilterRating(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
                {filterRating && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setFilterRating('');
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            Clear Filter
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
                                            <th>Patient</th>
                                            <th>Provider</th>
                                            <th>Diagnosis</th>
                                            <th>Rating</th>
                                            <th>Comment</th>
                                            <th>Created Date</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
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
                                                <td className="max-w-[160px]">
                                                    {item.diagnosis_names || item.diagnosis
                                                        ? <span className="text-sm">{(item.diagnosis_names || item.diagnosis).length > 40 ? (item.diagnosis_names || item.diagnosis).substring(0, 40) + '...' : (item.diagnosis_names || item.diagnosis)}</span>
                                                        : '-'}
                                                </td>
                                                <td>
                                                    <span className="text-lg">{renderStars(item.rating)}</span>
                                                    <span className="ml-2">({item.rating}/5)</span>
                                                </td>
                                                <td>
                                                    {item.comment 
                                                        ? (item.comment.length > 50 
                                                            ? item.comment.substring(0, 50) + '...' 
                                                            : item.comment)
                                                        : '-'}
                                                </td>
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
                                    <div className="p-6">
                                        <div className="text-lg font-semibold mb-2">
                                            {item.patient_first_name} {item.patient_last_name}
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Provider:</span>
                                                <span>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `Dr. ${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Rating:</span>
                                                <span className="text-lg">{renderStars(item.rating)} ({item.rating}/5)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Date:</span>
                                                <span>{formatDate(item.created_at)}</span>
                                            </div>
                                            {item.comment && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                        {item.comment}
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
                                <DialogPanel className="panel my-8 w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Review
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="patient_id">Patient <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    id="patient_id"
                                                    dropdownType="patients"
                                                    value={params.patient_id}
                                                    onChange={(val) => {
                                                        setParams((prev: any) => ({ ...prev, patient_id: val, provider_id: '', diagnosis: [] }));
                                                        setFilteredProviders([]);
                                                        setProviderDropdownOpen(false);
                                                        if (errors.patient_id) setErrors(prev => { const n = { ...prev }; delete n.patient_id; return n; });
                                                    }}
                                                    placeholder="Select Patient"
                                                    disabled={modalMode === 'view'}
                                                    className={touched.patient_id && errors.patient_id ? 'border-red-500' : ''}
                                                />
                                                {touched.patient_id && errors.patient_id && <p className="mt-1 text-xs text-red-500">{errors.patient_id}</p>}
                                                <p className="text-xs text-gray-400 mt-1">Select patient first</p>
                                            </div>
                                            <div>
                                                <label htmlFor="provider_id">Provider <span className="text-red-500">*</span></label>
                                                {params.patient_id ? (
                                                    filteredProviders.length > 0 ? (
                                                        <div ref={providerDropdownRef} className="relative">
                                                            <button
                                                                type="button"
                                                                className={`form-input w-full text-left flex items-center justify-between gap-2 cursor-pointer min-h-[38px] ${touched.provider_id && errors.provider_id ? 'border-red-500' : ''}`}
                                                                onClick={() => modalMode !== 'view' && setProviderDropdownOpen(o => !o)}
                                                                disabled={modalMode === 'view'}
                                                            >
                                                                <span className={`text-sm truncate flex-1 ${!params.provider_id ? 'text-gray-400' : ''}`}>
                                                                    {params.provider_id
                                                                        ? filteredProviders.find(p => p.value === params.provider_id)?.label || 'Select Provider'
                                                                        : 'Select Provider'}
                                                                </span>
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    {params.provider_id && (
                                                                        <span className="text-gray-400 hover:text-danger text-base leading-none cursor-pointer px-1"
                                                                            onClick={(e) => { e.stopPropagation(); setParams((prev: any) => ({ ...prev, provider_id: '', diagnosis: [] })); }}>×</span>
                                                                    )}
                                                                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${providerDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
                                                                </div>
                                                            </button>
                                                            {providerDropdownOpen && (
                                                                <div className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                                                                    onMouseDown={e => e.stopPropagation()}>
                                                                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 outline-none focus:border-primary"
                                                                            placeholder="Type to search..."
                                                                            value={providerSearch}
                                                                            onChange={e => setProviderSearch(e.target.value)}
                                                                            onClick={e => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                    <ul className="max-h-52 overflow-y-auto py-1">
                                                                        {filteredProviders
                                                                            .filter(p => !providerSearch || p.label.toLowerCase().includes(providerSearch.toLowerCase()) || (p.meta?.email || '').toLowerCase().includes(providerSearch.toLowerCase()))
                                                                            .map(provider => (
                                                                                <li
                                                                                    key={provider.value}
                                                                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors ${params.provider_id === provider.value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                                                                                    onMouseDown={e => {
                                                                                        e.preventDefault();
                                                                                        setParams((prev: any) => ({ ...prev, provider_id: provider.value, diagnosis: [] }));
                                                                                        fetchProcedures(provider.value);
                                                                                        if (errors.provider_id) setErrors(prev => { const n = { ...prev }; delete n.provider_id; return n; });
                                                                                        setProviderDropdownOpen(false);
                                                                                        setProviderSearch('');
                                                                                    }}
                                                                                >
                                                                                    <div>{provider.label}</div>
                                                                                    {provider.meta?.email && <div className="text-xs text-gray-400">{provider.meta.email}</div>}
                                                                                </li>
                                                                            ))}
                                                                        {filteredProviders.filter(p => !providerSearch || p.label.toLowerCase().includes(providerSearch.toLowerCase()) || (p.meta?.email || '').toLowerCase().includes(providerSearch.toLowerCase())).length === 0 && (
                                                                            <li className="px-3 py-2 text-sm text-gray-400">No results found</li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="form-input bg-gray-100 text-gray-500 cursor-not-allowed min-h-[38px] flex items-center">
                                                            No providers with completed appointments
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="form-input bg-gray-100 text-gray-500 cursor-not-allowed min-h-[38px] flex items-center">
                                                        Select patient first
                                                    </div>
                                                )}
                                                {touched.provider_id && errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id}</p>}
                                                <p className="text-xs text-gray-400 mt-1">Only providers with completed appointments</p>
                                            </div>
                                            {/* Diagnosis multi-select */}
                                            <div>
                                                <label>Diagnosis (Procedures)</label>
                                                <div className="relative procedure-dropdown-container">
                                                    <button
                                                        type="button"
                                                        className="form-input w-full text-left flex items-center justify-between"
                                                        onClick={() => modalMode !== 'view' && params.provider_id && setProcedureDropdownOpen(o => !o)}
                                                        disabled={modalMode === 'view' || !params.provider_id}
                                                    >
                                                        <span className="truncate text-sm">
                                                            {!params.provider_id
                                                                ? 'Select Provider first'
                                                                : Array.isArray(params.diagnosis) && params.diagnosis.length > 0
                                                                    ? procedures.filter(p => params.diagnosis.includes(p.id)).map(p => p.name).join(', ') || params.diagnosis.join(', ')
                                                                    : 'Select Procedures'}
                                                        </span>
                                                        <span className="ml-2 text-gray-400 flex-shrink-0">▾</span>
                                                    </button>
                                                    {procedureDropdownOpen && modalMode !== 'view' && params.provider_id && (
                                                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                            {procedures.length === 0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-400">No procedures assigned to this provider</div>
                                                            ) : procedures.map((proc: any) => {
                                                                const selected: string[] = Array.isArray(params.diagnosis) ? params.diagnosis : [];
                                                                return (
                                                                    <label key={proc.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox"
                                                                            checked={selected.includes(proc.id)}
                                                                            onChange={e => {
                                                                                const updated = e.target.checked
                                                                                    ? [...selected, proc.id]
                                                                                    : selected.filter((id: string) => id !== proc.id);
                                                                                setParams({ ...params, diagnosis: updated });
                                                                            }}
                                                                        />
                                                                        <span className="text-sm">{proc.name}</span>
                                                                        {proc.category && <span className="ml-auto text-xs text-gray-400">{proc.category}</span>}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {Array.isArray(params.diagnosis) && params.diagnosis.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {procedures.filter(p => params.diagnosis.includes(p.id)).map((p: any) => (
                                                            <span key={p.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded px-2 py-0.5">
                                                                {p.name}
                                                                {modalMode !== 'view' && (
                                                                    <button type="button" onClick={() => setParams({ ...params, diagnosis: params.diagnosis.filter((id: string) => id !== p.id) })}>×</button>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="rating">Rating (1-5) <span className="text-red-500">*</span></label>                                                <select
                                                    id="rating"
                                                    name="rating"
                                                    className={`form-select ${touched.rating && errors.rating ? 'border-red-500' : ''}`}
                                                    value={params.rating}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Rating</option>
                                                    <option value="1">1 - Poor</option>
                                                    <option value="2">2 - Fair</option>
                                                    <option value="3">3 - Good</option>
                                                    <option value="4">4 - Very Good</option>
                                                    <option value="5">5 - Excellent</option>
                                                </select>
                                                {touched.rating && errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="comment">Comment</label>
                                                <textarea
                                                    id="comment"
                                                    name="comment"
                                                    rows={4}
                                                    placeholder="Write your comment"
                                                    className="form-textarea"
                                                    value={params.comment}
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

export default ReviewsCRUD;
