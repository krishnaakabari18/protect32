'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import { Fragment } from 'react';
import Swal from 'sweetalert2';
import IconEye from '@/components/icon/icon-eye';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';
import { API_ENDPOINTS } from '@/config/api.config';

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-info', in_progress: 'bg-warning', completed: 'bg-success', rejected: 'bg-danger',
};
const STATUS_LABELS: Record<string, string> = {
    new: 'New', in_progress: 'In Progress', completed: 'Completed', rejected: 'Rejected',
};

const InquiriesCRUD = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [viewModal, setViewModal] = useState(false);
    const [current, setCurrent] = useState<any>(null);
    const [noteInput, setNoteInput] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Filters
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const token = () => localStorage.getItem('auth_token') || '';

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                page: pagination.page.toString(), limit: pagination.limit.toString(),
                ...(filterStatus   && { status:     filterStatus }),
                ...(filterFromDate && { from_date:  filterFromDate }),
                ...(filterToDate   && { to_date:    filterToDate }),
                ...(searchQuery    && { search:     searchQuery }),
            });
            const res = await fetch(`${API_ENDPOINTS.inquiries}?${q}`, {
                headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [pagination.page, pagination.limit, filterStatus, filterFromDate, filterToDate, searchQuery]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openView = async (item: any) => {
        const res = await fetch(`${API_ENDPOINTS.inquiries}/${item.id}`, {
            headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
        });
        const data = await res.json();
        setCurrent(data.data || item);
        setNoteInput(data.data?.notes || '');
        setViewModal(true);
        // Refresh list to update read status
        fetchItems();
    };

    const updateStatus = async (id: string, status: string) => {
        await fetch(`${API_ENDPOINTS.inquiries}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ status }),
        });
        setCurrent((p: any) => p ? { ...p, status } : p);
        fetchItems();
    };

    const saveNote = async () => {
        if (!current) return;
        await fetch(`${API_ENDPOINTS.inquiries}/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ notes: noteInput }),
        });
        setCurrent((p: any) => p ? { ...p, notes: noteInput } : p);
        Swal.fire({ icon: 'success', title: 'Note saved', timer: 1200, showConfirmButton: false });
    };

    const deleteItem = async (id: string) => {
        const r = await Swal.fire({ icon: 'warning', title: 'Delete this inquiry?', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        await fetch(`${API_ENDPOINTS.inquiries}/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
        });
        fetchItems();
    };

    const bulkDelete = async () => {
        if (!selected.length) return;
        const r = await Swal.fire({ icon: 'warning', title: `Delete ${selected.length} inquiries?`, showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        await fetch(`${API_ENDPOINTS.inquiries}/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ ids: selected }),
        });
        setSelected([]);
        fetchItems();
    };

    const bulkStatus = async (status: string) => {
        if (!selected.length) return;
        await fetch(`${API_ENDPOINTS.inquiries}/bulk-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ ids: selected, status }),
        });
        setSelected([]);
        fetchItems();
    };

    const exportCSV = async () => {
        try {
            const q = new URLSearchParams({
                ...(filterStatus   && { status:    filterStatus }),
                ...(filterFromDate && { from_date: filterFromDate }),
                ...(filterToDate   && { to_date:   filterToDate }),
                ...(searchQuery    && { search:    searchQuery }),
            });
            const res = await fetch(`${API_ENDPOINTS.inquiries}/export?${q}`, {
                headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            });
            if (!res.ok) { Swal.fire('Error', 'Failed to export CSV', 'error'); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inquiries-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e: any) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    const toggleSelect = (id: string) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAll = () =>
        setSelected(selected.length === items.length ? [] : items.map(i => i.id));
    const clearFilters = () => {
        setSearchInput(''); setSearchQuery(''); setFilterStatus('');
        setFilterFromDate(''); setFilterToDate('');
        setPagination(p => ({ ...p, page: 1 }));
    };
    const hasFilters = searchQuery || filterStatus || filterFromDate || filterToDate;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Inquiries</h2>
                <div className="flex gap-2">
                    {selected.length > 0 && (
                        <>
                            <select className="form-select w-auto text-sm" onChange={e => e.target.value && bulkStatus(e.target.value)} defaultValue="">
                                <option value="" disabled>Bulk Status</option>
                                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={bulkDelete}>
                                Delete ({selected.length})
                            </button>
                        </>
                    )}
                    <button type="button" className="btn btn-outline-success btn-sm" onClick={exportCSV}>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex-1 min-w-[200px] max-w-[400px]">
                    <input type="text" className="form-input w-full" placeholder="Search name, email, phone, subject..."
                        value={searchInput}
                        onChange={e => {
                            const val = e.target.value; setSearchInput(val);
                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            debounceRef.current = setTimeout(() => { setSearchQuery(val); setPagination(p => ({ ...p, page: 1 })); }, 400);
                        }} />
                </div>
                <div className="w-[180px]">
                    <select className="form-select w-full" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                        <option value="">All Status</option>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>
                <div className="w-[140px]">
                    <input type="date" className="form-input w-full" placeholder="From" value={filterFromDate} onChange={e => { setFilterFromDate(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                </div>
                <div className="w-[140px]">
                    <input type="date" className="form-input w-full" placeholder="To" value={filterToDate} onChange={e => { setFilterToDate(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                </div>
                {hasFilters && (
                    <div>
                        <button type="button" className="btn btn-outline-danger" onClick={clearFilters}>Clear Filters</button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" className="form-checkbox" checked={selected.length === items.length && items.length > 0} onChange={toggleAll} /></th>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">No inquiries found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id} className={!item.is_read ? 'font-semibold bg-blue-50/30 dark:bg-blue-900/10' : ''}>
                                        <td><input type="checkbox" className="form-checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                                        <td>
                                            {(pagination.page - 1) * pagination.limit + idx + 1}
                                            {!item.is_read && <span className="ml-1 inline-block w-2 h-2 rounded-full bg-primary"></span>}
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td className="max-w-[150px] truncate">{item.subject || '-'}</td>
                                        <td>
                                            <select className={`badge ${STATUS_COLORS[item.status]} text-white border-0 cursor-pointer text-xs`}
                                                value={item.status}
                                                onChange={e => updateStatus(item.id, e.target.value)}>
                                                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </td>
                                        <td className="whitespace-nowrap text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-'}</td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openView(item)}><IconEye /></button>
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

            {/* View / Detail Modal */}
            <Transition appear show={viewModal} as={Fragment}>
                <Dialog as="div" open={viewModal} onClose={() => setViewModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Inquiry Detail</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}><IconX /></button>
                                    </div>
                                    {current && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><span className="text-xs text-gray-400 block">Name</span><span className="font-semibold">{current.name}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Email</span><span>{current.email}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Phone</span><span>{current.phone}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Source</span><span>{current.source || '-'}</span></div>
                                                <div className="col-span-2"><span className="text-xs text-gray-400 block">Subject</span><span>{current.subject || '-'}</span></div>
                                                <div className="col-span-2"><span className="text-xs text-gray-400 block">Message</span><p className="whitespace-pre-wrap text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">{current.message}</p></div>
                                                <div><span className="text-xs text-gray-400 block">Date</span><span>{current.created_at ? new Date(current.created_at).toLocaleString('en-GB') : '-'}</span></div>
                                                <div>
                                                    <span className="text-xs text-gray-400 block mb-1">Status</span>
                                                    <select className="form-select w-full" value={current.status}
                                                        onChange={e => updateStatus(current.id, e.target.value)}>
                                                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Admin Notes</label>
                                                <textarea rows={3} className="form-textarea w-full" placeholder="Add internal notes..."
                                                    value={noteInput} onChange={e => setNoteInput(e.target.value)} />
                                                <button type="button" className="btn btn-sm btn-primary mt-2" onClick={saveNote}>Save Note</button>
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

export default InquiriesCRUD;
