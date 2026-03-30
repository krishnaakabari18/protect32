'use client';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';

const PlansCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [allFeatures, setAllFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [addingFeature, setAddingFeature] = useState(false);
    const featuresRef = useRef<HTMLDivElement>(null);

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const defaultValues = {
        id: null,
        title: '',
        price: '',
        discount_percent: 0,
        free_checkups_annually: 0,
        free_cleanings_annually: 0,
        free_xrays_annually: 0,
        is_popular: false,
        is_active: true,
        features: [] as string[],  // array of feature names
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchItems();
        fetchFeatures();
    }, [pagination.page, pagination.limit]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
                setFeaturesOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchFeatures = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch((API_ENDPOINTS as any).planFeatures, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setAllFeatures(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString(), search });
            const res = await fetch(`${API_ENDPOINTS.plans}?${q}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!params.title) newErrors.title = 'Plan title is required.';
        if (!params.price) newErrors.price = 'Price is required.';
        else if (isNaN(parseFloat(params.price)) || parseFloat(params.price) < 0) newErrors.price = 'Price must be a valid positive number.';
        flushSync(() => { setErrors(newErrors); setTouched({ title: true, price: true }); });
        if (Object.keys(newErrors).length > 0) {
            const el = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`) as HTMLElement;
            if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
        return Object.keys(newErrors).length === 0;
    };

    const saveItem = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.plans}/${params.id}` : API_ENDPOINTS.plans;
            const method = params.id ? 'PUT' : 'POST';
            const body = { ...params, provider_id: null };
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage(`Plan has been ${params.id ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchItems();
            } else showMessage(data.error || 'Operation failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode); setTouched({}); setErrors({});
        const json = JSON.parse(JSON.stringify(defaultValues));
        if (item) {
            Object.keys(item).forEach(k => { if (k in json) json[k] = item[k]; });
            // Ensure features is always an array of strings
            if (!Array.isArray(json.features)) {
                try { json.features = json.features ? JSON.parse(json.features) : []; } catch { json.features = []; }
            }
        }
        setParams(json);
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: "You won't be able to revert this!", showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.plans}/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) { showMessage('Plan has been deleted successfully.'); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Delete failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') Swal.fire({ icon: 'success', title: msg, showConfirmButton: true, confirmButtonText: 'OK', timer: 3000, timerProgressBar: true });
        else { const t: any = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, customClass: { container: 'toast' } }); t.fire({ icon: type, title: msg, padding: '10px 20px' }); }
    };

    const cv = (e: any) => {
        const { name, value, type, checked } = e.target;
        setParams({ ...params, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };

    const toggleFeature = (featureName: string) => {
        const current: string[] = params.features || [];
        const updated = current.includes(featureName)
            ? current.filter(f => f !== featureName)
            : [...current, featureName];
        setParams({ ...params, features: updated });
    };

    const addNewFeature = async () => {
        if (!newFeatureName.trim()) return;
        setAddingFeature(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch((API_ENDPOINTS as any).planFeatures, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({ name: newFeatureName.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchFeatures();
                // Auto-select the new feature
                setParams({ ...params, features: [...(params.features || []), newFeatureName.trim()] });
                setNewFeatureName('');
                showMessage('Feature added successfully.');
            } else showMessage(data.error || 'Failed to add feature', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setAddingFeature(false); }
    };

    const isView = modalMode === 'view';

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Plans</h2>
                <div className="flex gap-3 items-center">
                    <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                        <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Plan
                    </button>
                    <div className="relative">
                        <input type="text" placeholder="Search Plans" className="peer form-input ltr:pr-11 rtl:pl-11" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchItems()} />
                        <button type="button" className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]" onClick={fetchItems}><IconSearch /></button>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead><tr><th>#</th><th>Title</th><th>Price (₹)</th><th>Discount</th><th>Features</th><th>Popular</th><th>Status</th><th className="!text-center">Actions</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={8} className="text-center py-8">No plans found</td></tr> : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td className="font-semibold">{item.title}</td>
                                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                                        <td>{item.discount_percent}%</td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(item.features) ? item.features : []).slice(0, 3).map((f: string) => (
                                                    <span key={f} className="badge bg-primary text-xs">{f}</span>
                                                ))}
                                                {(Array.isArray(item.features) ? item.features : []).length > 3 && (
                                                    <span className="badge bg-secondary text-xs">+{item.features.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td><span className={`badge ${item.is_popular ? 'bg-success' : 'bg-secondary'}`}>{item.is_popular ? 'Yes' : 'No'}</span></td>
                                        <td><span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td><div className="flex gap-2 items-center justify-center">
                                            <button type="button" className="btn btn-sm btn-outline-info" onClick={() => openModal('view', item)}><IconEye /></button>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('edit', item)}><IconPencil /></button>
                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}><IconTrash /></button>
                                        </div></td>
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

            {/* Modal */}
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
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Plan</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* Title */}
                                            <div className="col-span-2">
                                                <label htmlFor="title">Plan Title <span className="text-red-500">*</span></label>
                                                <input id="title" name="title" type="text" placeholder="Enter plan title"
                                                    className={`form-input ${touched.title && errors.title ? 'border-red-500' : ''}`}
                                                    value={params.title} onChange={cv}
                                                    onBlur={e => { setTouched(p=>({...p,title:true})); if (!e.target.value) setErrors(p=>({...p,title:'Plan title is required.'})); else setErrors(p=>{const n={...p};delete n.title;return n;}); }}
                                                    disabled={isView} />
                                                {touched.title && errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                            </div>

                                            {/* Price */}
                                            <div>
                                                <label htmlFor="price">Price (₹) <span className="text-red-500">*</span></label>
                                                <input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00"
                                                    className={`form-input ${touched.price && errors.price ? 'border-red-500' : ''}`}
                                                    value={params.price} onChange={cv}
                                                    onBlur={e => { setTouched(p=>({...p,price:true})); if (!e.target.value) setErrors(p=>({...p,price:'Price is required.'})); else setErrors(p=>{const n={...p};delete n.price;return n;}); }}
                                                    disabled={isView} />
                                                {touched.price && errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                            </div>

                                            {/* Discount */}
                                            <div>
                                                <label htmlFor="discount_percent">Discount (%)</label>
                                                <input id="discount_percent" name="discount_percent" type="number" min="0" max="100"
                                                    className="form-input" value={params.discount_percent} onChange={cv} disabled={isView} />
                                            </div>

                                            {/* Free Checkups */}
                                            <div>
                                                <label htmlFor="free_checkups_annually">Free Checkups / Year</label>
                                                <input id="free_checkups_annually" name="free_checkups_annually" type="number" min="0"
                                                    className="form-input" value={params.free_checkups_annually} onChange={cv} disabled={isView} />
                                            </div>

                                            {/* Free Cleanings */}
                                            <div>
                                                <label htmlFor="free_cleanings_annually">Free Cleanings / Year</label>
                                                <input id="free_cleanings_annually" name="free_cleanings_annually" type="number" min="0"
                                                    className="form-input" value={params.free_cleanings_annually} onChange={cv} disabled={isView} />
                                            </div>

                                            {/* Free X-Rays */}
                                            <div>
                                                <label htmlFor="free_xrays_annually">Free X-Rays / Year</label>
                                                <input id="free_xrays_annually" name="free_xrays_annually" type="number" min="0"
                                                    className="form-input" value={params.free_xrays_annually} onChange={cv} disabled={isView} />
                                            </div>

                                            {/* Toggles */}
                                            <div className="flex items-center gap-6 col-span-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input name="is_popular" type="checkbox" className="form-checkbox" checked={params.is_popular} onChange={cv} disabled={isView} />
                                                    <span>Mark as Popular</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input name="is_active" type="checkbox" className="form-checkbox" checked={params.is_active} onChange={cv} disabled={isView} />
                                                    <span>Active</span>
                                                </label>
                                            </div>

                                            {/* Features multi-select */}
                                            <div className="col-span-2">
                                                <label className="block mb-1">Features</label>

                                                {isView ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {(params.features || []).length === 0 && <span className="text-gray-400 text-sm">No features selected</span>}
                                                        {(params.features || []).map((f: string) => (
                                                            <span key={f} className="badge bg-primary">{f}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div ref={featuresRef} className="relative">
                                                        {/* Trigger */}
                                                        <div
                                                            className="form-input cursor-pointer flex items-center justify-between min-h-[38px]"
                                                            onClick={() => setFeaturesOpen(o => !o)}
                                                        >
                                                            <div className="flex flex-wrap gap-1 flex-1">
                                                                {(params.features || []).length === 0 && <span className="text-gray-400">Select features...</span>}
                                                                {(params.features || []).map((f: string) => (
                                                                    <span key={f} className="badge bg-primary flex items-center gap-1">
                                                                        {f}
                                                                        <button type="button" className="ml-1 text-white hover:text-red-200" onClick={e => { e.stopPropagation(); toggleFeature(f); }}>×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-gray-400 ml-2">▾</span>
                                                        </div>

                                                        {/* Dropdown */}
                                                        {featuresOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1b2e4b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                                                {/* Add new feature */}
                                                                <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="form-input flex-1 py-1 text-sm"
                                                                        placeholder="Add new feature..."
                                                                        value={newFeatureName}
                                                                        onChange={e => setNewFeatureName(e.target.value)}
                                                                        onKeyDown={e => e.key === 'Enter' && addNewFeature()}
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <button type="button" className="btn btn-sm btn-primary px-3" onClick={e => { e.stopPropagation(); addNewFeature(); }} disabled={addingFeature}>
                                                                        {addingFeature ? '...' : <IconPlus className="w-4 h-4" />}
                                                                    </button>
                                                                </div>

                                                                {/* Feature list with checkboxes */}
                                                                {allFeatures.length === 0 && (
                                                                    <div className="p-3 text-sm text-gray-400 text-center">No features yet. Add one above.</div>
                                                                )}
                                                                {allFeatures.map(feature => (
                                                                    <label key={feature.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox"
                                                                            checked={(params.features || []).includes(feature.name)}
                                                                            onChange={() => toggleFeature(feature.name)}
                                                                            onClick={e => e.stopPropagation()}
                                                                        />
                                                                        <span className="text-sm">{feature.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {!isView && (
                                            <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>Cancel</button>
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>{loading ? 'Saving...' : params.id ? 'Update Plan' : 'Add Plan'}</button>
                                            </div>
                                        )}
                                        {isView && (
                                            <div className="mt-6 flex justify-end border-t pt-4">
                                                <button type="button" className="btn btn-outline-primary" onClick={() => setAddModal(false)}>Close</button>
                                            </div>
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

export default PlansCRUD;
