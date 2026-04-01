'use client';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconPlus from '@/components/icon/icon-plus';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';

const DOCUMENT_TYPES = [
    'Medical Record', 'X-Ray', 'Lab Report', 'Prescription',
    'Insurance', 'Treatment Plan', 'Consent Form', 'Other',
];

const sanitizeName = (raw: string) => raw.replace(/[^a-zA-Z0-9 _\-]/g, '').replace(/\s+/g, ' ').trim();
const autoName = (type: string, date: string) => {
    const d = date ? new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    return sanitizeName(`${type || 'Document'} ${d}`);
};
const formatDate = (s: string) => {
    if (!s) return '-';
    try { return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return '-'; }
};
const formatSize = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};
const fileIcon = (mime: string) => mime?.includes('pdf') ? '📄' : mime?.includes('image') ? '🖼️' : '📎';

interface DocItem {
    id?: string;           // existing item id (edit mode)
    name: string;
    document_type: string;
    upload_date: string;
    file: File | null;     // new file chosen
    existingFile?: { path: string; file_originalname: string; file_mimetype: string; file_size: number } | null;
    nameError: string;
    typeError: string;
}

const emptyItem = (): DocItem => ({
    name: '', document_type: '', upload_date: new Date().toISOString().split('T')[0],
    file: null, existingFile: null, nameError: '', typeError: '',
});

const DocumentsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [items, setItems] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [filterPatient, setFilterPatient] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [patientId, setPatientId] = useState('');
    const [patientError, setPatientError] = useState('');
    const [docItems, setDocItems] = useState<DocItem[]>([emptyItem()]);

    const [editId, setEditId] = useState('');

    useEffect(() => { fetchPatients(); fetchItems(); }, [pagination.page, pagination.limit, filterType, filterPatient]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.patients}?limit=1000`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            if (res.ok) setPatients(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({
                page: pagination.page.toString(), limit: pagination.limit.toString(),
                ...(filterType && { document_type: filterType }),
                ...(filterPatient && { patient_id: filterPatient }),
            });
            const res = await fetch(`${API_ENDPOINTS.documents}?${q}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const updateItem = (i: number, field: keyof DocItem, value: any) => {
        setDocItems(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            if (field === 'name') next[i].nameError = '';
            if (field === 'document_type') next[i].typeError = '';
            return next;
        });
    };

    const handleFile = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!valid.includes(file.type)) { showMessage('Only PDF and image files allowed', 'error'); return; }
            if (file.size > 10 * 1024 * 1024) { showMessage('Max file size is 10MB', 'error'); return; }
        }
        updateItem(i, 'file', file);
    };

    const validate = () => {
        let valid = true;
        if (!patientId) { setPatientError('Patient is required.'); valid = false; } else setPatientError('');
        const validated = docItems.map(item => {
            const r = { ...item };
            if (!item.document_type) { r.typeError = 'Document type is required.'; valid = false; }
            if (!item.name.trim()) r.name = autoName(item.document_type, item.upload_date);
            else r.name = sanitizeName(item.name);
            return r;
        });
        setDocItems(validated);
        return valid ? validated : null;
    };

    const saveCreate = async () => {
        const validated = validate();
        if (!validated) return;
        if (validated.some(it => !it.file)) { showMessage('Please select a file for each document', 'error'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const fd = new FormData();
            fd.append('patient_id', patientId);
            const meta = validated.map(it => ({ name: it.name, document_type: it.document_type, upload_date: it.upload_date }));
            fd.append('items', JSON.stringify(meta));
            validated.forEach(it => { if (it.file) fd.append('files', it.file); });
            const res = await fetch(API_ENDPOINTS.documents, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: fd,
            });
            const data = await res.json();
            if (res.ok) { showMessage('Documents saved successfully.'); setAddModal(false); fetchItems(); }
            else showMessage(data.error || 'Operation failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    const saveEdit = async () => {
        const validated = validate();
        if (!validated) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const fd = new FormData();
            fd.append('patient_id', patientId);
            const meta = validated.map(it => ({ id: it.id, name: it.name, document_type: it.document_type, upload_date: it.upload_date }));
            fd.append('items', JSON.stringify(meta));
            // Append files in order — null slot means keep existing (backend handles by index)
            validated.forEach(it => { fd.append('files', it.file || new Blob([])); });
            const res = await fetch(`${API_ENDPOINTS.documents}/${editId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: fd,
            });
            const data = await res.json();
            if (res.ok) { showMessage('Documents updated successfully.'); setAddModal(false); fetchItems(); }
            else showMessage(data.error || 'Update failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setModalMode('create');
        setPatientId(''); setPatientError('');
        setDocItems([emptyItem()]);
        setAddModal(true);
    };

    const openEdit = async (record: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.documents}/${record.id}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            const full = res.ok ? data.data : record;
            setModalMode('edit');
            setEditId(full.id);
            setPatientId(full.patient_id || ''); setPatientError('');
            const its: DocItem[] = (full.items || []).map((it: any) => ({
                id: it.id, name: it.name || '', document_type: it.document_type || '',
                upload_date: it.upload_date ? it.upload_date.split('T')[0] : new Date().toISOString().split('T')[0],
                file: null,
                existingFile: it.file_path ? { path: it.file_path, file_originalname: it.file_originalname, file_mimetype: it.file_mimetype, file_size: it.file_size } : null,
                nameError: '', typeError: '',
            }));
            setDocItems(its.length > 0 ? its : [emptyItem()]);
            setAddModal(true);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openView = async (record: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.documents}/${record.id}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            const full = res.ok ? data.data : record;
            setModalMode('view');
            setEditId(full.id);
            setPatientId(full.patient_id || '');
            const its: DocItem[] = (full.items || []).map((it: any) => ({
                id: it.id, name: it.name || '', document_type: it.document_type || '',
                upload_date: it.upload_date ? it.upload_date.split('T')[0] : '',
                file: null,
                existingFile: it.file_path ? { path: it.file_path, file_originalname: it.file_originalname, file_mimetype: it.file_mimetype, file_size: it.file_size } : null,
                nameError: '', typeError: '',
            }));
            setDocItems(its.length > 0 ? its : [emptyItem()]);
            setAddModal(true);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const deleteRecord = async (record: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: 'This will delete all documents and files!', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.documents}/${record.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) { showMessage('Deleted successfully.'); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Delete failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') Swal.fire({ icon: 'success', title: msg, timer: 3000, timerProgressBar: true, showConfirmButton: true, confirmButtonText: 'OK' });
        else { const t: any = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, customClass: { container: 'toast' } }); t.fire({ icon: type, title: msg, padding: '10px 20px' }); }
    };

    const downloadFile = (filePath: string) => {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        window.open(`${base}/${filePath}`, '_blank');
    };

    const isView = modalMode === 'view';

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Documents</h2>
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Document
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-5">
                <select className="form-select w-auto" value={filterPatient} onChange={e => { setFilterPatient(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Patients</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
                <select className="form-select w-auto" value={filterType} onChange={e => { setFilterType(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Types</option>
                    {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(filterPatient || filterType) && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => { setFilterPatient(''); setFilterType(''); setPagination(p => ({ ...p, page: 1 })); }}>Clear</button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead><tr><th>#</th><th>Documents</th><th>Patient</th><th>Types</th><th>Items</th><th>Upload Date</th><th className="!text-center">Actions</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">No documents found</td></tr> : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td className="font-semibold max-w-xs truncate">{item.document_names || '-'}</td>
                                        <td>{item.patient_first_name && item.patient_last_name ? `${item.patient_first_name} ${item.patient_last_name}` : '-'}</td>
                                        <td><span className="text-sm">{item.document_types || '-'}</span></td>
                                        <td><span className="badge bg-info">{item.items_count || 0} items</span></td>
                                        <td>{formatDate(item.upload_date)}</td>
                                        <td><div className="flex gap-2 items-center justify-center">
                                            <button type="button" className="btn btn-sm btn-outline-info" onClick={() => openView(item)}><IconEye /></button>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)}><IconPencil /></button>
                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteRecord(item)}><IconTrash /></button>
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
                                <DialogPanel className="panel my-8 w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Document</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">

                                        {/* Patient */}
                                        <div className="mb-5">
                                            <label>Patient <span className="text-red-500">*</span></label>
                                            <select className={`form-select ${patientError ? 'border-red-500' : ''}`} value={patientId}
                                                onChange={e => { setPatientId(e.target.value); setPatientError(''); }} disabled={isView}>
                                                <option value="">Select Patient</option>
                                                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                            </select>
                                            {patientError && <p className="mt-1 text-xs text-red-500">{patientError}</p>}
                                        </div>

                                        {/* Document cards */}
                                        <div className="space-y-4">
                                            {docItems.map((item, i) => (
                                                <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-semibold text-sm">Document {i + 1}</span>
                                                        {!isView && docItems.length > 1 && (
                                                            <button type="button" className="text-danger text-sm" onClick={() => setDocItems(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="text-sm">Document Type {!isView && <span className="text-red-500">*</span>}</label>
                                                            <select className={`form-select ${item.typeError ? 'border-red-500' : ''}`} value={item.document_type}
                                                                onChange={e => updateItem(i, 'document_type', e.target.value)} disabled={isView}>
                                                                <option value="">Select Type</option>
                                                                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                            {item.typeError && <p className="mt-1 text-xs text-red-500">{item.typeError}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="text-sm">Upload Date</label>
                                                            <input type="date" className="form-input" value={item.upload_date}
                                                                onChange={e => updateItem(i, 'upload_date', e.target.value)} disabled={isView} />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm">Document Name <span className="text-gray-400 text-xs">(auto if blank)</span></label>
                                                            <input type="text" className="form-input" placeholder="Leave blank to auto-generate"
                                                                value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} disabled={isView} />
                                                            {!isView && <p className="text-xs text-gray-400 mt-0.5">No special characters allowed</p>}
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="text-sm">File (PDF / Image, max 10MB)</label>
                                                            {/* Existing file */}
                                                            {item.existingFile && !item.file && (
                                                                <div className="flex items-center gap-2 mb-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                                                    {fileIcon(item.existingFile.file_mimetype)} {item.existingFile.file_originalname}
                                                                    <span className="text-xs text-gray-400">({formatSize(item.existingFile.file_size)})</span>
                                                                    {!isView && <span className="text-xs text-gray-400 ml-auto">Choose below to replace</span>}
                                                                    <button type="button" className="btn btn-sm btn-outline-primary ml-auto" onClick={() => downloadFile(item.existingFile!.path)}><IconDownload className="w-4 h-4" /></button>
                                                                </div>
                                                            )}
                                                            {/* New file chosen */}
                                                            {item.file && (
                                                                <div className="flex items-center gap-2 mb-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm border border-blue-200 dark:border-blue-700">
                                                                    {fileIcon(item.file.type)} {item.file.name} <span className="text-xs text-gray-400">({formatSize(item.file.size)})</span>
                                                                    {!isView && <button type="button" className="text-danger ml-auto" onClick={() => updateItem(i, 'file', null)}>×</button>}
                                                                </div>
                                                            )}
                                                            {!isView && (
                                                                <input type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                                                    onChange={e => handleFile(i, e)} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {!isView && (
                                            <button type="button" className="mt-3 btn btn-outline-primary btn-sm"
                                                onClick={() => setDocItems(prev => [...prev, emptyItem()])}>
                                                <IconPlus className="w-4 h-4 mr-1" />Add More Document
                                            </button>
                                        )}

                                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>{isView ? 'Close' : 'Cancel'}</button>
                                            {!isView && (
                                                <button type="button" className="btn btn-primary" onClick={modalMode === 'create' ? saveCreate : saveEdit} disabled={loading}>
                                                    {loading ? 'Saving...' : modalMode === 'create' ? 'Save Documents' : 'Update Documents'}
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

export default DocumentsCRUD;
