'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';

import IconPlus from '@/components/icon/icon-plus';

interface ProcedureRow {
    procedure_id: string;
    procedure_name: string;
    price: string;
    discount: string;
    final_price: string;
}
const emptyProcRow = (): ProcedureRow => ({ procedure_id: '', procedure_name: '', price: '', discount: '0', final_price: '' });

const AppointmentsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const [filterProvider, setFilterProvider] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    
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
        status: '',
        notes: '',
        cancellation_reason: '',
        appointment_code: '',
        payment_method: 'cash',
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Procedure rows state
    const [procedureRows, setProcedureRows] = useState<ProcedureRow[]>([emptyProcRow()]);
    const [providerProcedures, setProviderProcedures] = useState<any[]>([]);

    const fetchProviderProcedures = async (providerId: string) => {
        if (!providerId) { setProviderProcedures([]); return; }
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.dropdowns}/provider-procedures?parent_id=${providerId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setProviderProcedures(data.data || []);
        } catch (e) { console.error(e); }
    };

    const updateProcRow = (i: number, field: keyof ProcedureRow, val: string) => {
        setProcedureRows(prev => {
            const next = [...prev];
            const row = { ...next[i], [field]: val };
            if (field === 'price' || field === 'discount') {
                const price = parseFloat(field === 'price' ? val : row.price) || 0;
                const disc  = parseFloat(field === 'discount' ? val : row.discount) || 0;
                row.final_price = (price - price * disc / 100).toFixed(2);
            }
            next[i] = row;
            return next;
        });
    };

    const handleProcSelect = (i: number, procedureId: string, opt?: any) => {
        const price = opt?.meta?.price != null ? String(opt.meta.price) : '';
        const priceNum = parseFloat(price) || 0;
        setProcedureRows(prev => {
            const next = [...prev];
            const disc = parseFloat(next[i].discount) || 0;
            next[i] = {
                procedure_id: procedureId,
                procedure_name: opt?.label || '',
                price,
                discount: next[i].discount || '0',
                final_price: priceNum > 0 ? (priceNum - priceNum * disc / 100).toFixed(2) : '',
            };
            return next;
        });
    };

    const totalProcPrice = procedureRows.reduce((s, r) => s + (parseFloat(r.final_price) || 0), 0);

    // Generate appointment code: p32-YYYYMMDD-XXX (date + globally sequential number)
    const generateCode = async () => {
        const today = new Date();
        const year  = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day   = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.appointments}?limit=10000`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            if (response.ok) {
                const data = await response.json();
                const all = data.data || [];
                let maxSeq = 0;
                all.forEach((apt: any) => {
                    if (apt.appointment_code && apt.appointment_code.startsWith('p32-')) {
                        const parts = apt.appointment_code.split('-');
                        const num = parseInt(parts[parts.length - 1]) || 0;
                        if (num > maxSeq) maxSeq = num;
                    }
                });
                return `p32-${dateStr}-${(maxSeq + 1).toString().padStart(3, '0')}`;
            }
        } catch (e) { console.error(e); }
        return `p32-${dateStr}-001`;
    };

    // Auto-generate code when modal opens in create mode
    useEffect(() => {
        if (modalMode === 'create' && addModal) {
            generateCode().then(code => {
                setParams((prev: any) => ({ ...prev, appointment_code: code }));
            });
        }
    }, [modalMode, addModal]);

    // Helper function to format date safely
    const formatDate = (dateStr: string) => {        if (!dateStr) return '-';
        try {
            // Extract just the date part (YYYY-MM-DD)
            const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`;
        } catch (error) {
            return '-';
        }
    };

    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchItems();
    }, [pagination.page, pagination.limit, filterStatus, filterFromDate, filterToDate, filterProvider, searchQuery]);

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

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterStatus   && { status:      filterStatus }),
                ...(filterFromDate && { from_date:   filterFromDate }),
                ...(filterToDate   && { to_date:     filterToDate }),
                ...(filterProvider && { provider_id: filterProvider }),
                ...(searchQuery    && { search:      searchQuery }),
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
    }, [pagination.page, pagination.limit, filterStatus, filterFromDate, filterToDate, filterProvider, searchQuery]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        if (!params.patient_id) { newErrors.patient_id = 'Patient is required.'; newTouched.patient_id = true; }
        if (!params.provider_id) { newErrors.provider_id = 'Provider is required.'; newTouched.provider_id = true; }
        if (!params.appointment_date) { newErrors.appointment_date = 'Appointment date is required.'; newTouched.appointment_date = true; }
        if (!params.start_time) { newErrors.start_time = 'Start time is required.'; newTouched.start_time = true; }
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
            const isEdit = !!params.id;
            const procedureItems = procedureRows.filter(r => r.procedure_id).map(r => ({
                procedure_id: r.procedure_id,
                procedure_name: r.procedure_name,
                price: parseFloat(r.price) || 0,
                discount: parseFloat(r.discount) || 0,
                final_price: parseFloat(r.final_price) || 0,
            }));
            const amount = totalProcPrice || parseFloat(params.estimated_cost) || 0;

            // ── EDIT: normal update, no payment flow ──────────────────────────
            if (isEdit) {
                const response = await fetch(`${API_ENDPOINTS.appointments}/${params.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                    body: JSON.stringify({ ...params, procedure_items: procedureItems, estimated_cost: amount.toFixed(2) }),
                });
                const data = await response.json();
                if (response.ok) { showMessage('Appointment updated successfully.'); setAddModal(false); fetchItems(); }
                else showMessage(data.error || 'Update failed', 'error');
                return;
            }

            // ── CREATE: CASH — book immediately ───────────────────────────────
            if (params.payment_method !== 'online') {
                const response = await fetch(`${API_ENDPOINTS.appointments}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                    body: JSON.stringify({ ...params, procedure_items: procedureItems, estimated_cost: amount.toFixed(2) }),
                });
                const data = await response.json();
                if (response.ok) { showMessage('Appointment booked. Cash payment pending.'); setAddModal(false); fetchItems(); }
                else showMessage(data.error || 'Booking failed', 'error');
                return;
            }

            // ── CREATE: ONLINE — get Razorpay order first ─────────────────────
            const bookRes = await fetch(`${API_ENDPOINTS.appointmentPayments}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({
                    patient_id: params.patient_id,
                    provider_id: params.provider_id,
                    appointment_date: params.appointment_date,
                    start_time: params.start_time,
                    end_time: params.end_time,
                    notes: params.notes,
                    amount,
                    payment_method: 'online',
                    procedure_items: procedureItems,
                    estimated_cost: amount.toFixed(2),
                }),
            });
            const bookData = await bookRes.json();
            if (!bookRes.ok) { showMessage(bookData.error || 'Failed to initiate payment', 'error'); return; }

            const { razorpay_order_id, razorpay_key, appointment_data } = bookData;

            // Open Razorpay checkout
            const rzOptions = {
                key: razorpay_key,
                amount: Math.round(amount * 100),
                currency: 'INR',
                name: 'Protect32',
                description: 'Appointment Payment',
                order_id: razorpay_order_id,
                handler: async (response: any) => {
                    // Verify payment and create appointment
                    setLoading(true);
                    try {
                        const verifyRes = await fetch(`${API_ENDPOINTS.appointmentPayments}/verify-online`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                appointment_data,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            showMessage('Payment successful! Appointment confirmed.');
                            setAddModal(false);
                            fetchItems();
                        } else {
                            showMessage(verifyData.error || 'Payment verification failed', 'error');
                        }
                    } catch (e: any) {
                        showMessage('Verification error: ' + e.message, 'error');
                    } finally { setLoading(false); }
                },
                modal: {
                    ondismiss: async () => {
                        // Record failed payment
                        await fetch(`${API_ENDPOINTS.appointmentPayments}/failed-online`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                            body: JSON.stringify({ razorpay_order_id, patient_id: params.patient_id, provider_id: params.provider_id, amount, error_reason: 'User dismissed checkout' }),
                        }).catch(() => {});
                        showMessage('Payment cancelled. Appointment not created.', 'error');
                    },
                },
                prefill: {},
                theme: { color: '#4361ee' },
            };

            // Load Razorpay script if not loaded
            if (!(window as any).Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Razorpay'));
                    document.body.appendChild(script);
                });
            }
            const rzInstance = new (window as any).Razorpay(rzOptions);
            rzInstance.open();

        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const openModal = async (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        setTouched({});
        setErrors({});
        const json = JSON.parse(JSON.stringify(defaultValues));

        if (item) {
            Object.keys(item).forEach(key => { if (json.hasOwnProperty(key)) json[key] = item[key]; });
            if (item.appointment_date) {
                let dateStr = item.appointment_date;
                if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];
                json.appointment_date = dateStr;
            }
            if (item.duration_minutes) {
                json.duration_minutes = parseInt(item.duration_minutes);
            } else if (item.start_time && item.end_time) {
                const [sh, sm] = item.start_time.split(':').map(Number);
                const [eh, em] = item.end_time.split(':').map(Number);
                json.duration_minutes = (eh * 60 + em) - (sh * 60 + sm);
            }
            if (item.start_time) json.start_time = item.start_time.substring(0, 5);
            if (item.end_time)   json.end_time   = item.end_time.substring(0, 5);

            // Load procedure rows
            if (item.provider_id) await fetchProviderProcedures(item.provider_id);
            if (item.procedure_items) {
                const rows = typeof item.procedure_items === 'string' ? JSON.parse(item.procedure_items) : item.procedure_items;
                setProcedureRows(rows.length > 0 ? rows.map((r: any) => ({
                    procedure_id: r.procedure_id || '',
                    procedure_name: r.procedure_name || '',
                    price: String(r.price || ''),
                    discount: String(r.discount || '0'),
                    final_price: String(r.final_price || r.price || ''),
                })) : [emptyProcRow()]);
            } else {
                setProcedureRows([emptyProcRow()]);
            }
        } else {
            setProcedureRows([emptyProcRow()]);
            setProviderProcedures([]);
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
        const requiredFields: Record<string, string> = { patient_id: 'Patient', provider_id: 'Provider', appointment_date: 'Appointment date', start_time: 'Start time' };
        if (requiredFields[name] && !value) {
            setErrors(prev => ({ ...prev, [name]: `${requiredFields[name]} is required.` }));
        } else {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
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
                       {/*<div>
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
                        </div>*/}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-3 mb-5">
                {/* Search box */}
                <div>
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="Search by patient, provider, code, or service..."
                        value={searchInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchInput(val);
                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            debounceRef.current = setTimeout(() => {
                                setSearchQuery(val);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }, 400);
                        }}
                    />
                </div>
                <div>
                    <input
                        type="date"
                        className="form-input w-full"
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
                        className="form-input w-full"
                        value={filterToDate}
                        onChange={(e) => {
                            setFilterToDate(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div>
                    <SearchableSelect
                        dropdownType="providers"
                        value={filterProvider}
                        onChange={(val) => {
                            setFilterProvider(val);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        placeholder="All Providers"
                    />
                </div>
                <div>
                    <select
                        className="form-select w-full"
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
                    </select>
                </div>
                {(searchQuery || filterFromDate || filterToDate || filterProvider || filterStatus) && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-danger w-full"
                            onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
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
                                            <th>#</th>
                                            <th>Appointment Code</th>
                                            <th>Patient</th>
                                            <th>Provider</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Duration</th>
                                            <th>Amount (₹)</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                                <td><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{item.appointment_code || '-'}</code></td>
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
                                                <td>{item.estimated_cost ? `₹${parseFloat(item.estimated_cost).toFixed(2)}` : '-'}</td>
                                                <td>
                                                    <span className={`badge ${item.payment_method === 'online' ? 'bg-info' : 'bg-warning'}`}>
                                                        {item.payment_method === 'online' ? '💳 Online' : '💵 Cash'}
                                                    </span>
                                                </td>
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
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Appointment
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Appointment Code — always read-only */}
                                            <div className="col-span-2">
                                                <label htmlFor="appointment_code">Appointment ID</label>
                                                <input
                                                    id="appointment_code"
                                                    type="text"
                                                    className="form-input bg-gray-100 font-mono text-sm"
                                                    value={params.appointment_code || (modalMode === 'create' ? 'Auto-generated after selecting date' : '-')}
                                                    disabled
                                                    readOnly
                                                />
                                                {modalMode === 'create' && <p className="text-xs text-gray-400 mt-0.5">Format: p32-YYYYMMDD-001 (globally sequential)</p>}
                                            </div>
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
                                                        setProcedureRows([emptyProcRow()]);
                                                        fetchProviderProcedures(val);
                                                        if (errors.provider_id) setErrors(prev => { const n = { ...prev }; delete n.provider_id; return n; });
                                                    }}
                                                    placeholder="Select Provider"
                                                    disabled={modalMode === 'view'}
                                                    className={touched.provider_id && errors.provider_id ? 'border-red-500' : ''}
                                                />
                                                {touched.provider_id && errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id}</p>}
                                            </div>

                                            {/* Procedure Rows */}
                                            <div className="col-span-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="font-semibold text-sm">Procedures</label>
                                                    {modalMode !== 'view' && (
                                                        <button type="button" className="btn btn-sm btn-outline-primary"
                                                            onClick={() => setProcedureRows(prev => [...prev, emptyProcRow()])}>
                                                            <IconPlus className="w-4 h-4 mr-1" />Add Procedure
                                                        </button>
                                                    )}
                                                </div>
                                                {/* Header */}
                                                <div className="grid gap-2 mb-1 text-xs text-gray-500 font-medium px-1"
                                                    style={{ gridTemplateColumns: '3fr 2fr 1.2fr 2fr 36px' }}>
                                                    <div>Procedure</div>
                                                    <div>Provider Price (₹)</div>
                                                    <div>Savings (%)</div>
                                                    <div>Final Price (₹)</div>
                                                    {modalMode !== 'view' && <div></div>}
                                                </div>
                                                <div className="space-y-2">
                                                    {procedureRows.map((row, i) => {
                                                        const usedIds = procedureRows.map((r, ri) => ri !== i ? r.procedure_id : null).filter(Boolean);
                                                        const opts = providerProcedures
                                                            .filter(p => !usedIds.includes(p.value))
                                                            .concat(row.procedure_id && !providerProcedures.find(p => p.value === row.procedure_id)
                                                                ? [{ value: row.procedure_id, label: row.procedure_name, meta: { price: row.price } }]
                                                                : []);
                                                        return (
                                                            <div key={i} className="grid gap-2 items-center"
                                                                style={{ gridTemplateColumns: '3fr 2fr 1.2fr 2fr 36px' }}>
                                                                <SearchableSelect
                                                                    options={opts}
                                                                    value={row.procedure_id}
                                                                    onChange={(val, opt) => handleProcSelect(i, val, opt)}
                                                                    placeholder={!params.provider_id ? 'Select Provider first' : 'Select Procedure'}
                                                                    disabled={modalMode === 'view' || !params.provider_id}
                                                                />
                                                                <input type="number" className="form-input" placeholder="0.00"
                                                                    value={row.price} min="0" disabled={modalMode === 'view'}
                                                                    onChange={e => updateProcRow(i, 'price', e.target.value)} />
                                                                <input type="number" className="form-input text-center" placeholder="0"
                                                                    value={row.discount} min="0" max="100" disabled={modalMode === 'view'}
                                                                    onChange={e => updateProcRow(i, 'discount', e.target.value)} />
                                                                <input type="number" className="form-input font-semibold text-primary bg-primary/5"
                                                                    placeholder="0.00" value={row.final_price} readOnly disabled={modalMode === 'view'} />
                                                                {modalMode !== 'view' && (
                                                                    <button type="button" className="btn btn-sm btn-outline-danger px-2"
                                                                        onClick={() => setProcedureRows(prev => prev.length === 1 ? [emptyProcRow()] : prev.filter((_, ri) => ri !== i))}>
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {/* Total */}
                                                <div className="mt-3 flex justify-end">
                                                    <div className="bg-primary/10 rounded-lg px-4 py-2 text-right">
                                                        <div className="text-xs text-gray-500">Total Final Price</div>
                                                        <div className="text-xl font-bold text-primary">₹{totalProcPrice.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="appointment_date">Appointment Date <span className="text-red-500">*</span></label>
                                                <input
                                                    id="appointment_date"
                                                    type="date"
                                                    name="appointment_date"
                                                    className={`form-input ${touched.appointment_date && errors.appointment_date ? 'border-red-500' : ''}`}
                                                    value={params.appointment_date}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    min={getTodayDate()}
                                                    disabled={modalMode === 'view'}
                                                />
                                                {touched.appointment_date && errors.appointment_date && <p className="mt-1 text-xs text-red-500">{errors.appointment_date}</p>}
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
                                                <label htmlFor="start_time">Start Time <span className="text-red-500">*</span></label>
                                                <select
                                                    id="start_time"
                                                    name="start_time"
                                                    className={`form-select ${touched.start_time && errors.start_time ? 'border-red-500' : ''}`}
                                                    value={params.start_time}
                                                    onChange={changeValue}
                                                    onBlur={handleBlur}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="">Select Start Time</option>
                                                    {timeSlots.map((time) => (
                                                        <option key={time} value={time}>
                                                            {time}
                                                        </option>
                                                    ))}
                                                </select>
                                                {touched.start_time && errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
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
                                            <div>
                                                <label htmlFor="status">Status</label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    className="form-select"
                                                    value={params.status}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >   <option value="">Select Status</option>
                                                    <option value="Upcoming">Upcoming</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="payment_method">Payment Method</label>
                                                <select
                                                    id="payment_method"
                                                    name="payment_method"
                                                    className="form-select"
                                                    value={params.payment_method || 'cash'}
                                                    onChange={changeValue}
                                                    disabled={modalMode === 'view'}
                                                >
                                                    <option value="cash">💵 Cash</option>
                                                    <option value="online">💳 Online</option>
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
