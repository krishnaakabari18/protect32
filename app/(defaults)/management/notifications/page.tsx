'use client';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconTrash from '@/components/icon/icon-trash';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import { Fragment } from 'react';

const NOTIF_TYPES = ['appointment', 'payment', 'reminder', 'system', 'alert'];

const NotificationsPage = () => {
    const [addModal, setAddModal] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notifType, setNotifType] = useState('system');
    const [patientTargetType, setPatientTargetType] = useState('none');
    const [providerTargetType, setProviderTargetType] = useState('none');
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [excludePatients, setExcludePatients] = useState<string[]>([]);
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [excludeProviders, setExcludeProviders] = useState<string[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    useEffect(() => { fetchAll(); fetchPatients(); fetchProviders(); }, [pagination.page]);

    const token = () => localStorage.getItem('auth_token');
    const headers = () => ({ 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' });
    const jsonHeaders = () => ({ ...headers(), 'Content-Type': 'application/json' });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ page: pagination.page.toString(), limit: '10' });
            const res = await fetch(`${API_ENDPOINTS.notifications}?${q}`, { headers: headers() });
            const data = await res.json();
            if (res.ok) { setItems(data.data || []); if (data.pagination) setPagination(p => ({ ...p, ...data.pagination })); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchPatients = async () => {
        const res = await fetch(`${API_ENDPOINTS.patients}?limit=1000`, { headers: headers() });
        const data = await res.json();
        if (res.ok) setPatients(data.data || []);
    };

    const fetchProviders = async () => {
        const res = await fetch(`${API_ENDPOINTS.providers}?limit=1000`, { headers: headers() });
        const data = await res.json();
        if (res.ok) setProviders(data.data || []);
    };

    const resetForm = () => {
        setTitle(''); setMessage(''); setNotifType('system');
        setPatientTargetType('none'); setProviderTargetType('none');
        setSelectedPatients([]); setExcludePatients([]);
        setSelectedProviders([]); setExcludeProviders([]);
    };

    const sendOne = async (audience: string, targetType: string, selIds: string[], exIds: string[]) => {
        const res = await fetch(`${API_ENDPOINTS.notifications}/send`, {
            method: 'POST', headers: jsonHeaders(),
            body: JSON.stringify({ title, message, notification_type: notifType, target_audience: audience, target_type: targetType, selected_ids: selIds, exclude_ids: exIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        return data.data.sent_count as number;
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) { Swal.fire('Error', 'Title and message are required', 'error'); return; }
        if (patientTargetType === 'none' && providerTargetType === 'none') { Swal.fire('Error', 'Select at least one audience', 'error'); return; }
        setLoading(true);
        try {
            let total = 0;
            if (patientTargetType !== 'none') total += await sendOne('patient', patientTargetType, selectedPatients, excludePatients);
            if (providerTargetType !== 'none') total += await sendOne('provider', providerTargetType, selectedProviders, excludeProviders);
            Swal.fire('Sent!', `Notification sent to ${total} recipient(s)`, 'success');
            setAddModal(false); resetForm(); fetchAll();
        } catch (err: any) { Swal.fire('Error', err.message, 'error'); }
        finally { setLoading(false); }
    };

    const deleteItem = async (item: any) => {
        const r = await Swal.fire({ icon: 'warning', title: 'Delete?', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        await fetch(`${API_ENDPOINTS.notifications}/${item.id}`, { method: 'DELETE', headers: headers() });
        fetchAll();
    };

    const toggleId = (list: string[], setList: (v: string[]) => void, id: string) =>
        setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

    const MultiSelect = ({ people, selected, setSelected }: { people: any[]; selected: string[]; setSelected: (v: string[]) => void }) => (
        <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-900">
            {people.length === 0
                ? <p className="p-3 text-sm text-gray-400">No records found</p>
                : people.map(p => (
                    <label key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm">
                        <input type="checkbox" className="form-checkbox" checked={selected.includes(p.id)}
                            onChange={() => toggleId(selected, setSelected, p.id)} />
                        {p.first_name} {p.last_name}{p.email ? ` (${p.email})` : ''}
                    </label>
                ))}
        </div>
    );

    const fmt = (s: string) => { try { return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '-'; } };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Notifications</h2>
                <button type="button" className="btn btn-primary" onClick={() => { resetForm(); setAddModal(true); }}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Send Notification
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr><th>#</th><th>Title</th><th>Message</th><th>Type</th><th>Audience</th><th>Targeting</th><th>Sent To</th><th>Date</th><th className="!text-center">Actions</th></tr>
                            </thead>
                            <tbody>
                                {items.length === 0
                                    ? <tr><td colSpan={9} className="text-center py-8">No notifications found</td></tr>
                                    : items.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                            <td className="font-semibold">{item.title}</td>
                                            <td className="max-w-xs truncate">{item.message}</td>
                                            <td><span className="badge bg-primary">{item.notification_type}</span></td>
                                            <td><span className={`badge ${item.target_audience === 'patient' ? 'bg-info' : 'bg-warning'}`}>{item.target_audience}</span></td>
                                            <td><span className="badge bg-secondary">{item.target_type}</span></td>
                                            <td><span className="badge bg-success">{item.sent_count}</span></td>
                                            <td>{fmt(item.sent_at || item.created_at)}</td>
                                            <td><div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}><IconTrash /></button>
                                            </div></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Send Modal */}
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={() => setAddModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Send Notification</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">

                                        <div>
                                            <label>Title <span className="text-red-500">*</span></label>
                                            <input type="text" className="form-input" placeholder="Notification title" value={title} onChange={e => setTitle(e.target.value)} />
                                        </div>
                                        <div>
                                            <label>Message <span className="text-red-500">*</span></label>
                                            <textarea rows={3} className="form-textarea" placeholder="Notification message" value={message} onChange={e => setMessage(e.target.value)} />
                                        </div>
                                        <div>
                                            <label>Notification Type</label>
                                            <select className="form-select" value={notifType} onChange={e => setNotifType(e.target.value)}>
                                                {NOTIF_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                            </select>
                                        </div>

                                        {/* Patient Targeting */}
                                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-sm">Patient Targeting</span>
                                                <span className="text-xs text-gray-400">Optional</span>
                                            </div>
                                            <select className="form-select" value={patientTargetType} onChange={e => { setPatientTargetType(e.target.value); setSelectedPatients([]); setExcludePatients([]); }}>
                                                <option value="none">— Do not send to patients —</option>
                                                <option value="all">All Patients</option>
                                                <option value="selected">Selected Patients</option>
                                                <option value="exclude">All Except Selected Patients</option>
                                            </select>
                                            {patientTargetType === 'selected' && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Select patients to send to:</p>
                                                    <MultiSelect people={patients} selected={selectedPatients} setSelected={setSelectedPatients} />
                                                    {selectedPatients.length > 0 && <p className="text-xs text-primary mt-1">{selectedPatients.length} patient(s) selected</p>}
                                                </div>
                                            )}
                                            {patientTargetType === 'exclude' && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Select patients to exclude:</p>
                                                    <MultiSelect people={patients} selected={excludePatients} setSelected={setExcludePatients} />
                                                    {excludePatients.length > 0 && <p className="text-xs text-danger mt-1">{excludePatients.length} patient(s) excluded</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Provider Targeting */}
                                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-sm">Provider Targeting</span>
                                                <span className="text-xs text-gray-400">Optional</span>
                                            </div>
                                            <select className="form-select" value={providerTargetType} onChange={e => { setProviderTargetType(e.target.value); setSelectedProviders([]); setExcludeProviders([]); }}>
                                                <option value="none">— Do not send to providers —</option>
                                                <option value="all">All Providers</option>
                                                <option value="selected">Selected Providers</option>
                                                <option value="exclude">All Except Selected Providers</option>
                                            </select>
                                            {providerTargetType === 'selected' && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Select providers to send to:</p>
                                                    <MultiSelect people={providers} selected={selectedProviders} setSelected={setSelectedProviders} />
                                                    {selectedProviders.length > 0 && <p className="text-xs text-primary mt-1">{selectedProviders.length} provider(s) selected</p>}
                                                </div>
                                            )}
                                            {providerTargetType === 'exclude' && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Select providers to exclude:</p>
                                                    <MultiSelect people={providers} selected={excludeProviders} setSelected={setExcludeProviders} />
                                                    {excludeProviders.length > 0 && <p className="text-xs text-danger mt-1">{excludeProviders.length} provider(s) excluded</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>Cancel</button>
                                            <button type="button" className="btn btn-primary" onClick={handleSend} disabled={loading}>
                                                {loading ? 'Sending...' : 'Send Notification'}
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

export default NotificationsPage;
