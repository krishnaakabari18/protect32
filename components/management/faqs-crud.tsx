'use client';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const defaultValues = {
    id: null as string | null,
    question: '',
    answer: '',
    category: '',
    sort_order: 0,
    status: 'Active',
};

const FaqsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [params, setParams] = useState<any>({ ...defaultValues });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEditorReady, setIsEditorReady] = useState(false);

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean'],
        ],
    }), []);

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'script',
        'list', 'bullet', 'indent', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video',
    ];

    useEffect(() => { fetchItems(); }, [pagination.page, pagination.limit, filterStatus, search]);

    useEffect(() => {
        if (addModal && modalMode !== 'view') {
            setIsEditorReady(false);
            const t = setTimeout(() => setIsEditorReady(true), 100);
            return () => clearTimeout(t);
        } else {
            setIsEditorReady(false);
        }
    }, [addModal, modalMode]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({
                page: pagination.page.toString(), limit: pagination.limit.toString(),
                ...(filterStatus && { status: filterStatus }),
                ...(search && { search }),
            });
            const res = await fetch(`${API_ENDPOINTS.faqs}?${q}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!params.question.trim()) e.question = 'Question is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams((p: any) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const saveItem = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.faqs}/${params.id}` : API_ENDPOINTS.faqs;
            const method = params.id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(params),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage(`FAQ ${params.id ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchItems();
            } else showMessage(data.error || 'Operation failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    const toggleStatus = async (item: any) => {
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.faqs}/${item.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) { showMessage(`FAQ marked as ${newStatus}.`); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: 'This will permanently delete the FAQ.', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.faqs}/${item.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            if (res.ok) { showMessage('FAQ deleted successfully.'); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Delete failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        setErrors({});
        setIsEditorReady(false);
        setParams(item
            ? { id: item.id, question: item.question || '', answer: item.answer || '', category: item.category || '', sort_order: item.sort_order ?? 0, status: item.status || 'Active' }
            : { ...defaultValues }
        );
        setAddModal(true);
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') Swal.fire({ icon: 'success', title: msg, timer: 3000, timerProgressBar: true, showConfirmButton: true, confirmButtonText: 'OK' });
        else { const t: any = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, customClass: { container: 'toast' } }); t.fire({ icon: type, title: msg, padding: '10px 20px' }); }
    };

    const formatDate = (s: string) => {
        if (!s) return '-';
        try { return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return '-'; }
    };

    const isView = modalMode === 'view';

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">FAQs</h2>
                <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add FAQ
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <input type="text" className="form-input w-auto" placeholder="Search question or answer..."
                    value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                <select className="form-select w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                {(filterStatus || search) && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => { setFilterStatus(''); setSearch(''); setPagination(p => ({ ...p, page: 1 })); }}>Clear</button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Question</th>
                                    {/*<th>Category</th>*/}
                                    <th>Order</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8">No FAQs found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td className="max-w-xs truncate font-semibold">{item.question}</td>
                                        {/*<td>{item.category || '-'}</td>*/}
                                        <td>{item.sort_order}</td>
                                        <td>
                                            <button type="button"
                                                className={`badge cursor-pointer ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}
                                                onClick={() => toggleStatus(item)}>
                                                {item.status}
                                            </button>
                                        </td>
                                        <td>{formatDate(item.created_at)}</td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-info" onClick={() => openModal('view', item)}><IconEye /></button>
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('edit', item)}><IconPencil /></button>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}><IconTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
                            <div className="flex gap-2">
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>Previous</button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let n = pagination.totalPages <= 5 ? i + 1 : pagination.page <= 3 ? i + 1 : pagination.page >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i : pagination.page - 2 + i;
                                    return <button key={n} type="button" className={`btn btn-sm ${pagination.page === n ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPagination(p => ({ ...p, page: n }))}>{n}</button>;
                                })}
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}>Next</button>
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
                                <DialogPanel className="panel my-8 w-full max-w-3xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} FAQ</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* Question */}
                                            <div className="sm:col-span-2">
                                                <label>Question <span className="text-red-500">*</span></label>
                                                <input type="text" name="question" className={`form-input ${errors.question ? 'border-red-500' : ''}`}
                                                    placeholder="Enter the question" value={params.question} onChange={changeValue} disabled={isView} />
                                                {errors.question && <p className="mt-1 text-xs text-red-500">{errors.question}</p>}
                                            </div>

                                            {/* Category 
                                            <div>
                                                <label>Category</label>
                                                <input type="text" name="category" className="form-input"
                                                    placeholder="e.g. General, Billing, Technical" value={params.category} onChange={changeValue} disabled={isView} />
                                            </div>*/}

                                            {/* Sort Order */}
                                            <div>
                                                <label>Sort Order</label>
                                                <input type="number" name="sort_order" className="form-input" min={0}
                                                    placeholder="0" value={params.sort_order} onChange={changeValue} disabled={isView} />
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label>Status</label>
                                                <select name="status" className="form-select" value={params.status} onChange={changeValue} disabled={isView}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>

                                            {/* Answer — Quill editor */}
                                            <div className="sm:col-span-2">
                                                <label>Answer</label>
                                                {isView ? (
                                                    <div
                                                        className="prose dark:prose-invert max-w-none p-3 border rounded min-h-[150px] bg-gray-50 dark:bg-gray-800"
                                                        dangerouslySetInnerHTML={{ __html: params.answer || '<em class="text-gray-400">No answer provided.</em>' }}
                                                    />
                                                ) : isEditorReady ? (
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={params.answer || ''}
                                                        onChange={(value: string) => setParams((p: any) => ({ ...p, answer: value }))}
                                                        modules={quillModules}
                                                        formats={quillFormats}
                                                        className="bg-white dark:bg-gray-900"
                                                        style={{ height: '250px', marginBottom: '50px' }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-20 border rounded bg-gray-50 dark:bg-gray-800">
                                                        <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>{isView ? 'Close' : 'Cancel'}</button>
                                            {!isView && (
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>
                                                    {loading ? 'Saving...' : params.id ? 'Update FAQ' : 'Save FAQ'}
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

export default FaqsCRUD;
