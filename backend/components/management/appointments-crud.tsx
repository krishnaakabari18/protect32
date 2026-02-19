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

const AppointmentsCRUD = () => {
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
        appointment_date: '',
        start_time: '',
        end_time: '',
        duration_minutes: 30,
        service: '',
        status: 'Upcoming',
        notes: '',
        cancellation_reason: '',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    // Helper function to format date safely
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            // Extract just the date part (YYYY-MM-DD)
            const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`;
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
        generateTimeSlots();
    }, [params.duration_minutes]);

    useEffect(() => {
        if (params.start_time && params.duration_minutes) {
            calculateEndTime();
        }
    }, [params.start_time, params.duration_minutes]);

    const generateTimeSlots = () => {
        const slots: string[] = [];
        const duration = parseInt(params.duration_minutes) || 30;
        
        for (let hour = 8; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += duration) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        setTimeSlots(slots);
    };

    const calculateEndTime = () => {
        if (!params.start_time || !params.duration_minutes) return;
        
        const [hours, minutes] = params.start_time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + parseInt(params.duration_minutes);
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        setParams((prev: any) => ({ ...prev, end_time: endTime }));
    };

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Fetch from patients endpoint to ensure they have patient records
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
            // Fetch from providers endpoint to ensure they have provider records
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

            const response = await fetch(`${API_ENDPOINTS.appointments}?${queryParams}`, {
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
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!params.patient_id || !params.provider_id || !params.appointment_date || !params.start_time) {
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
            const url = params.id ? `${API_ENDPOINTS.appointments}/${params.id}` : API_ENDPOINTS.appointments;
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
                showMessage(`Appointment has been ${params.id ? 'updated' : 'created'} successfully.`);
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
            
            // Format date for input field (YYYY-MM-DD)
            if (item.appointment_date) {
                // Extract date portion and ensure it's in YYYY-MM-DD format
                let dateStr = item.appointment_date;
                if (dateStr.includes('T')) {
                    dateStr = dateStr.split('T')[0];
                }
                json.appointment_date = dateStr;
            }
            
            // Ensure duration_minutes is set (either from item or calculate from times)
            if (item.duration_minutes) {
                json.duration_minutes = parseInt(item.duration_minutes);
            } else if (item.start_time && item.end_time) {
                // Calculate duration from start and end times
                const [startHour, startMin] = item.start_time.split(':').map(Number);
                const [endHour, endMin] = item.end_time.split(':').map(Number);
                const durationMins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                json.duration_minutes = durationMins;
            }
            
            // Format time fields (HH:MM format)
            if (item.start_time) {
                json.start_time = item.start_time.substring(0, 5); // Get HH:MM from HH:MM:SS
            }
            if (item.end_time) {
                json.end_time = item.end_time.substring(0, 5);
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
                    const response = await fetch(`${API_ENDPOINTS.appointments}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Appointment has been deleted successfully.');
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
                <h2 className="text-xl">Appointments</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Appointment
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
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-Show">No-Show</option>
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
                                            <th>Provider</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Duration</th>
                                            <th>Service</th>
                                            <th>Status</th>
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
                                                <td>
                                                    {item.provider_first_name && item.provider_last_name
                                                        ? `${item.provider_first_name} ${item.provider_last_name}`
                                                        : '-'}
                                                </td>
                                                <td>{formatDate(item.appointment_date)}</td>
                                                <td>{item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}</td>
                                                <td>{Math.round(item.duration_minutes || 0)} min</td>
                                                <td>{item.service || '-'}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        item.status === 'Upcoming' ? 'bg-info' :
                                                        item.status === 'Completed' ? 'bg-success' :
                                                        item.status === 'Cancelled' ? 'bg-danger' :
                                                        'bg-warning'
                                                    }`}>
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
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden shadow relative" key={item.id}>
                                    <div className="p-6">
                                        <div className="text-lg font-semibold mb-2">
                                            {item.patient_first_name} {item.patient_last_name}
                                        </div>
                                        <div className="text-white-dark text-sm mb-3">
                                            Dr. {item.provider_first_name} {item.provider_last_name}
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Date:</span>
                                                <span>{formatDate(item.appointment_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Time:</span>
                                                <span>{item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-dark">Duration:</span>
                                                <span>{Math.round(item.duration_minutes || 0)} minutes</span>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <span className={`badge ${
                                                item.status === 'Upcoming' ? 'bg-info' :
                                                item.status === 'Completed' ? 'bg-success' :
                                                item.status === 'Cancelled' ? 'bg-danger' :
                                                'bg-warning'
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
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Appointment
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
                                                            {patient.first_name} {patient.last_name} ({patient.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="provider_id">Provider *</label>
                                                <select
                                                    id="provider_id"
                                                    name="provider_id"
                                                    className="form-select"
                                                    value={params.provider_id}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Provider</option>
                                                    {providers.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            Dr. {provider.first_name} {provider.last_name} ({provider.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="appointment_date">Appointment Date *</label>
                                                <input
                                                    id="appointment_date"
                                                    type="date"
                                                    name="appointment_date"
                                                    className="form-input"
                                                    value={params.appointment_date}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="duration_minutes">Duration (Minutes) *</label>
                                                <select
                                                    id="duration_minutes"
                                                    name="duration_minutes"
                                                    className="form-select"
                                                    value={params.duration_minutes}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="15">15 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="45">45 minutes</option>
                                                    <option value="60">1 hour</option>
                                                    <option value="90">1.5 hours</option>
                                                    <option value="120">2 hours</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="start_time">Start Time *</label>
                                                <select
                                                    id="start_time"
                                                    name="start_time"
                                                    className="form-select"
                                                    value={params.start_time}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Start Time</option>
                                                    {timeSlots.map((time) => (
                                                        <option key={time} value={time}>
                                                            {time}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="end_time">End Time</label>
                                                <input
                                                    id="end_time"
                                                    type="text"
                                                    name="end_time"
                                                    className="form-input bg-gray-100"
                                                    value={params.end_time}
                                                    disabled
                                                    readOnly
                                                />
                                                <small className="text-white-dark">Auto-calculated based on duration</small>
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="service">Service/Treatment</label>
                                                <input
                                                    id="service"
                                                    type="text"
                                                    name="service"
                                                    placeholder="e.g., Root Canal, Cleaning, Checkup"
                                                    className="form-input"
                                                    value={params.service}
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
                                                    <option value="Upcoming">Upcoming</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="No-Show">No-Show</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label htmlFor="notes">Notes</label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    rows={3}
                                                    placeholder="Enter appointment notes"
                                                    className="form-textarea"
                                                    value={params.notes}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            {params.status === 'Cancelled' && (
                                                <div className="col-span-2">
                                                    <label htmlFor="cancellation_reason">Cancellation Reason</label>
                                                    <textarea
                                                        id="cancellation_reason"
                                                        name="cancellation_reason"
                                                        rows={2}
                                                        placeholder="Enter reason for cancellation"
                                                        className="form-textarea"
                                                        value={params.cancellation_reason}
                                                        onChange={changeValue}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                </div>
                                            )}
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

export default AppointmentsCRUD;
