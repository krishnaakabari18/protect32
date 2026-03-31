'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconFile from '@/components/icon/icon-file';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
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
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox' | 'api-select' | 'dependent-api-select' | 'multi-checkbox-select';
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    hideOnEdit?: boolean;
    hideOnCreate?: boolean;
    colSpan?: 1 | 2;
    // For api-select type
    apiEndpoint?: string;
    apiLabelKey?: string;
    apiValueKey?: string;
    apiLabelFormat?: (item: any) => string;
    // For dependent-api-select: fetch options based on another field's value
    dependsOn?: string;                          // key of the field this depends on
    dependentApiEndpoint?: (val: string) => string; // builds endpoint from parent value
    // For multi-checkbox-select: same as dependent-api-select but multi-select with checkboxes
}

interface GenericCRUDProps {
    title: string;
    endpoint: string;
    columns: Column[];
    formFields: FormField[];
    defaultValues: any;
    searchFields?: string[];
    hideDelete?: boolean;
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
    hideDelete = false,
    filterField,
}) => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [apiSelectOptions, setApiSelectOptions] = useState<Record<string, { value: string; label: string }[]>>({});
    const [dependentOptions, setDependentOptions] = useState<Record<string, { value: string; label: string }[]>>({});
    const [multiSelectOpen, setMultiSelectOpen] = useState<Record<string, boolean>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
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

    // Fetch options for api-select fields
    useEffect(() => {
        const apiSelectFields = formFields.filter(f => f.type === 'api-select' && f.apiEndpoint);
        apiSelectFields.forEach(async (field) => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE_URL}/${field.apiEndpoint}?limit=200`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    const items = data.data || [];
                    const valueKey = field.apiValueKey || 'id';
                    const options = items.map((item: any) => ({
                        value: String(item[valueKey]),
                        label: field.apiLabelFormat
                            ? field.apiLabelFormat(item)
                            : item[field.apiLabelKey || 'name'] || String(item[valueKey]),
                    }));
                    setApiSelectOptions(prev => ({ ...prev, [field.key]: options }));
                }
            } catch (e) {
                console.error(`Failed to fetch options for ${field.key}`, e);
            }
        });
    }, []);

    // Fetch dependent options when parent field value changes
    useEffect(() => {
        const dependentFields = formFields.filter(
            f => (f.type === 'dependent-api-select' || f.type === 'multi-checkbox-select') && f.dependsOn && f.dependentApiEndpoint
        );
        dependentFields.forEach(async (field) => {
            const parentVal = params[field.dependsOn!];
            if (!parentVal) {
                setDependentOptions(prev => ({ ...prev, [field.key]: [] }));
                return;
            }
            try {
                const token = localStorage.getItem('auth_token');
                const endpoint = field.dependentApiEndpoint!(parentVal);
                const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                });
                const data = await response.json();
                if (response.ok) {
                    const items = data.data || [];
                    const valueKey = field.apiValueKey || 'id';
                    const options = items.map((item: any) => ({
                        value: String(item[valueKey]),
                        label: field.apiLabelFormat
                            ? field.apiLabelFormat(item)
                            : item[field.apiLabelKey || 'name'] || String(item[valueKey]),
                    }));
                    setDependentOptions(prev => ({ ...prev, [field.key]: options }));
                }
            } catch (e) {
                console.error(`Failed to fetch dependent options for ${field.key}`, e);
            }
        });
    }, [formFields.filter(f => f.dependsOn).map(f => params[f.dependsOn!]).join(','), addModal]);

    // Close multi-select dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.multi-select-container')) {
                setMultiSelectOpen({});
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
        const newVal = type === 'checkbox' ? checked : value;
        const newParams = { ...params, [id]: newVal };
        // Reset dependent fields when parent changes
        formFields.forEach(f => {
            if (f.dependsOn === id) {
                newParams[f.key] = f.type === 'multi-checkbox-select' ? [] : '';
            }
        });
        setParams(newParams);
        if (errors[id]) {
            setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
        }
    };

    const handleBlur = (e: any) => {
        const { id } = e.target;
        setTouched(prev => ({ ...prev, [id]: true }));
        const field = formFields.find(f => f.key === id);
        if (field?.required && !params[id]) {
            setErrors(prev => ({ ...prev, [id]: `${field.label} is required.` }));
        } else {
            setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        for (const field of formFields) {
            if (modalMode === 'edit' && field.hideOnEdit) continue;
            if (modalMode === 'create' && field.hideOnCreate) continue;
            newTouched[field.key] = true;
            if (field.required && !params[field.key]) {
                newErrors[field.key] = `${field.label} is required.`;
            }
        }
        flushSync(() => {
            setTouched(newTouched);
            setErrors(newErrors);
        });
        if (Object.keys(newErrors).length > 0) {
            const firstKey = Object.keys(newErrors)[0];
            const modal = document.getElementById('generic-crud-modal-body');
            const el = (modal || document).querySelector(`[id="${firstKey}"]`) as HTMLElement;
            if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        return Object.keys(newErrors).length === 0;
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
                    // Convert empty strings to null for date fields
                    if (field.type === 'date' || field.type === 'datetime-local') {
                        if (params[field.key] === '') {
                            body[field.key] = null;
                        } else {
                            // For date fields, ensure we send only YYYY-MM-DD format
                            // This prevents timezone conversion issues
                            if (field.type === 'date') {
                                const dateValue = params[field.key];
                                // Extract just the date part if it has time component
                                body[field.key] = typeof dateValue === 'string' ? dateValue.split('T')[0] : dateValue;
                            } else {
                                body[field.key] = params[field.key];
                            }
                        }
                    } else {
                        body[field.key] = params[field.key];
                    }
                } else if (field.type === 'multi-checkbox-select') {
                    // Send as JSON array string or comma-separated
                    const val = params[field.key];
                    body[field.key] = Array.isArray(val) ? val.join(',') : (val || '');
                }
            });

            console.log('Sending to API:', body); // Debug log

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
        setTouched({});
        setErrors({});
        const json = JSON.parse(JSON.stringify(defaultValues));
        
        if (item) {
            // Format dates for date input fields (YYYY-MM-DD format)
            const formattedItem = { ...item };
            formFields.forEach(field => {
                // Parse multi-checkbox-select: stored as comma-separated string, needs to be array
                if (field.type === 'multi-checkbox-select') {
                    const val = formattedItem[field.key];
                    if (typeof val === 'string' && val) {
                        formattedItem[field.key] = val.split(',').map((s: string) => s.trim()).filter(Boolean);
                    } else if (!Array.isArray(val)) {
                        formattedItem[field.key] = [];
                    }
                }
                if ((field.type === 'date' || field.type === 'datetime-local') && formattedItem[field.key]) {                    const dateValue = formattedItem[field.key];                    if (dateValue) {
                        if (field.type === 'date') {
                            // For date fields, extract YYYY-MM-DD directly from the string
                            // This avoids timezone conversion issues
                            if (typeof dateValue === 'string') {
                                // Extract date part (YYYY-MM-DD) from ISO string or date string
                                const extractedDate = dateValue.split('T')[0];
                                console.log(`Date field ${field.key}: Original="${dateValue}" Extracted="${extractedDate}"`);
                                formattedItem[field.key] = extractedDate;
                            } else {
                                const date = new Date(dateValue);
                                if (!isNaN(date.getTime())) {
                                    formattedItem[field.key] = date.toISOString().split('T')[0];
                                }
                            }
                        } else {
                            // For datetime-local, format as YYYY-MM-DDTHH:mm
                            const date = new Date(dateValue);
                            if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                formattedItem[field.key] = `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                        }
                    }
                }
            });
            setParams(formattedItem);
        } else {
            setParams(json);
        }
        setMultiSelectOpen({});
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

    const exportToCSV = () => {
        if (items.length === 0) {
            showMessage('No data to export', 'error');
            return;
        }

        // Prepare CSV headers
        const headers = ['#', ...columns.map(col => col.label)];
        
        // Prepare CSV rows
        const rows = items.map((item, index) => {
            const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;
            const rowData = columns.map(col => {
                let value = item[col.key];
                
                // Handle rendered values
                if (col.render) {
                    const rendered = col.render(value, item);
                    // Extract text from React elements
                    if (typeof rendered === 'object' && rendered !== null) {
                        return ''; // Skip complex renders
                    }
                    return rendered || '';
                }
                
                // Handle null/undefined
                if (value === null || value === undefined) return '';
                
                // Handle dates
                if (col.key.includes('date') || col.key.includes('_at')) {
                    try {
                        return new Date(value).toLocaleDateString();
                    } catch {
                        return value;
                    }
                }
                
                return value;
            });
            
            return [rowNumber, ...rowData];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => {
                // Escape commas and quotes in cell content
                const cellStr = String(cell).replace(/"/g, '""');
                return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
            }).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('Data exported successfully');
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
                        {/* <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'list' && 'bg-primary text-white'}`} onClick={() => setViewMode('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'grid' && 'bg-primary text-white'}`} onClick={() => setViewMode('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div> */}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                            <option value={pagination.total || 1000}>All</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={fetchItems} className="btn btn-primary flex-1">
                            Refresh
                        </button>
                        <button onClick={exportToCSV} className="btn btn-success flex-1">
                            {/* <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> */}
                            Export CSV
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
                                    <th>#</th>
                                    {columns.map(col => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 2} className="text-center py-8">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item: any, index: number) => (
                                        <tr key={item.id}>
                                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
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
                                                    {!hideDelete && (
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteItem(item)}
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
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
                                    <div className="p-5" id="generic-crud-modal-body">
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
                                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                                </label>
                                                                {field.type === 'textarea' ? (
                                                                    <textarea
                                                                        id={field.key}
                                                                        rows={3}
                                                                        placeholder={field.placeholder}
                                                                        className={`form-textarea resize-none ${touched[field.key] && errors[field.key] ? 'border-red-500 focus:border-red-500' : ''}`}
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        onBlur={handleBlur}
                                                                        disabled={field.disabled}
                                                                    />
                                                                ) : field.type === 'select' ? (
                                                                    <select
                                                                        id={field.key}
                                                                        className={`form-select ${touched[field.key] && errors[field.key] ? 'border-red-500 focus:border-red-500' : ''}`}
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        onBlur={handleBlur}
                                                                        disabled={field.disabled}
                                                                    >
                                                                        {field.options?.map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.type === 'api-select' ? (
                                                                    <select
                                                                        id={field.key}
                                                                        className={`form-select ${touched[field.key] && errors[field.key] ? 'border-red-500 focus:border-red-500' : ''}`}
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        onBlur={handleBlur}
                                                                        disabled={field.disabled}
                                                                    >
                                                                        <option value="">{field.placeholder || `Select ${field.label}`}</option>
                                                                        {(apiSelectOptions[field.key] || []).map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.type === 'dependent-api-select' ? (
                                                                    <select
                                                                        id={field.key}
                                                                        className={`form-select ${touched[field.key] && errors[field.key] ? 'border-red-500 focus:border-red-500' : ''}`}
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        onBlur={handleBlur}
                                                                        disabled={field.disabled || !params[field.dependsOn!]}
                                                                    >
                                                                        <option value="">{!params[field.dependsOn!] ? `Select ${formFields.find(f => f.key === field.dependsOn)?.label || 'parent'} first` : (field.placeholder || `Select ${field.label}`)}</option>
                                                                        {(dependentOptions[field.key] || []).map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.type === 'multi-checkbox-select' ? (() => {
                                                                    const opts = dependentOptions[field.key] || [];
                                                                    const selected: string[] = Array.isArray(params[field.key]) ? params[field.key] : [];
                                                                    const isOpen = multiSelectOpen[field.key] || false;
                                                                    const parentVal = params[field.dependsOn!];
                                                                    return (
                                                                        <div className="relative multi-select-container">
                                                                            <button
                                                                                type="button"
                                                                                className={`form-input w-full text-left flex items-center justify-between ${touched[field.key] && errors[field.key] ? 'border-red-500' : ''}`}
                                                                                onClick={() => !field.disabled && parentVal && setMultiSelectOpen(p => ({ ...p, [field.key]: !p[field.key] }))}
                                                                                disabled={field.disabled || !parentVal}
                                                                            >
                                                                                <span className="truncate text-sm">
                                                                                    {!parentVal
                                                                                        ? `Select ${formFields.find(f => f.key === field.dependsOn)?.label || 'provider'} first`
                                                                                        : selected.length > 0
                                                                                            ? opts.filter(o => selected.includes(o.value)).map(o => o.label).join(', ')
                                                                                            : (field.placeholder || `Select ${field.label}`)}
                                                                                </span>
                                                                                <span className="ml-2 text-gray-400 flex-shrink-0">▾</span>
                                                                            </button>
                                                                            {isOpen && parentVal && (
                                                                                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                                                    {opts.length === 0 ? (
                                                                                        <div className="px-4 py-3 text-sm text-gray-400">No procedures assigned to this provider</div>
                                                                                    ) : opts.map(opt => (
                                                                                        <label key={opt.value} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                className="form-checkbox"
                                                                                                checked={selected.includes(opt.value)}
                                                                                                onChange={e => {
                                                                                                    const updated = e.target.checked
                                                                                                        ? [...selected, opt.value]
                                                                                                        : selected.filter(v => v !== opt.value);
                                                                                                    setParams((p: any) => ({ ...p, [field.key]: updated }));
                                                                                                }}
                                                                                            />
                                                                                            <span className="text-sm">{opt.label}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            {selected.length > 0 && (
                                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                                    {opts.filter(o => selected.includes(o.value)).map(o => (
                                                                                        <span key={o.value} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded px-2 py-0.5">
                                                                                            {o.label}
                                                                                            {!field.disabled && <button type="button" onClick={() => setParams((p: any) => ({ ...p, [field.key]: selected.filter(v => v !== o.value) }))}>×</button>}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })() : field.type === 'checkbox' ? (
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
                                                                        className={`form-input ${touched[field.key] && errors[field.key] ? 'border-red-500 focus:border-red-500' : ''}`}
                                                                        value={params[field.key] || ''}
                                                                        onChange={changeValue}
                                                                        onBlur={handleBlur}
                                                                        disabled={field.disabled}
                                                                    />
                                                                )}
                                                                {touched[field.key] && errors[field.key] && (
                                                                    <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
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
