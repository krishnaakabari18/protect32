'use client';
import React, { useEffect, useState, useCallback } from 'react';
import IconEye from '@/components/icon/icon-eye';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import { Fragment } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

const SubscriptionsCRUD = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [current, setCurrent] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterActive, setFilterActive] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const token = () => localStorage.getItem('auth_token') || '';

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterStatus && { status: filterStatus }),
                ...(filterActive && { is_active: filterActive }),
            });
            const res = await fetch(`${API_ENDPOINTS.subscriptions}?${q}`, {
                headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [pagination.page, pagination.limit, filterStatus, filterActive]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openView = (item: any) => {
        setCurrent(item);
        setViewModal(true);
    };

    const syncSubscription = async (item: any) => {
        try {
            const res = await fetch(`${API_ENDPOINTS.subscriptions}/sync/${item.razorpay_subscription_id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                alert('Subscription synced successfully');
                fetchItems();
            } else {
                alert(data.error || 'Sync failed');
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

    const statusColors: Record<string, string> = {
        active: 'bg-success', authenticated: 'bg-info', created: 'bg-warning',
        cancelled: 'bg-danger', completed: 'bg-secondary', halted: 'bg-danger',
        paused: 'bg-warning', pending: 'bg-warning', expired: 'bg-danger',
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Subscriptions</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <select className="form-select w-48" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="authenticated">Authenticated</option>
                    <option value="created">Created</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="halted">Halted</option>
                    <option value="paused">Paused</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                </select>
                <select className="form-select w-48" value={filterActive} onChange={e => { setFilterActive(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All (Active/Inactive)</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
                {(filterStatus || filterActive) && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => { setFilterStatus(''); setFilterActive(''); setPagination(p => ({ ...p, page: 1 })); }}>
                        Clear Filters
                    </button>
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
                                    <th>#</th>
                                    <th>Patient</th>
                                    <th>Plan</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Active</th>
                                    <th>Start Date</th>
                                    <th>Expiry Date</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">No subscriptions found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td>{item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : '-'}</td>
                                        <td className="font-semibold">{item.plan_title || '-'}</td>
                                        <td>₹{item.plan_price || 0}</td>
                                        <td><span className={`badge ${statusColors[item.status] || 'bg-secondary'} text-white`}>{item.status}</span></td>
                                        <td><span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>{item.is_active ? 'Yes' : 'No'}</span></td>
                                        <td>{formatDate(item.start_date)}</td>
                                        <td>{formatDate(item.expiry_date)}</td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openView(item)}><IconEye /></button>
                                                <button type="button" className="btn btn-sm btn-outline-info" onClick={() => syncSubscription(item)}>Sync</button>
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

            {/* View Modal */}
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
                                        <h5 className="text-lg font-bold">Subscription Details</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}><IconX /></button>
                                    </div>
                                    {current && (
                                        <div className="p-5 space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><span className="text-xs text-gray-400 block">Patient</span><span className="font-semibold">{current.first_name} {current.last_name}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Email</span><span>{current.email || '-'}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Plan</span><span className="font-semibold">{current.plan_title}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Price</span><span>₹{current.plan_price}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Status</span><span className={`badge ${statusColors[current.status] || 'bg-secondary'}`}>{current.status}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Active</span><span className={`badge ${current.is_active ? 'bg-success' : 'bg-danger'}`}>{current.is_active ? 'Yes' : 'No'}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Start Date</span><span>{formatDate(current.start_date)}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Expiry Date</span><span>{formatDate(current.expiry_date)}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Paid Count</span><span>{current.paid_count || 0}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Remaining</span><span>{current.remaining_count || 0}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Total Count</span><span>{current.total_count || 0}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Razorpay Sub ID</span><span className="text-xs break-all">{current.razorpay_subscription_id}</span></div>
                                                {current.short_url && (
                                                    <div className="col-span-2"><span className="text-xs text-gray-400 block">Payment Link</span><a href={current.short_url} target="_blank" className="text-primary text-sm">{current.short_url}</a></div>
                                                )}
                                            </div>
                                            <div className="flex justify-end border-t pt-4 gap-2">
                                                <button type="button" className="btn btn-outline-info" onClick={() => { syncSubscription(current); setViewModal(false); }}>Sync from Razorpay</button>
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

export default SubscriptionsCRUD;
