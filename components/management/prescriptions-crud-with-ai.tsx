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
import MedicationAIInput from '@/components/ui/medication-ai-input';

const PrescriptionsCRUDWithAI = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
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
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        date_prescribed: '',
        instructions: '',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchItems();
    }, [pagination.page, pagination.limit, searchQuery]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`${API_ENDPOINTS.prescriptions}?${queryParams}`, {
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
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        
        if (!params.patient_id) { newErrors.patient_id = 'Patient is required.'; newTouched.patient_id = true; }
        if (!params.provider_id) { newErrors.provider_id = 'Provider is required.'; newTouched.provider_id = true; }
        if (!params.medication_name) { newErrors.medication_name = 'Medication name is required.'; newTouched.medication_name = true; }
        if (!params.dosage) { newErrors.dosage = 'Dosage is required.'; newTouched.dosage = true; }
        if (!params.frequency) { newErrors.frequency = 'Frequency is required.'; newTouched.frequency = true; }
        
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
            const url = params.id ? `${API_ENDPOINTS.prescriptions}/${params.id}` : API_ENDPOINTS.prescriptions;
            const method = params.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Prescription has been ${params.id ? 'updated' : 'created'} successfully.`);
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
        const json = JSON.parse(JSON.stringify(defaultValues));
        
        if (item) {
            Object.keys(item).forEach(key => {
                if (json.hasOwnProperty(key)) {
                    json[key] = item[key];
                }
            });
            
            if (item.date_prescribed) {
                let dateStr = item.date_prescribed;
                if (dateStr.includes('T')) {
                    dateStr = dateStr.split('T')[0];
                }
                json.date_prescribed = dateStr;
            }
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
                    const response = await fetch(`${API_ENDPOINTS.prescriptions}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Prescription has been deleted successfully.');
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
        const requiredFields: Record<string, string> = { 
            patient_id: 'Patient', 
            provider_id: 'Provider', 
            medication_name: 'Medication name',
            dosage: 'Dosage',
            frequency: 'Frequency'
        };
        if (requiredFields[name] && !value) {
            setErrors(prev => ({ ...prev, [name]: `${requiredFields[name]} is required.` }));
        } else {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`;
        } catch (error) {
            return '-';
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Prescriptions (AI-Powered)</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Prescription
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by medication, dosage, or frequency..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                {searchQuery && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setSearchQuery('');
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            Clear Search
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
                    <div className="panel mt-5 overflow-hidden border-0 p-0">
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Patient</th>
                                        <th>Provider</th>
                                        <th>Medication</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Date Prescribed</th>
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
                                                    ? `${item.provider_first_name} ${item.provider_last_name}`
                                                    : '-'}
                                            </td>
                                            <td>{item.medication_name || '-'}</td>
                                            <td>{item.dosage || '-'}</td>
                                            <td>{item.frequency || '-'}</td>
                                            <td>{formatDate(item.date_prescribed)}</td>
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
                                <DialogPanel className="panel my-8 w-full max-w-3xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Prescription
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
                                                        setParams((prev: any) => ({ ...prev, patient_id: val }));
                                                        if (errors.patient_id) setErrors(prev => { const n = { ...prev }; delete n.patient_id; return n; });
                                                    }}
                                                    placeholder="Select Patient"
                                                    disabled={modalMode === 'view'}
                                                    className={touched.patient_id && errors.patient_id ? 'border-red-500' : ''}
                                                />
                                                {touched.patient_id && errors.patient_id && <p className="mt-1 text-xs text-red-500">{errors.patient_id}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="provider_id">Provider <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    id="provider_id"
                                                    dropdownType="providers"
                                                    value={params.provider_id}
                                                    onChange={(val) => {
                                                        setParams((prev: any) => ({ ...prev, provider_id: val }));
                                                        if (errors.provider_id) setErrors(prev => { const n = { ...prev }; delete n.provider_id; return n; });
                                                    }}
                                                    placeholder="Select Provider"
                                                    disabled={modalMode === 'view'}
                                                    className={touched.provider_id && errors.provider_id ? 'border-red-500' : ''}
                                                />
                                                {touched.provider_id && errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="medication_name">Medication Name <span className="text-red-500">*</span></label>
                                                <MedicationAIInput
                                                    id="medication_name"
                                                    name="medication_name"
                                                    value={params.medication_name}
                                                    onChange={(val) => {
                                                        setParams((prev: any) => ({ ...prev, medication_name: val }));
                                                        if (errors.medication_name) setErrors(prev => { const n = { ...prev }; delete n.medication_name; return n; });
                                                    }}
                                                    onSelectDosage={(dosage) => {
                                                        setParams((prev: any) => ({ ...prev, dosage }));
                                                    }}
                                                    onSelectFrequency={(frequency) => {
                                                        setParams((prev: any) => ({ ...prev, frequency }));
                                                    }}
                                                    disabled={modalMode === 'view'}
                                                    placeholder="Type medication name (e.g., Paracetamol)..."
                                                    className={touched.medication_name && errors.medication_name ? 'border-red-500' : ''}
                                                />
                                                {touched.medication_name && errors.medication_name && <p className="mt-1 text-xs text-red-500">{errors.medication_name}</p>}
                                                <p className="text-xs text-gray-400 mt-1">✨ AI-powered suggestions from Google Gemini</p>
                                            </div>
                                            <div>
                                                <label htmlFor="dosage">Dosage <span className="text-red-500">*</span></label>
                                                <input
                                                    id="dosage"
                                                    type="text"
                                                    name="dosage"
                                                    placeholder="e.g., 500mg"
                                                    className={`form-input ${touched.dosage && errors.dosage ? 'border-red-500' : ''}`}
                                                    value={params.dosage}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    disabled={modalMode === 'view'}
                                                />
                                                {touched.dosage && errors.dosage && <p className="mt-1 text-xs text-red-500">{errors.dosage}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="frequency">Frequency <span className="text-red-500">*</span></label>
                                                <input
                                                    id="frequency"
                                                    type="text"
                                                    name="frequency"
                                                    placeholder="e.g., Twice daily"
                                                    className={`form-input ${touched.frequency && errors.frequency ? 'border-red-500' : ''}`}
                                                    value={params.frequency}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    disabled={modalMode === 'view'}
                                                />
                                                {touched.frequency && errors.frequency && <p className="mt-1 text-xs text-red-500">{errors.frequency}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="duration">Duration</label>
                                                <input
                                                    id="duration"
                                                    type="text"
                                                    name="duration"
                                                    placeholder="e.g., 7 days"
                                                    className="form-input"
                                                    value={params.duration}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="date_prescribed">Date Prescribed</label>
                                                <input
                                                    id="date_prescribed"
                                                    type="date"
                                                    name="date_prescribed"
                                                    className="form-input"
                                                    value={params.date_prescribed}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="instructions">Instructions</label>
                                                <textarea
                                                    id="instructions"
                                                    name="instructions"
                                                    rows={3}
                                                    placeholder="Special instructions"
                                                    className="form-textarea"
                                                    value={params.instructions}
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

export default PrescriptionsCRUDWithAI;
