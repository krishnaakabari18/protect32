'use client';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconFile from '@/components/icon/icon-file';
import IconPlus from '@/components/icon/icon-plus';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';

// ─── helpers ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
    'Medical Record', 'X-Ray', 'Lab Report', 'Prescription',
    'Insurance', 'Treatment Plan', 'Consent Form', 'Other',
];

/** Strip special chars, collapse spaces, trim */
const sanitizeName = (raw: string) =>
    raw.replace(/[^a-zA-Z0-9 _\-]/g, '').replace(/\s+/g, ' ').trim();

/** Auto-generate name from type + date when name is blank */
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

// ─── row type for multi-row add ──────────────────────────────────────────────
interface DocRow {
    name: string;
    document_type: string;
    upload_date: string;
    files: File[];
    nameError: string;
    typeError: string;
    existingFile?: any; // for edit mode: the server file this row represents
}

const emptyRow = (): DocRow => ({
    name: '', document_type: '', upload_date: new Date().toISOString().split('T')[0],
    files: [], nameError: '', typeError: '',
});

// ─── component ───────────────────────────────────────────────────────────────
const DocumentsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [filterPatient, setFilterPatient] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // ── form state ──
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [patientId, setPatientId] = useState('');
    const [patientError, setPatientError] = useState('');
    const [rows, setRows] = useState<DocRow[]>([emptyRow()]);

    // edit/view single doc
    const [editItem, setEditItem] = useState<any>(null);
    const [editPatientId, setEditPatientId] = useState('');
    const [editPatientError, setEditPatientError] = useState('');
    const [editRows, setEditRows] = useState<DocRow[]>([emptyRow()]);

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

    // ── row helpers ──
    const updateRow = (i: number, field: keyof DocRow, value: any) => {
        setRows(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            // clear errors on change
            if (field === 'name') next[i].nameError = '';
            if (field === 'document_type') next[i].typeError = '';
            return next;
        });
    };

    const addRow = () => setRows(prev => [...prev, emptyRow()]);
    const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

    const handleRowFiles = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (files.some(f => !valid.includes(f.type))) { showMessage('Only PDF and image files allowed', 'error'); return; }
        if (files.some(f => f.size > 10 * 1024 * 1024)) { showMessage('Max file size is 10MB', 'error'); return; }
        updateRow(i, 'files', files);
    };

    // ── edit row helpers ──
    const updateEditRow = (i: number, field: keyof DocRow, value: any) => {
        setEditRows(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            if (field === 'name') next[i].nameError = '';
            if (field === 'document_type') next[i].typeError = '';
            return next;
        });
    };
    const addEditRow = () => setEditRows(prev => [...prev, emptyRow()]);
    const removeEditRow = (i: number) => setEditRows(prev => prev.filter((_, idx) => idx !== i));
    const handleEditRowFiles = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (files.some(f => !valid.includes(f.type))) { showMessage('Only PDF and image files allowed', 'error'); return; }
        if (files.some(f => f.size > 10 * 1024 * 1024)) { showMessage('Max file size is 10MB', 'error'); return; }
        updateEditRow(i, 'files', files);
    };

    // ── validate & save (create — multiple rows) ──
    const saveCreate = async () => {
        let valid = true;
        if (!patientId) { setPatientError('Patient is required.'); valid = false; }
        else setPatientError('');

        const validated = rows.map(row => {
            const r = { ...row };
            if (!row.document_type) { r.typeError = 'Document type is required.'; valid = false; }
            const finalName = row.name.trim() ? sanitizeName(row.name) : autoName(row.document_type, row.upload_date);
            r.name = finalName;
            return r;
        });
        setRows(validated);
        if (!valid) return;

        if (validated.some(r => r.files.length === 0)) { showMessage('Please select at least one file per document', 'error'); return; }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            // One API call per row so each gets its own type/name/files
            for (const row of validated) {
                const fd = new FormData();
                fd.append('patient_id', patientId);
                fd.append('name', row.name);
                fd.append('document_type', row.document_type);
                if (row.upload_date) fd.append('upload_date', row.upload_date);
                row.files.forEach(f => fd.append('files', f));
                const res = await fetch(API_ENDPOINTS.documents, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                    body: fd,
                });
                const data = await res.json();
                if (!res.ok) { showMessage(data.error || 'Operation failed', 'error'); return; }
            }
            showMessage('Document(s) saved successfully.');
            setAddModal(false);
            fetchItems();
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    // ── validate & save (edit) ──
    const saveEdit = async () => {
        let valid = true;
        if (!editPatientId) { setEditPatientError('Patient is required.'); valid = false; }
        else setEditPatientError('');

        const validated = editRows.map(row => {
            const r = { ...row };
            if (!row.document_type) { r.typeError = 'Document type is required.'; valid = false; }
            const finalName = row.name.trim() ? sanitizeName(row.name) : autoName(row.document_type, row.upload_date);
            r.name = finalName;
            return r;
        });
        setEditRows(validated);
        if (!valid) return;

        const primary = validated[0];
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const fd = new FormData();
            fd.append('patient_id', editPatientId);
            fd.append('name', primary.name);
            fd.append('document_type', primary.document_type);
            if (primary.upload_date) fd.append('upload_date', primary.upload_date);

            // Send new files; for rows with no new file, send existing path so backend keeps it
            validated.forEach((row) => {
                if (row.files.length > 0) {
                    row.files.forEach(f => fd.append('files', f));
                } else if (row.existingFile) {
                    fd.append('keep_files', row.existingFile.path);
                }
            });
            fd.append('keep_existing_files', 'true');

            const res = await fetch(`${API_ENDPOINTS.documents}/${editItem.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: fd,
            });
            const data = await res.json();
            if (res.ok) { showMessage('Document updated successfully.'); setAddModal(false); fetchItems(); }
            else showMessage(data.error || 'Update failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setModalMode('create');
        setPatientId(''); setPatientError('');
        setRows([emptyRow()]);
        setAddModal(true);
    };

    const openEdit = (item: any) => {
        setModalMode('edit');
        setEditItem(item);
        setEditPatientId(item.patient_id || '');
        setEditPatientError('');
        const existing = parsedFiles(item);
        // one row per existing file, pre-filled with doc metadata
        const rows = existing.length > 0
            ? existing.map((f: any) => ({
                name: item.name || '',
                document_type: item.document_type || '',
                upload_date: item.upload_date ? item.upload_date.split('T')[0] : new Date().toISOString().split('T')[0],
                files: [],
                nameError: '',
                typeError: '',
                existingFile: f,
            }))
            : [{ ...emptyRow(), name: item.name || '', document_type: item.document_type || '', upload_date: item.upload_date ? item.upload_date.split('T')[0] : new Date().toISOString().split('T')[0] }];
        setEditRows(rows);
        setAddModal(true);
    };

    const openView = (item: any) => {
        setModalMode('view');
        setEditItem(item);
        setEditPatientId(item.patient_id || '');
        const existing = parsedFiles(item);
        const rows = existing.length > 0
            ? existing.map((f: any) => ({
                name: item.name || '',
                document_type: item.document_type || '',
                upload_date: item.upload_date ? item.upload_date.split('T')[0] : new Date().toISOString().split('T')[0],
                files: [],
                nameError: '',
                typeError: '',
                existingFile: f,
            }))
            : [{ ...emptyRow(), name: item.name || '', document_type: item.document_type || '', upload_date: item.upload_date ? item.upload_date.split('T')[0] : new Date().toISOString().split('T')[0] }];
        setEditRows(rows);
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: 'This will delete the document and all files!', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.documents}/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) { showMessage('Document deleted successfully.'); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Delete failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') Swal.fire({ icon: 'success', title: msg, showConfirmButton: true, confirmButtonText: 'OK', timer: 3000, timerProgressBar: true });
        else { const t: any = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, customClass: { container: 'toast' } }); t.fire({ icon: type, title: msg, padding: '10px 20px' }); }
    };

    const getFilesCount = (item: any) => {
        if (!item.files) return 0;
        try { return (typeof item.files === 'string' ? JSON.parse(item.files) : item.files).length; } catch { return 0; }
    };

    const downloadFile = (filePath: string) => {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        window.open(`${base}/${filePath}`, '_blank');
    };

    const parsedFiles = (item: any): any[] => {
        if (!item?.files) return [];
        try { return typeof item.files === 'string' ? JSON.parse(item.files) : item.files; } catch { return []; }
    };

    const isView = modalMode === 'view';

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Documents</h2>
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Document
                </button>
            </div>

            {/* Filters */}
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

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead><tr><th>#</th><th>Document Name</th><th>Patient</th><th>Type</th><th>Files</th><th>Upload Date</th><th className="!text-center">Actions</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">No documents found</td></tr> : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td className="font-semibold">{item.name}</td>
                                        <td>{item.patient_first_name && item.patient_last_name ? `${item.patient_first_name} ${item.patient_last_name}` : '-'}</td>
                                        <td><span className="badge bg-primary">{item.document_type}</span></td>
                                        <td><span className="badge bg-info">{getFilesCount(item)} files</span></td>
                                        <td>{formatDate(item.upload_date)}</td>
                                        <td><div className="flex gap-2 items-center justify-center">
                                            <button type="button" className="btn btn-sm btn-outline-info" onClick={() => openView(item)}><IconEye /></button>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)}><IconPencil /></button>
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
                                <DialogPanel className="panel my-8 w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Document</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">

                                        {/* ── CREATE MODE ── */}
                                        {modalMode === 'create' && (
                                            <>
                                                {/* Patient select */}
                                                <div className="mb-5">
                                                    <label>Patient <span className="text-red-500">*</span></label>
                                                    <select className={`form-select ${patientError ? 'border-red-500' : ''}`} value={patientId}
                                                        onChange={e => { setPatientId(e.target.value); setPatientError(''); }}>
                                                        <option value="">Select Patient</option>
                                                        {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                                    </select>
                                                    {patientError && <p className="mt-1 text-xs text-red-500">{patientError}</p>}
                                                </div>

                                                {/* Document rows */}
                                                <div className="space-y-4">
                                                    {rows.map((row, i) => (
                                                        <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="font-semibold text-sm">Document {i + 1}</span>
                                                                {rows.length > 1 && (
                                                                    <button type="button" className="text-danger hover:text-red-700 text-sm" onClick={() => removeRow(i)}>Remove</button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {/* Type */}
                                                                <div>
                                                                    <label className="text-sm">Document Type <span className="text-red-500">*</span></label>
                                                                    <select className={`form-select ${row.typeError ? 'border-red-500' : ''}`} value={row.document_type}
                                                                        onChange={e => updateRow(i, 'document_type', e.target.value)}>
                                                                        <option value="">Select Type</option>
                                                                        {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                    {row.typeError && <p className="mt-1 text-xs text-red-500">{row.typeError}</p>}
                                                                </div>
                                                                {/* Date */}
                                                                <div>
                                                                    <label className="text-sm">Upload Date</label>
                                                                    <input type="date" className="form-input" value={row.upload_date}
                                                                        onChange={e => updateRow(i, 'upload_date', e.target.value)} />
                                                                </div>
                                                                {/* Name */}
                                                                <div>
                                                                    <label className="text-sm">Document Name <span className="text-gray-400 text-xs">(auto if blank)</span></label>
                                                                    <input type="text" className="form-input" placeholder="Leave blank to auto-generate"
                                                                        value={row.name}
                                                                        onChange={e => updateRow(i, 'name', e.target.value)} />
                                                                    <p className="text-xs text-gray-400 mt-0.5">No special characters allowed</p>
                                                                </div>
                                                                {/* File upload */}
                                                                <div className="sm:col-span-3">
                                                                    <label className="text-sm">Files (PDF / Images, max 10MB each)</label>
                                                                    <input type="file" className="form-input" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                                                        onChange={e => handleRowFiles(i, e)} />
                                                                    {row.files.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {row.files.map((f, fi) => (
                                                                                <span key={fi} className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 flex items-center gap-1">
                                                                                    {fileIcon(f.type)} {f.name} ({formatSize(f.size)})
                                                                                    <button type="button" className="text-danger ml-1" onClick={() => {
                                                                                        const updated = [...row.files]; updated.splice(fi, 1);
                                                                                        updateRow(i, 'files', updated);
                                                                                    }}>×</button>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add more row */}
                                                <button type="button" className="mt-3 btn btn-outline-primary btn-sm" onClick={addRow}>
                                                    <IconPlus className="w-4 h-4 mr-1" />Add More Document
                                                </button>

                                                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>Cancel</button>
                                                    <button type="button" className="btn btn-primary" onClick={saveCreate} disabled={loading}>{loading ? 'Saving...' : 'Save Documents'}</button>
                                                </div>
                                            </>
                                        )}

                                        {/* ── EDIT / VIEW MODE ── */}
                                        {(modalMode === 'edit' || modalMode === 'view') && (
                                            <>
                                                {/* Patient select */}
                                                <div className="mb-5">
                                                    <label>Patient <span className="text-red-500">*</span></label>
                                                    <select className={`form-select ${editPatientError ? 'border-red-500' : ''}`} value={editPatientId}
                                                        onChange={e => { setEditPatientId(e.target.value); setEditPatientError(''); }} disabled={isView}>
                                                        <option value="">Select Patient</option>
                                                        {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                                    </select>
                                                    {editPatientError && <p className="mt-1 text-xs text-red-500">{editPatientError}</p>}
                                                </div>

                                                {/* Document rows — identical layout to create */}
                                                <div className="space-y-4">
                                                    {editRows.map((row, i) => (
                                                        <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="font-semibold text-sm">Document {i + 1}</span>
                                                                {!isView && editRows.length > 1 && (
                                                                    <button type="button" className="text-danger hover:text-red-700 text-sm" onClick={() => removeEditRow(i)}>Remove</button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {/* Type */}
                                                                <div>
                                                                    <label className="text-sm">Document Type {!isView && <span className="text-red-500">*</span>}</label>
                                                                    <select className={`form-select ${row.typeError ? 'border-red-500' : ''}`} value={row.document_type}
                                                                        onChange={e => updateEditRow(i, 'document_type', e.target.value)} disabled={isView}>
                                                                        <option value="">Select Type</option>
                                                                        {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                    {row.typeError && <p className="mt-1 text-xs text-red-500">{row.typeError}</p>}
                                                                </div>
                                                                {/* Date */}
                                                                <div>
                                                                    <label className="text-sm">Upload Date</label>
                                                                    <input type="date" className="form-input" value={row.upload_date}
                                                                        onChange={e => updateEditRow(i, 'upload_date', e.target.value)} disabled={isView} />
                                                                </div>
                                                                {/* Name */}
                                                                <div>
                                                                    <label className="text-sm">Document Name <span className="text-gray-400 text-xs">(auto if blank)</span></label>
                                                                    <input type="text" className="form-input" placeholder="Leave blank to auto-generate"
                                                                        value={row.name} onChange={e => updateEditRow(i, 'name', e.target.value)} disabled={isView} />
                                                                    {!isView && <p className="text-xs text-gray-400 mt-0.5">No special characters allowed</p>}
                                                                </div>
                                                                {/* Files */}
                                                                <div className="sm:col-span-3">
                                                                    <label className="text-sm">Files (PDF / Images, max 10MB each)</label>
                                                                    {/* Show existing file name as hint */}
                                                                    {row.existingFile && row.files.length === 0 && (
                                                                        <div className="flex items-center gap-2 mb-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                                                            {fileIcon(row.existingFile.mimetype)} {row.existingFile.originalname}
                                                                            <span className="text-xs text-gray-400">({formatSize(row.existingFile.size)})</span>
                                                                            {!isView && <span className="text-xs text-gray-400 ml-auto">Choose a file below to replace</span>}
                                                                            <button type="button" className="btn btn-sm btn-outline-primary ml-auto" onClick={() => downloadFile(row.existingFile.path)}><IconDownload className="w-4 h-4" /></button>
                                                                        </div>
                                                                    )}
                                                                    {!isView && (
                                                                        <input type="file" className="form-input" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                                                            onChange={e => handleEditRowFiles(i, e)} />
                                                                    )}
                                                                    {row.files.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {row.files.map((f, fi) => (
                                                                                <span key={fi} className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 flex items-center gap-1">
                                                                                    {fileIcon(f.type)} {f.name} ({formatSize(f.size)})
                                                                                    <button type="button" className="text-danger ml-1" onClick={() => {
                                                                                        const updated = [...row.files]; updated.splice(fi, 1);
                                                                                        updateEditRow(i, 'files', updated);
                                                                                    }}>×</button>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add more row */}
                                                {!isView && (
                                                    <button type="button" className="mt-3 btn btn-outline-primary btn-sm" onClick={addEditRow}>
                                                        <IconPlus className="w-4 h-4 mr-1" />Add More Document
                                                    </button>
                                                )}

                                                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>{isView ? 'Close' : 'Cancel'}</button>
                                                    {!isView && <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={loading}>{loading ? 'Saving...' : 'Update Document'}</button>}
                                                </div>
                                            </>
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

export default DocumentsCRUD;
