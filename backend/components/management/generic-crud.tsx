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
import { API_BASE_URL } from '@/config/api.config';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface FormField {
    key: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox';
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    hideOnEdit?: boolean;
    hideOnCreate?: boolean;
    colSpan?: 1 | 2;
}

interface GenericCRUDProps {
    title: string;
    endpoint: string;
    columns: Column[];
    formFields: FormField[];
    defaultValues: any;
    searchFields?: string[];
    filterField?: {
        key: string;
        label: string;
        options: { value: string; label: string }[];
    };
}

const GenericCRUD: React.FC<GenericCRUDProps> = ({
    title,
    endpoint,
    columns,
    formFields,
    defaultValues,
    searchFields = [],
    filterField,
}) => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterValue, setFilterValue] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    useEffect(() => {
        fetchItems();
    }, [pagination.page, pagination.limit, filterValue]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterValue && filterField && { [filterField.key]: filterValue }),
            });

            const response = await fetch(`${API_BASE_URL}/${endpoint}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setItems(data.data || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else {
                showMessage(data.error || 'Failed to fetch data', 'error');
            }
        } catch (error: any) {
            showMessage('Error fetching data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const searchItems = () => {
        if (!search) {
            fetchItems();
            return;
        }
        
        const filtered = items.filter((item: any) => {
            return searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(search.toLowerCase());
            });
        });
        
        setItems(filtered);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchItems();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const changeValue = (e: any) => {
        const { value, id, type, checked } = e.target;
        setParams({ ...params, [id]: type === 'checkbox' ? checked : value });
    };

    const validateForm = () => {
        for (const field of formFields) {
            if (field.required && !params[field.key]) {
                if (modalMode === 'edit' && field.hideOnEdit) continue;
                if (modalMode === 'create' && field.hideOnCreate) continue;
                showMessage(`${field.label} is required.`, 'error');
                return false;
            }
        }
        return true;
    };

    const saveItem = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_BASE_URL}/${endpoint}/${params.id}` : `${API_BASE_URL}/${endpoint}`;
            const method = params.id ? 'PUT' : 'POST';

            const body: any = {};
            formFields.forEach(field => {
                if (modalMode === 'edit' && field.hideOnEdit) return;
                if (modalMode === 'create' && field.hideOnCreate) return;
                if (params[field.key] !== undefined && params[field.key] !== null) {
                    body[field.key] = params[field.key];
                }
            });

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
                showMessage(`${title} has been ${params.id ? 'updated' : 'created'} successfully.`);
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
        setParams(item || json);
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete this ${title.toLowerCase()}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE_URL}/${endpoint}/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });

                if (response.ok) {
                    showMessage(`${title} has been deleted successfully.`);
                    fetchItems();
                } else {
                    const data = await response.json();
                    showMessage(data.error || 'Delete failed', 'error');
                }
            } catch (error: any) {
                showMessage('Error: ' + error.message, 'error');
            }
        }
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

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl">{title}</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add {title}
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'list' && 'bg-primary text-white'}`} onClick={() => setViewMode('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'grid' && 'bg-primary text-white'}`} onClick={() => setViewMode('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={`Search ${title}`}
                            className="peer form-input py-2 ltr:pr-11 rtl:pl-11" 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                        <button type="button" className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="panel mt-5 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {filterField && (
                        <div>
                            <label className="block text-sm font-medium mb-1">{filterField.label}</label>
                            <select
                                value={filterValue}
                                onChange={(e) => {
                                    setFilterValue(e.target.value);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className="form-select"
                            >
                                <option value="">All</option>
                                {filterField.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Items per page</label>
                        <select
                            value={pagination.limit}
                            onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
                            className="form-select"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchItems} className="btn btn-primary w-full">
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="panel mt-5 flex items-center justify-center p-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <span className="ml-3">Loading...</span>
                </div>
            )}

            {!loading && viewMode === 'list' && (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-8">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item: any) => (
                                        <tr key={item.id}>
                                            {columns.map(col => (
                                                <td key={col.key}>
                                                    {col.render ? col.render(item[col.key], item) : (item[col.key] || '-')}
                                                </td>
                                            ))}
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => openModal('view', item)}
                                                    >
                                                        <IconEye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openModal('edit', item)}
                                                    >
                                                        <IconPencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteItem(item)}
                                                    >
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
                </div>
            )}

            {/* Modal */}
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={() => setAddModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {modalMode === 'create' ? `Add ${title}` : modalMode === 'edit' ? `Edit ${title}` : `View ${title}`}
                                    </div>
                                    <div className="p-5">
                                        {modalMode === 'view' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {formFields.map(field => (
                                                    <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                                        <p className="text-gray-900 dark:text-white">
                                                            {field.type === 'checkbox' 
                                                                ? (params[field.key] ? 'Yes' : 'No')
                                                                : (params[field.key] || '-')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <form>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {formFields.map(field => {
                                                        if (modalMode === 'edit' && field.hideOnEdit) return null;
                                                        if (modalMode === 'create' && field.hideOnCreate) return null;
                                                        
                                                        return (
                                                            <div key={field.key} className={`mb-5 ${field.colSpan === 2 ? 'col-span-2' : ''}`}>
                                                                <label htmlFor={field.key}>
                                                                    {field.label} {field.required && '*'}
                                                                </label>
                                                                {field.type === 'textarea' ? (
                                                                    <textarea
                                                                        id={field.key}
                                                                        rows={3}
                                                                        placeholder={field.placeholder}
                                                                        className="form-textarea resize-none"
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        disabled={field.disabled}
                                                                    />
                                                                ) : field.type === 'select' ? (
                                                                    <select
                                                                        id={field.key}
                                                                        className="form-select"
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        disabled={field.disabled}
                                                                    >
                                                                        {field.options?.map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.type === 'checkbox' ? (
                                                                    <label className="inline-flex cursor-pointer">
                                                                        <input
                                                                            id={field.key}
                                                                            type="checkbox"
                                                                            className="form-checkbox"
                                                                            checked={params[field.key] || false}
                                                                            onChange={changeValue}
                                                                            disabled={field.disabled}
                                                                        />
                                                                        <span className="ltr:ml-2 rtl:mr-2">{field.placeholder}</span>
                                                                    </label>
                                                                ) : (
                                                                    <input
                                                                        id={field.key}
                                                                        type={field.type}
                                                                        placeholder={field.placeholder}
                                                                        className="form-input"
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        disabled={field.disabled}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-8 flex items-center justify-end gap-3">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>
                                                        {loading ? 'Saving...' : modalMode === 'create' ? 'Add' : 'Update'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
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

export default GenericCRUD;
