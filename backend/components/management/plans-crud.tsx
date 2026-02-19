'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const PlansCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const defaultValues = {
        id: null,
        title: '',
        provider_id: '',
        price: '',
        max_members: 1,
        discount_percent: 0,
        free_checkups_annually: 0,
        free_cleanings_annually: 0,
        free_xrays_annually: 0,
        is_popular: false,
        is_active: true,
        features: '',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    useEffect(() => {
        fetchProviders();
        fetchItems();
    }, [pagination.page, pagination.limit]);

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/users?user_type=provider&limit=1000`, {
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
                search: search,
            });

            const response = await fetch(`${API_URL}/plans?${queryParams}`, {
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
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchItems();
    };

    const validateForm = () => {
        if (!params.title || !params.price) {
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
            const url = params.id ? `${API_URL}/plans/${params.id}` : `${API_URL}/plans`;
            const method = params.id ? 'PUT' : 'POST';

            const body: any = { ...params };
            
            // Convert features from comma-separated string to array
            if (typeof body.features === 'string') {
                body.features = body.features.split(',').map((f: string) => f.trim()).filter((f: string) => f);
            }
            
            // Convert empty provider_id to null
            if (body.provider_id === '') {
                body.provider_id = null;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Plan has been ${params.id ? 'updated' : 'created'} successfully.`);
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
            
            // Convert features array to comma-separated string for editing
            if (Array.isArray(json.features)) {
                json.features = json.features.join(', ');
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
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_URL}/plans/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Plan has been deleted successfully.');
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

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Plans</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Plan
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
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Plans"
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
                                            <th>Title</th>
                                            <th>Provider</th>
                                            <th>Price</th>
                                            <th>Max Members</th>
                                            <th>Discount</th>
                                            <th>Popular</th>
                                            <th>Status</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="whitespace-nowrap">{item.title}</div>
                                                </td>
                                                <td>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>${parseFloat(item.price).toFixed(2)}</td>
                                                <td>{item.max_members || '-'}</td>
                                                <td>{item.discount_percent}%</td>
                                                <td>
                                                    <span className={`badge ${item.is_popular ? 'bg-success' : 'bg-secondary'}`}>
                                                        {item.is_popular ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
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
                                    <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                        <div className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0">
                                            <div className="text-primary text-4xl mb-2">
                                                <IconDollarSign className="w-16 h-16 mx-auto" />
                                            </div>
                                        </div>
                                        <div className="px-6 pb-24 -mt-10 relative">
                                            <div className="shadow-md bg-white dark:bg-gray-900 rounded-md px-2 py-4">
                                                <div className="text-xl font-semibold">{item.title}</div>
                                                <div className="text-white-dark text-sm mt-1">
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `${item.provider_first_name} ${item.provider_last_name}`
                                                        : 'General Plan'}
                                                </div>
                                                <div className="text-2xl font-bold text-primary mt-3">
                                                    ${parseFloat(item.price).toFixed(2)}
                                                </div>
                                                <div className="flex items-center justify-center gap-2 mt-2">
                                                    {item.is_popular && (
                                                        <span className="badge bg-success">Popular</span>
                                                    )}
                                                    <span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 items-center justify-center mt-4">
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
                                <DialogPanel className="panel my-8 w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Plan
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label htmlFor="title">Plan Title *</label>
                                                <input
                                                    id="title"
                                                    type="text"
                                                    name="title"
                                                    placeholder="Enter plan title"
                                                    className="form-input"
                                                    value={params.title}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
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
                                                    <option value="">No Provider (General Plan)</option>
                                                    {providers.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            {provider.first_name} {provider.last_name} ({provider.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="price">Price *</label>
                                                <input
                                                    id="price"
                                                    type="number"
                                                    name="price"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    className="form-input"
                                                    value={params.price}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="max_members">Max Members</label>
                                                <input
                                                    id="max_members"
                                                    type="number"
                                                    name="max_members"
                                                    placeholder="1"
                                                    className="form-input"
                                                    value={params.max_members}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="discount_percent">Discount Percent</label>
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
                                            <div>
                                                <label htmlFor="free_checkups_annually">Free Checkups/Year</label>
                                                <input
                                                    id="free_checkups_annually"
                                                    type="number"
                                                    name="free_checkups_annually"
                                                    placeholder="0"
                                                    className="form-input"
                                                    value={params.free_checkups_annually}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="free_cleanings_annually">Free Cleanings/Year</label>
                                                <input
                                                    id="free_cleanings_annually"
                                                    type="number"
                                                    name="free_cleanings_annually"
                                                    placeholder="0"
                                                    className="form-input"
                                                    value={params.free_cleanings_annually}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="free_xrays_annually">Free X-rays/Year</label>
                                                <input
                                                    id="free_xrays_annually"
                                                    type="number"
                                                    name="free_xrays_annually"
                                                    placeholder="0"
                                                    className="form-input"
                                                    value={params.free_xrays_annually}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="features">Features (comma separated)</label>
                                                <textarea
                                                    id="features"
                                                    name="features"
                                                    rows={3}
                                                    placeholder="Feature 1, Feature 2, Feature 3"
                                                    className="form-textarea"
                                                    value={params.features}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="is_popular"
                                                        className="form-checkbox"
                                                        checked={params.is_popular}
                                                        onChange={changeValue}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                    <span className="text-white-dark ml-2">Mark as Popular</span>
                                                </label>
                                            </div>
                                            <div>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="is_active"
                                                        className="form-checkbox"
                                                        checked={params.is_active}
                                                        onChange={changeValue}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                    <span className="text-white-dark ml-2">Active</span>
                                                </label>
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

export default PlansCRUD;
