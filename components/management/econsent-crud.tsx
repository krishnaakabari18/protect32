'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import { Fragment } from 'react';
import Swal from 'sweetalert2';
import IconX from '@/components/icon/icon-x';
import IconEye from '@/components/icon/icon-eye';
import IconTrash from '@/components/icon/icon-trash';
import { API_ENDPOINTS } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';

const EConsentCRUD = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [current, setCurrent] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [filterStatus, setFilterStatus] = useState('');

    // Form state
    const [providerId, setProviderId] = useState('');
    const [patientId, setPatientId] = useState('');
    const [patientAge, setPatientAge] = useState('');
    const [patientAddress, setPatientAddress] = useState('');
    const [procedureNames, setProcedureNames] = useState('');
    const [selectedProcedures, setSelectedProcedures] = useState<any[]>([]);
    const [providerProcedures, setProviderProcedures] = useState<any[]>([]);
    const [procDropdownOpen, setProcDropdownOpen] = useState(false);
    const [procSearch, setProcSearch] = useState('');
    const procRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);

    const token = () => localStorage.getItem('auth_token') || '';

    // Close procedure dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (procRef.current && !procRef.current.contains(e.target as Node)) {
                setProcDropdownOpen(false);
                setProcSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterStatus && { status: filterStatus }),
            });
            const res = await fetch(`${API_ENDPOINTS.econsents}?${q}`, {
                headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [pagination.page, pagination.limit, filterStatus]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    // Fetch provider's procedures when provider changes
    useEffect(() => {
        if (!providerId) { setProviderProcedures([]); setSelectedProcedures([]); setProcedureNames(''); return; }
        const fetchProcedures = async () => {
            try {
                const res = await fetch(`${API_ENDPOINTS.dropdowns}/provider-procedures?parent_id=${providerId}`, {
                    headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
                });
                const data = await res.json();
                if (res.ok) setProviderProcedures(data.data || []);
            } catch (e) { console.error(e); }
        };
        fetchProcedures();
        setSelectedProcedures([]);
        setProcedureNames('');
    }, [providerId]);

    // Auto-fill patient age and address when patient changes
    useEffect(() => {
        if (!patientId) { setPatientAge(''); setPatientAddress(''); return; }
        const fetchPatient = async () => {
            try {
                const res = await fetch(`${API_ENDPOINTS.users}/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
                });
                const data = await res.json();
                if (res.ok && data.data) {
                    const p = data.data;
                    // Calculate age from date_of_birth
                    if (p.date_of_birth) {
                        const dob = new Date(p.date_of_birth);
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const m = today.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                        setPatientAge(age > 0 ? String(age) : '');
                    }
                    if (p.address) setPatientAddress(p.address);
                }
            } catch (e) { console.error(e); }
        };
        fetchPatient();
    }, [patientId]);

    // Update procedure names text when selection changes
    useEffect(() => {
        setProcedureNames(selectedProcedures.map(p => p.label).join(', '));
    }, [selectedProcedures]);

    const toggleProcedure = (proc: any) => {
        setSelectedProcedures(prev => {
            const exists = prev.find(p => p.value === proc.value);
            if (exists) return prev.filter(p => p.value !== proc.value);
            return [...prev, proc];
        });
    };

    const openModal = () => {
        setProviderId(''); setPatientId(''); setPatientAge(''); setPatientAddress('');
        setProcedureNames(''); setSelectedProcedures([]); setProviderProcedures([]);
        setModal(true);
    };

    const save = async () => {
        if (!providerId || !patientId || !procedureNames.trim()) {
            Swal.fire('Error', 'Provider, Patient and Procedures are required', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(API_ENDPOINTS.econsents, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({ provider_id: providerId, patient_id: patientId, procedure_names: procedureNames, patient_age: patientAge ? parseInt(patientAge) : null, patient_address: patientAddress }),
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'eConsent requested', timer: 1500, showConfirmButton: false });
                setModal(false);
                fetchItems();
            } else {
                Swal.fire('Error', data.error || 'Failed', 'error');
            }
        } catch (e: any) { Swal.fire('Error', e.message, 'error'); }
        finally { setSaving(false); }
    };

    const deleteItem = async (id: string) => {
        const r = await Swal.fire({ icon: 'warning', title: 'Delete this eConsent?', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        await fetch(`${API_ENDPOINTS.econsents}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' } });
        fetchItems();
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { pending: 'bg-warning', signed: 'bg-success', rejected: 'bg-danger' };
        return <span className={`badge ${map[status] || 'bg-secondary'} capitalize`}>{status}</span>;
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">eConsent History</h2>
                <button type="button" className="btn btn-primary" onClick={openModal}>+ Request eConsent</button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <select className="form-select w-48" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="signed">Signed</option>
                    <option value="rejected">Rejected</option>
                </select>
                {filterStatus && <button type="button" className="btn btn-outline-danger" onClick={() => { setFilterStatus(''); setPagination(p => ({ ...p, page: 1 })); }}>Clear</button>}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Patient</th>
                                    <th>Provider</th>
                                    <th>Procedure</th>
                                    <th>Date Requested</th>
                                    <th>Status</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No eConsent records found.</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td>{item.patient_first_name} {item.patient_last_name}</td>
                                        <td>{item.provider_first_name} {item.provider_last_name}</td>
                                        <td className="max-w-[200px] truncate">{item.procedure_names}</td>
                                        <td>{formatDate(item.created_at)}</td>
                                        <td>{statusBadge(item.status)}</td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setCurrent(item); setViewModal(true); }}>
                                                    <IconEye />
                                                </button>
                                                {item.status === 'pending' && (
                                                    <button type="button" className="btn btn-sm btn-outline-success text-xs px-2" onClick={async () => {
                                                        await fetch(`${API_ENDPOINTS.econsents}/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ status: 'signed' }) });
                                                        fetchItems();
                                                    }}>eSign</button>
                                                )}
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.id)}><IconTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm">Showing {((pagination.page-1)*pagination.limit)+1} to {Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total}</div>
                            <div className="flex gap-2">
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPagination(p=>({...p,page:p.page-1}))} disabled={pagination.page===1}>Previous</button>
                                {Array.from({length:Math.min(5,pagination.totalPages)},(_,i)=>{
                                    let n=pagination.totalPages<=5?i+1:pagination.page<=3?i+1:pagination.page>=pagination.totalPages-2?pagination.totalPages-4+i:pagination.page-2+i;
                                    return <button key={n} type="button" className={`btn btn-sm ${pagination.page===n?'btn-primary':'btn-outline-primary'}`} onClick={()=>setPagination(p=>({...p,page:n}))}>{n}</button>;
                                })}
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPagination(p=>({...p,page:p.page+1}))} disabled={pagination.page===pagination.totalPages}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Request eConsent Modal */}
            <Transition appear show={modal} as={Fragment}>
                <Dialog as="div" open={modal} onClose={() => setModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div>
                                            <h5 className="text-lg font-bold">Request eConsent</h5>
                                            <p className="text-xs text-gray-500">Prepare informed consent for the patient</p>
                                        </div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {/* Provider */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Provider <span className="text-red-500">*</span></label>
                                            <SearchableSelect
                                                dropdownType="providers"
                                                value={providerId}
                                                onChange={val => { setProviderId(val); setPatientId(''); }}
                                                placeholder="Select Provider"
                                            />
                                        </div>

                                        {/* Procedures multi-select */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Procedures <span className="text-red-500">*</span></label>
                                            {!providerId ? (
                                                <div className="form-input bg-gray-100 text-gray-400 cursor-not-allowed">Select provider first</div>
                                            ) : (
                                                <div ref={procRef} className="relative">
                                                    <button type="button" className="form-input w-full text-left flex items-center justify-between min-h-[38px]" onClick={() => setProcDropdownOpen(o => !o)}>
                                                        <span className={`text-sm truncate flex-1 ${selectedProcedures.length === 0 ? 'text-gray-400' : ''}`}>
                                                            {selectedProcedures.length === 0 ? 'Select procedures...' : `${selectedProcedures.length} selected`}
                                                        </span>
                                                        <span className={`text-gray-400 text-xs transition-transform ${procDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
                                                    </button>
                                                    {procDropdownOpen && (
                                                        <div className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl" onMouseDown={e => e.stopPropagation()}>
                                                            <div className="p-2 border-b border-gray-100">
                                                                <input autoFocus type="text" className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-primary" placeholder="Search procedures..." value={procSearch} onChange={e => setProcSearch(e.target.value)} />
                                                            </div>
                                                            <ul className="max-h-52 overflow-y-auto py-1">
                                                                {providerProcedures.length === 0 ? (
                                                                    <li className="px-3 py-2 text-sm text-gray-400">No procedures assigned to this provider</li>
                                                                ) : providerProcedures
                                                                    .filter(p => !procSearch || p.label.toLowerCase().includes(procSearch.toLowerCase()))
                                                                    .map(proc => {
                                                                        const selected = selectedProcedures.some(p => p.value === proc.value);
                                                                        return (
                                                                            <li key={proc.value} className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-primary/10 ${selected ? 'bg-primary/10 text-primary font-medium' : ''}`}
                                                                                onMouseDown={e => { e.preventDefault(); toggleProcedure(proc); }}>
                                                                                <input type="checkbox" className="form-checkbox" checked={selected} readOnly />
                                                                                <span>{proc.label}</span>
                                                                                {proc.meta?.price && <span className="ml-auto text-xs text-gray-400">₹{proc.meta.price}</span>}
                                                                            </li>
                                                                        );
                                                                    })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Selected procedure tags */}
                                            {selectedProcedures.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedProcedures.map(p => (
                                                        <span key={p.value} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded px-2 py-0.5">
                                                            {p.label}
                                                            <button type="button" onClick={() => toggleProcedure(p)}>×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Patient */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Patient Name <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    dropdownType="patients"
                                                    value={patientId}
                                                    onChange={val => setPatientId(val)}
                                                    placeholder="Select a patient"
                                                    disabled={!providerId}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Patient Age</label>
                                                <input type="text" className="form-input bg-gray-50" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Auto-calculated" />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Resident Of</label>
                                            <input type="text" className="form-input" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} placeholder="Address / City" />
                                        </div>

                                        {/* Procedure names (auto-filled) */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Procedure / Treatment Name</label>
                                            <input type="text" className="form-input" value={procedureNames} onChange={e => setProcedureNames(e.target.value)} placeholder="Auto-filled from selected procedures" />
                                        </div>

                                        {/* Info */}
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
                                            <span className="text-yellow-500 text-lg">ℹ</span>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">The patient will receive a notification to review and sign this consent form digitally.</p>
                                        </div>

                                        <div className="flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModal(false)}>Cancel</button>
                                            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                                                {saving ? 'Requesting...' : '✍ Request Signature'}
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* View Modal */}
            <Transition appear show={viewModal} as={Fragment}>
                <Dialog as="div" open={viewModal} onClose={() => setViewModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">eConsent Details</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}><IconX /></button>
                                    </div>
                                    {current && (
                                        <div className="p-5 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="text-xs text-gray-400 block">Patient</span><span className="font-semibold">{current.patient_first_name} {current.patient_last_name}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Provider</span><span>{current.provider_first_name} {current.provider_last_name}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Age</span><span>{current.patient_age || '-'}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Status</span>{statusBadge(current.status)}</div>
                                                <div className="col-span-2"><span className="text-xs text-gray-400 block">Address</span><span>{current.patient_address || '-'}</span></div>
                                                <div className="col-span-2"><span className="text-xs text-gray-400 block">Procedures</span><span className="font-medium">{current.procedure_names}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Requested</span><span>{formatDate(current.created_at)}</span></div>
                                                {current.signed_at && <div><span className="text-xs text-gray-400 block">Signed</span><span>{formatDate(current.signed_at)}</span></div>}
                                            </div>
                                            <div className="flex justify-end border-t pt-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewModal(false)}>Close</button>
                                            </div>
                                        </div>
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default EConsentCRUD;
