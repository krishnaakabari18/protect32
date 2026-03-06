'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';

const PROCEDURE_CATEGORIES = [
    {
        label: 'Diagnostic & Preventive',
        procedures: [
            'Check up (Exam)',
            'Digital X-Ray (IOPA)',
            'OPG',
            'Other X-Rays',
            'Blood glucose level test – in-office using a glucose meter',
            'Pulp vitality tests',
            'Diagnostic casts',
            'Teeth Cleaning / Oral Prophylaxis',
            'Topical Fluoride',
            'Nutritional counseling for control of dental disease',
            'Tobacco counseling for control and prevention of oral disease',
            'Oral hygiene instructions',
            'Sealant – per tooth',
            'Preventive resin restoration – Permanent tooth',
            'Application of caries arresting medicament – per tooth',
            'Space maintainer',
        ]
    },
    {
        label: 'Restorative',
        procedures: [
            'Amalgam (surfaces - 1234)',
            'Resin-based composite (Surfaces - 1234) (Anterior / Posterior)',
            'Crown – resin-based composite',
            'Crown -- Different types (Metal / PFM / Zirconia)',
            'Core-Build Up (Amalgam / Composite)',
            'Pin Retention - per tooth in restoration',
            'Post & Core - per tooth',
            'Veneer - Per tooth',
        ]
    },
    {
        label: 'Endodontic',
        procedures: [
            'Pulp cap only (Direct / Indirect)',
            'Therapeutic pulpotomy',
            'RCT (Anterior / Bicuspid / Molar)',
            'Re-RCT (Anterior / Bicuspid / Molar)',
            'Apexification per tooth',
            'Apicoectomy (Anterior / Bicuspid / Molar) - No of roots',
            'Bone graft in conjunction with periradicular surgery – per tooth, single site',
            'Retrograde filling – per root',
            'Root amputation – per root',
        ]
    },
    {
        label: 'Periodontal',
        procedures: [
            'Gingivectomy or Gingivoplasty -- (to allow access for restorative procedure, per tooth / 1 to 3 contiguous teeth or tooth bounded spaces per quadrant / 4 or more contiguous teeth or tooth-bounded spaces per quadrant)',
            'Gingival flap procedure (1 to 3 contiguous teeth or tooth bounded spaces per quadrant / 4 or more contiguous teeth or tooth-bounded spaces per quadrant)',
            'Clinical crown lengthening hard tissue',
            'Osseous surgery (including flap and closure -- 1234)',
            'Bone replacement graft per site',
        ]
    },
    {
        label: 'Prosthodontics, Removable',
        procedures: [
            'Complete denture - per arch',
            'Immediate denture - per arch',
            'RPD - per arch (Resin base / Cast Metal / Flexible Base)',
            'Denture repair -- CD, RPD etc.',
            'Overdenture - per arch',
        ]
    },
    {
        label: 'Implant',
        procedures: [
            'Surgical placement of implant body - per endosteal implant',
            'Implant removal',
            'Debridement of a peri-implant defect',
            'Bone graft at time of implant placement per tooth',
        ]
    },
    {
        label: 'Prosthodontics, Fixed',
        procedures: [
            'Pontic (Different types)',
            'Crown (Different types)',
            'Re-cement or re-bond bridge',
            'Stress breaker',
            'Precision attachments',
        ]
    },
    {
        label: 'OS',
        procedures: [
            'Extraction – coronal remnants, deciduous tooth per tooth',
            'Extraction – erupted tooth or exposed root (elevation and/or forcep removal) per tooth',
            'Surgical removal of an erupted tooth',
            'Removal of impacted tooth – soft tissue, partially bony, completely bony',
            'Surgical removal of residual tooth roots',
            'Alveoloplasty in conjunction with extractions',
            'Alveoloplasty not in conjunction with extractions',
            'Vestibuloplasty',
            'Excision of benign lesion (up to 1.25 cm / > 1.25 cm / complicated)',
            'Frenectomy per site',
        ]
    },
    {
        label: 'Ortho',
        procedures: [
            'Orthodontic Treatment - (Metal, Ceramic, Aligners)',
        ]
    },
    {
        label: 'Adjunctive',
        procedures: [
            'Administration of nitrous oxide/anxiolysis, analgesia',
            'Fabrication of athletic mouth-guard / Occlusal Guard',
            'External bleaching – per tooth / Arch',
            'Internal bleaching – per tooth',
            'Teledentistry',
        ]
    },
];

const ProviderFeesCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [addProcedureModal, setAddProcedureModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [procedures, setProcedures] = useState<any[]>([]);
    const [procedureCategories, setProcedureCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const defaultValues = {
        id: null,
        provider_id: '',
        procedure: '',
        fee: '',
        discount_percent: 0,
        status: 'approved',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    
    const [newProcedure, setNewProcedure] = useState({
        name: '',
        category: 'Diagnostic & Preventive',
    });

    useEffect(() => {
        fetchProviders();
        fetchProceduresByCategory();
        fetchItems();
    }, [pagination.page, pagination.limit, selectedProvider]);

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.users}?user_type=provider&limit=1000`, {
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

    const fetchProcedures = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.procedures}?is_active=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setProcedures(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching procedures:', error);
        }
    };

    const fetchProceduresByCategory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.procedures}/by-category`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Transform the data to match our component structure
                const categories = data.data.map((item: any) => ({
                    label: item.category,
                    procedures: item.procedures.map((p: any) => p.name)
                }));
                setProcedureCategories(categories);
            }
        } catch (error) {
            console.error('Error fetching procedures by category:', error);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: search,
                ...(selectedProvider && { provider_id: selectedProvider }),
            });

            const response = await fetch(`${API_ENDPOINTS.providerFees}?${queryParams}`, {
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
            console.error('Error fetching provider fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchItems();
    };

    const validateForm = () => {
        if (!params.provider_id || !params.procedure || !params.fee) {
            showMessage('Please fill all required fields', 'error');
            return false;
        }
        return true;
    };

    const saveItem = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.providerFees}/${params.id}` : API_ENDPOINTS.providerFees;
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
                showMessage(`Provider fee has been ${params.id ? 'updated' : 'created'} successfully.`);
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
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_ENDPOINTS.providerFees}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Provider fee has been deleted successfully.');
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
        const { name, value, type, checked } = e.target;
        setParams({ ...params, [name]: type === 'checkbox' ? checked : value });
    };

    const calculateFinalPrice = (fee: number, discount: number) => {
        return fee - (fee * discount / 100);
    };

    // Check if a procedure is already added for the current provider
    const isProcedureUsed = (procedureName: string) => {
        if (modalMode !== 'edit') return false;
        
        // Find all procedures for the current provider, excluding the current item being edited
        return items.some(item => 
            item.provider_id === params.provider_id && 
            item.procedure === procedureName &&
            item.id !== params.id
        );
    };

    const saveProcedure = async () => {
        if (!newProcedure.name) {
            showMessage('Please enter procedure name', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(API_ENDPOINTS.procedures, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(newProcedure),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Procedure added successfully');
                setAddProcedureModal(false);
                setNewProcedure({ name: '', category: 'Diagnostic & Preventive' });
                fetchProceduresByCategory();
                // Set the newly added procedure as selected
                setParams({ ...params, procedure: data.data.name });
            } else {
                showMessage(data.error || 'Failed to add procedure', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Treatment Fees & Discounts</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Fee
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
                    <div>
                        <select
                            className="form-select"
                            value={selectedProvider}
                            onChange={(e) => {
                                setSelectedProvider(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Providers</option>
                            {providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.first_name} {provider.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Procedures"
                            className="peer form-input w-full sm:w-auto ltr:pr-11 rtl:pl-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            type="button"
                            className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
                            onClick={handleSearch}
                        >
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
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
                                            <th>Procedure</th>
                                            <th>Provider</th>
                                            <th>Your Fee (₹)</th>
                                            <th>Discount (%)</th>
                                            <th>Final Price (₹)</th>
                                            <th>Status</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                                <td>
                                                    <div className="whitespace-nowrap font-semibold">{item.procedure}</div>
                                                </td>
                                                <td>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>₹{parseFloat(item.fee).toFixed(2)}</td>
                                                <td>{item.discount_percent}%</td>
                                                <td className="font-semibold text-success">
                                                    ₹{calculateFinalPrice(parseFloat(item.fee), item.discount_percent).toFixed(2)}
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
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
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={item.id}>
                                    <div className="bg-gradient-to-r from-primary to-primary-light p-6 pb-0">
                                        <div className="text-white text-3xl font-bold mb-2">
                                            ₹{calculateFinalPrice(parseFloat(item.fee), item.discount_percent).toFixed(2)}
                                        </div>
                                        {item.discount_percent > 0 && (
                                            <div className="text-white/80 text-sm line-through">
                                                ₹{parseFloat(item.fee).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-6 pb-6 pt-4">
                                        <div className="text-lg font-semibold mb-2">{item.procedure}</div>
                                        <div className="text-white-dark text-sm mb-3">
                                            {item.provider_first_name && item.provider_last_name
                                                ? `${item.provider_first_name} ${item.provider_last_name}`
                                                : 'No Provider'}
                                        </div>
                                        {item.discount_percent > 0 && (
                                            <div className="mb-3">
                                                <span className="badge bg-success">{item.discount_percent}% OFF</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2 items-center justify-center mt-4">
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
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Treatment Fee
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label htmlFor="provider_id">Provider *</label>
                                                <select
                                                    id="provider_id"
                                                    name="provider_id"
                                                    className="form-select"
                                                    value={params.provider_id}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view' || modalMode === 'edit'}
                                                >
                                                    <option value="">Select Provider</option>
                                                    {providers.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            {provider.first_name} {provider.last_name} ({provider.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label htmlFor="procedure">Procedure *</label>
                                                    {modalMode !== 'view' && modalMode !== 'edit' && (
                                                        <button
                                                            type="button"
                                                            className="text-primary text-sm hover:underline"
                                                            onClick={() => setAddProcedureModal(true)}
                                                        >
                                                            + Add New Procedure
                                                        </button>
                                                    )}
                                                </div>
                                                <select
                                                    id="procedure"
                                                    name="procedure"
                                                    className="form-select"
                                                    value={params.procedure}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Procedure</option>
                                                    {procedureCategories.map((category) => (
                                                        <optgroup key={category.label} label={category.label}>
                                                            {category.procedures.map((proc: string) => {
                                                                const isUsed = isProcedureUsed(proc);
                                                                return (
                                                                    <option 
                                                                        key={proc} 
                                                                        value={proc}
                                                                        disabled={isUsed}
                                                                        style={isUsed ? { color: '#999', fontStyle: 'italic' } : {}}
                                                                    >
                                                                        {proc}{isUsed ? ' (Already added)' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="fee">Your Fee (₹) *</label>
                                                <input
                                                    id="fee"
                                                    type="number"
                                                    name="fee"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    className="form-input"
                                                    value={params.fee}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="discount_percent">Discount Percent (%)</label>
                                                <input
                                                    id="discount_percent"
                                                    type="number"
                                                    name="discount_percent"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                    className="form-input"
                                                    value={params.discount_percent}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            {params.fee && params.discount_percent > 0 && (
                                                <div className="bg-success-light p-4 rounded-lg">
                                                    <div className="text-sm text-white-dark mb-1">Final Price After Discount:</div>
                                                    <div className="text-2xl font-bold text-success">
                                                        ₹{calculateFinalPrice(parseFloat(params.fee || 0), params.discount_percent).toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label htmlFor="status">Status</label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    className="form-select"
                                                    value={params.status}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="approved">Approved</option>
                                                    <option value="pending">Pending</option>
                                                </select>
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

            {/* Add Procedure Modal */}
            <Transition appear show={addProcedureModal} as={Fragment}>
                <Dialog as="div" open={addProcedureModal} onClose={() => setAddProcedureModal(false)}>
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
                                <DialogPanel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Add New Procedure</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddProcedureModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="proc_category">Category *</label>
                                                <select
                                                    id="proc_category"
                                                    className="form-select"
                                                    value={newProcedure.category}
                                                    onChange={(e) => setNewProcedure({ ...newProcedure, category: e.target.value })}
                                                >
                                                    <option value="Diagnostic & Preventive">Diagnostic & Preventive</option>
                                                    <option value="Restorative">Restorative</option>
                                                    <option value="Endodontic">Endodontic</option>
                                                    <option value="Periodontal">Periodontal</option>
                                                    <option value="Prosthodontics, Removable">Prosthodontics, Removable</option>
                                                    <option value="Implant">Implant</option>
                                                    <option value="Prosthodontics, Fixed">Prosthodontics, Fixed</option>
                                                    <option value="OS">OS</option>
                                                    <option value="Ortho">Ortho</option>
                                                    <option value="Adjunctive">Adjunctive</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="proc_name">Procedure Name *</label>
                                                <input
                                                    id="proc_name"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Enter procedure name"
                                                    value={newProcedure.name}
                                                    onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center mt-8 gap-3">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddProcedureModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary" onClick={saveProcedure} disabled={loading}>
                                                {loading ? 'Adding...' : 'Add Procedure'}
                                            </button>
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

export default ProviderFeesCRUD;
