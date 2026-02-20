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

const SupportTicketsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const [filterProvider, setFilterProvider] = useState('');
    
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
        subject: '',
        description: '',
        status: 'Open',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    
    // Reply functionality
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);

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
        fetchPatients();
        fetchProviders();
        fetchItems();
    }, [pagination.page, pagination.limit, filterStatus, filterFromDate, filterToDate, filterProvider]);

    useEffect(() => {
        if (params.patient_id) {
            const patient = patients.find(p => p.id === params.patient_id);
            setSelectedPatient(patient);
        } else {
            setSelectedPatient(null);
        }
    }, [params.patient_id, patients]);

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
                ...(filterStatus && { status: filterStatus }),
                ...(filterFromDate && { from_date: filterFromDate }),
                ...(filterToDate && { to_date: filterToDate }),
                ...(filterProvider && { provider_id: filterProvider }),
            });

            const response = await fetch(`${API_ENDPOINTS.supportTickets}?${queryParams}`, {
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
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!params.patient_id || !params.subject || !params.description) {
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
            const url = params.id ? `${API_ENDPOINTS.supportTickets}/${params.id}` : API_ENDPOINTS.supportTickets;
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
                showMessage(`Support ticket has been ${params.id ? 'updated' : 'created'} successfully.`);
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

    const fetchReplies = async (ticketId: string) => {
        setLoadingReplies(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.supportTickets}/${ticketId}/replies`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setReplies(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching replies:', error);
        } finally {
            setLoadingReplies(false);
        }
    };

    const sendReply = async () => {
        if (!replyMessage.trim()) {
            showMessage('Please enter a message', 'error');
            return;
        }

        if (params.status === 'Closed') {
            showMessage('Cannot reply to a closed ticket', 'error');
            return;
        }

        setSendingReply(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.supportTickets}/${params.id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ message: replyMessage }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Reply sent successfully');
                setReplyMessage('');
                fetchReplies(params.id);
                fetchItems(); // Refresh list to update status if changed
            } else {
                showMessage(data.error || 'Failed to send reply', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setSendingReply(false);
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
            
            // Fetch replies if viewing or editing
            if (mode === 'view' || mode === 'edit') {
                fetchReplies(item.id);
            }
        } else {
            setReplies([]);
        }
        
        setReplyMessage('');
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
                    const response = await fetch(`${API_ENDPOINTS.supportTickets}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Support ticket has been deleted successfully.');
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
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Support Tickets</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Ticket
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
                    <input
                        type="date"
                        className="form-input"
                        placeholder="From Date"
                        value={filterFromDate}
                        onChange={(e) => {
                            setFilterFromDate(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div>
                    <input
                        type="date"
                        className="form-input"
                        placeholder="To Date"
                        value={filterToDate}
                        onChange={(e) => {
                            setFilterToDate(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
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
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                {(filterFromDate || filterToDate || filterProvider || filterStatus) && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setFilterFromDate('');
                                setFilterToDate('');
                                setFilterProvider('');
                                setFilterStatus('');
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
                                            <th>Patient</th>
                                            <th>Phone</th>
                                            <th>Provider</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Created Date</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.patient_first_name && item.patient_last_name
                                                        ? `${item.patient_first_name} ${item.patient_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>{item.patient_phone || '-'}</td>
                                                <td>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `Dr. ${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>{item.subject}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        item.status === 'Open' ? 'bg-info' :
                                                        item.status === 'In Progress' ? 'bg-warning' :
                                                        'bg-success'
                                                    }`}>
                                                        {item.status}
                                                    </span>
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
                                        <div className="text-white-dark text-sm mb-3">
                                            {item.patient_phone}
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
                                                <span className="text-white-dark">Subject:</span>
                                                <span className="truncate">{item.subject}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Created:</span>
                                                <span>{formatDate(item.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <span className={`badge ${
                                                item.status === 'Open' ? 'bg-info' :
                                                item.status === 'In Progress' ? 'bg-warning' :
                                                'bg-success'
                                            }`}>
                                                {item.status}
                                            </span>
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
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Support Ticket
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
                                                <label htmlFor="patient_phone">Patient Phone</label>
                                                <input
                                                    id="patient_phone"
                                                    type="text"
                                                    className="form-input bg-gray-100"
                                                    value={selectedPatient?.mobile_number || ''}
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-span-2">
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
                                            <div className="col-span-2">
                                                <label htmlFor="subject">Subject *</label>
                                                <input
                                                    id="subject"
                                                    type="text"
                                                    name="subject"
                                                    placeholder="Enter ticket subject"
                                                    className="form-input"
                                                    value={params.subject}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="description">Description *</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={4}
                                                    placeholder="Enter ticket description"
                                                    className="form-textarea"
                                                    value={params.description}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
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
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Conversation Thread - Show only in view/edit mode */}
                                        {(modalMode === 'view' || modalMode === 'edit') && params.id && (
                                            <div className="mt-6 border-t pt-6">
                                                <h6 className="text-lg font-semibold mb-4">Conversation Thread</h6>
                                                
                                                {/* Replies List */}
                                                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                                    {loadingReplies ? (
                                                        <div className="flex justify-center py-4">
                                                            <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-8 h-8 inline-block"></span>
                                                        </div>
                                                    ) : replies.length === 0 ? (
                                                        <div className="text-center py-4 text-gray-500">
                                                            No replies yet. Be the first to reply!
                                                        </div>
                                                    ) : (
                                                        replies.map((reply: any) => (
                                                            <div 
                                                                key={reply.id} 
                                                                className={`p-4 rounded-lg ${
                                                                    reply.user_type === 'patient' 
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                                                                        : 'bg-green-50 dark:bg-green-900/20'
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0">
                                                                        {reply.profile_picture ? (
                                                                            <img 
                                                                                src={reply.profile_picture} 
                                                                                alt={reply.first_name}
                                                                                className="w-10 h-10 rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                                                                                {reply.first_name?.charAt(0)}{reply.last_name?.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-semibold">
                                                                                {reply.first_name} {reply.last_name}
                                                                            </span>
                                                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                                                                reply.user_type === 'patient' 
                                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                                                                                    : reply.user_type === 'provider'
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                                                            }`}>
                                                                                {reply.user_type === 'provider' ? 'Provider' : reply.user_type === 'patient' ? 'Patient' : 'Admin'}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {formatDate(reply.created_at)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Reply Input */}
                                                {params.status !== 'Closed' ? (
                                                    <div className="mt-4">
                                                        <label htmlFor="reply_message" className="block mb-2 font-semibold">Add Reply</label>
                                                        <textarea
                                                            id="reply_message"
                                                            rows={3}
                                                            placeholder="Type your reply here..."
                                                            className="form-textarea"
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-primary mt-2"
                                                            onClick={sendReply}
                                                            disabled={sendingReply || !replyMessage.trim()}
                                                        >
                                                            {sendingReply ? 'Sending...' : 'Send Reply'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                            This ticket is closed. Change the status to "Open" or "In Progress" to continue the conversation.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

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

export default SupportTicketsCRUD;
