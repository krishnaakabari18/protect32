'use client';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';
import { useDropdown } from '@/hooks/useDropdown';

interface ProcedureRow {
    procedure_id: string;
    procedure_name: string;
    price: string;       // provider's fee (auto-filled, editable)
    discount: string;    // savings % (0-100)
    final_price: string; // auto-calculated: price - (price * discount/100)
}

const emptyRow = (): ProcedureRow => ({ procedure_id: '', procedure_name: '', price: '', discount: '0', final_price: '' });

const STATUS_COLORS: Record<string, string> = {
    Proposed: 'bg-info', Consented: 'bg-primary', Paid: 'bg-success', Rejected: 'bg-danger',
};

const TreatmentPlansCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Form state
    const [params, setParams] = useState<any>({
        id: null, patient_id: '', provider_id: '',
        treatment_description: '', start_date: '', end_date: '',
        status: 'Proposed', notes: '',
    });
    const [procedureRows, setProcedureRows] = useState<ProcedureRow[]>([emptyRow()]);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Provider procedures dropdown (depends on provider_id)
    const [providerProcedures, setProviderProcedures] = useState<any[]>([]);

    const fetchProviderProcedures = useCallback(async (providerId: string) => {
        if (!providerId) { setProviderProcedures([]); return; }
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.dropdowns}/provider-procedures?parent_id=${providerId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setProviderProcedures(data.data || []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (params.provider_id) fetchProviderProcedures(params.provider_id);
        else setProviderProcedures([]);
    }, [params.provider_id, fetchProviderProcedures]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({
                page: pagination.page.toString(), limit: pagination.limit.toString(),
                ...(filterStatus && { status: filterStatus }),
            });
            const res = await fetch(`${API_ENDPOINTS.treatmentPlans}?${q}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
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

    // Compute totals
    const totalPrice = procedureRows.reduce((sum, r) => sum + (parseFloat(r.final_price) || 0), 0);

    // Update a procedure row — auto-recalculate final_price when price or discount changes
    const updateRow = (i: number, field: keyof ProcedureRow, val: string) => {
        setProcedureRows(prev => {
            const next = [...prev];
            const row = { ...next[i], [field]: val };
            if (field === 'price' || field === 'discount') {
                const price = parseFloat(field === 'price' ? val : row.price) || 0;
                const disc = parseFloat(field === 'discount' ? val : row.discount) || 0;
                row.final_price = (price - (price * disc / 100)).toFixed(2);
            }
            next[i] = row;
            return next;
        });
    };

    const handleProcedureSelect = (i: number, procedureId: string, opt?: any) => {
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
                final_price: priceNum > 0 ? (priceNum - (priceNum * disc / 100)).toFixed(2) : '',
            };
            return next;
        });
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!params.patient_id) e.patient_id = 'Patient is required';
        if (!params.provider_id) e.provider_id = 'Provider is required';
        const validRows = procedureRows.filter(r => r.procedure_id);
        if (validRows.length === 0) e.procedures = 'At least one procedure is required';
        setErrors(e);
        setTouched({ patient_id: true, provider_id: true, procedures: true });
        return Object.keys(e).length === 0;
    };

    const saveItem = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const validRows = procedureRows.filter(r => r.procedure_id);
            // diagnosis = array of procedure IDs (backward compat)
            const diagnosis = JSON.stringify(validRows.map(r => r.procedure_id));
            // procedure_items = full detail for new UI
            const procedure_items = JSON.stringify(validRows.map(r => ({
                procedure_id: r.procedure_id,
                procedure_name: r.procedure_name,
                price: parseFloat(r.price) || 0,
                discount: parseFloat(r.discount) || 0,
                final_price: parseFloat(r.final_price) || 0,
            })));
            const estimated_cost = totalPrice.toFixed(2);

            const body = { ...params, diagnosis, procedure_items, estimated_cost };
            if (!body.id) delete body.id;

            const url = params.id ? `${API_ENDPOINTS.treatmentPlans}/${params.id}` : API_ENDPOINTS.treatmentPlans;
            const method = params.id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: `Treatment plan ${params.id ? 'updated' : 'created'} successfully.`, timer: 2000, showConfirmButton: false });
                setAddModal(false);
                fetchItems();
            } else {
                Swal.fire({ icon: 'error', title: data.error || 'Operation failed' });
            }
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error: ' + err.message });
        } finally { setLoading(false); }
    };

    const openModal = async (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        setTouched({}); setErrors({});
        if (item) {
            setParams({
                id: item.id, patient_id: item.patient_id || '', provider_id: item.provider_id || '',
                treatment_description: item.treatment_description || '',
                start_date: item.start_date ? item.start_date.split('T')[0] : '',
                end_date: item.end_date ? item.end_date.split('T')[0] : '',
                status: item.status || 'Proposed', notes: item.notes || '',
            });
            // Pre-fetch provider procedures so rows display correctly
            if (item.provider_id) await fetchProviderProcedures(item.provider_id);
            // Load procedure_items if available, else fall back to diagnosis
            if (item.procedure_items) {
                const rows = typeof item.procedure_items === 'string' ? JSON.parse(item.procedure_items) : item.procedure_items;
                setProcedureRows(rows.length > 0 ? rows.map((r: any) => ({
                    procedure_id: r.procedure_id || '',
                    procedure_name: r.procedure_name || '',
                    price: String(r.price || ''),
                    discount: String(r.discount || '0'),
                    final_price: String(r.final_price || r.price || ''),
                })) : [emptyRow()]);
            } else if (item.diagnosis) {
                const ids = typeof item.diagnosis === 'string' ? JSON.parse(item.diagnosis) : item.diagnosis;
                setProcedureRows(ids.length > 0 ? ids.map((id: string) => ({ procedure_id: id, procedure_name: '', price: '', discount: '0', final_price: '' })) : [emptyRow()]);
            } else {
                setProcedureRows([emptyRow()]);
            }
        } else {
            setParams({ id: null, patient_id: '', provider_id: '', treatment_description: '', start_date: '', end_date: '', status: 'Proposed', notes: '' });
            setProcedureRows([emptyRow()]);
            setProviderProcedures([]);
        }
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.treatmentPlans}/${item.id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted successfully.', timer: 1500, showConfirmButton: false }); fetchItems(); }
        } catch (err: any) { Swal.fire({ icon: 'error', title: err.message }); }
    };

    const isView = modalMode === 'view';
    const selectedProcedureIds = procedureRows.map(r => r.procedure_id).filter(Boolean);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Treatment Plans</h2>
                <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Treatment Plan
                </button>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-5">
                <select className="form-select w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Status</option>
                    {['Proposed','Consented','Paid','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
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
                                <tr><th>#</th><th>Patient</th><th>Provider</th><th>Procedures</th><th>Total (₹)</th><th>Status</th><th>Start Date</th><th className="!text-center">Actions</th></tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">No treatment plans found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td>{item.patient_first_name} {item.patient_last_name}</td>
                                        <td>{item.provider_full_name || '-'}</td>
                                        <td className="max-w-[200px]"><span className="text-sm">{item.diagnosis_names || '-'}</span></td>
                                        <td className="font-semibold">₹{parseFloat(item.estimated_cost || 0).toFixed(2)}</td>
                                        <td><span className={`badge ${STATUS_COLORS[item.status] || 'bg-secondary'}`}>{item.status}</span></td>
                                        <td>{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</td>
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
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Treatment Plan</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 max-h-[85vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            {/* Patient */}
                                            <div>
                                                <label>Patient <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    dropdownType="patients"
                                                    value={params.patient_id}
                                                    onChange={val => { setParams((p: any) => ({ ...p, patient_id: val })); setErrors(e => { const n={...e}; delete n.patient_id; return n; }); }}
                                                    placeholder="Select Patient"
                                                    disabled={isView}
                                                    className={errors.patient_id ? 'border-red-500' : ''}
                                                />
                                                {errors.patient_id && <p className="mt-1 text-xs text-red-500">{errors.patient_id}</p>}
                                            </div>
                                            {/* Provider */}
                                            <div>
                                                <label>Provider <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    dropdownType="providers"
                                                    value={params.provider_id}
                                                    onChange={val => {
                                                        setParams((p: any) => ({ ...p, provider_id: val }));
                                                        setProcedureRows([emptyRow()]);
                                                        setErrors(e => { const n={...e}; delete n.provider_id; return n; });
                                                    }}
                                                    placeholder="Select Provider"
                                                    disabled={isView}
                                                    className={errors.provider_id ? 'border-red-500' : ''}
                                                />
                                                {errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id}</p>}
                                            </div>
                                        </div>

                                        {/* Procedure Rows */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="font-semibold">Procedures <span className="text-red-500">*</span></label>
                                                {!isView && (
                                                    <button type="button" className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setProcedureRows(prev => [...prev, emptyRow()])}>
                                                        <IconPlus className="w-4 h-4 mr-1" />Add Procedure
                                                    </button>
                                                )}
                                            </div>

                                            {/* Header row */}
                                            <div className="grid gap-2 mb-1 text-xs text-gray-500 font-medium px-1" style={{gridTemplateColumns: '3fr 2fr 1.2fr 2fr 36px'}}>
                                                <div>Procedure</div>
                                                <div>Provider Price (₹)</div>
                                                <div>Savings (%)</div>
                                                <div>Final Price (₹)</div>
                                                {!isView && <div></div>}
                                            </div>

                                            <div className="space-y-2">
                                                {procedureRows.map((row, i) => {
                                                    const usedIds = procedureRows.map((r, ri) => ri !== i ? r.procedure_id : null).filter(Boolean);
                                                    const availableOptions = providerProcedures
                                                        .filter(p => !usedIds.includes(p.value))
                                                        .concat(row.procedure_id && !providerProcedures.find(p => p.value === row.procedure_id)
                                                            ? [{ value: row.procedure_id, label: row.procedure_name, meta: { price: row.price } }]
                                                            : []);

                                                    return (
                                                        <div key={i} className="grid gap-2 items-center" style={{gridTemplateColumns: '3fr 2fr 1.2fr 2fr 36px'}}>
                                                            <div>
                                                                <SearchableSelect
                                                                    options={availableOptions}
                                                                    value={row.procedure_id}
                                                                    onChange={(val, opt) => handleProcedureSelect(i, val, opt)}
                                                                    placeholder={!params.provider_id ? 'Select Provider first' : 'Select Procedure'}
                                                                    disabled={isView || !params.provider_id}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="number"
                                                                    className="form-input"
                                                                    placeholder="0.00"
                                                                    value={row.price}
                                                                    min="0"
                                                                    disabled={isView}
                                                                    onChange={e => updateRow(i, 'price', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="number"
                                                                    className="form-input text-center"
                                                                    placeholder="0"
                                                                    value={row.discount}
                                                                    min="0"
                                                                    max="100"
                                                                    disabled={isView}
                                                                    onChange={e => updateRow(i, 'discount', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="number"
                                                                    className="form-input font-semibold text-primary bg-primary/5"
                                                                    placeholder="0.00"
                                                                    value={row.final_price}
                                                                    min="0"
                                                                    readOnly
                                                                    disabled={isView}
                                                                />
                                                            </div>
                                                            {!isView && (
                                                                <div>
                                                                    <button type="button" className="btn btn-sm btn-outline-danger px-2 w-full"
                                                                        onClick={() => setProcedureRows(prev => prev.length === 1 ? [emptyRow()] : prev.filter((_, ri) => ri !== i))}>
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {errors.procedures && <p className="mt-1 text-xs text-red-500">{errors.procedures}</p>}

                                            {/* Total */}
                                            <div className="mt-3 flex justify-end">
                                                <div className="bg-primary/10 rounded-lg px-4 py-2 text-right">
                                                    <div className="text-xs text-gray-500">Total Final Price</div>
                                                    <div className="text-xl font-bold text-primary">₹{totalPrice.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label>Treatment Description</label>
                                                <textarea rows={2} className="form-textarea" placeholder="Describe the treatment plan"
                                                    value={params.treatment_description}
                                                    onChange={e => setParams((p: any) => ({ ...p, treatment_description: e.target.value }))}
                                                    disabled={isView} />
                                            </div>
                                            <div>
                                                <label>Start Date</label>
                                                <input type="date" className="form-input" value={params.start_date}
                                                    onChange={e => setParams((p: any) => ({ ...p, start_date: e.target.value }))} disabled={isView} />
                                            </div>
                                            <div>
                                                <label>End Date</label>
                                                <input type="date" className="form-input" value={params.end_date}
                                                    onChange={e => setParams((p: any) => ({ ...p, end_date: e.target.value }))} disabled={isView} />
                                            </div>
                                            <div>
                                                <label>Status</label>
                                                <select className="form-select" value={params.status}
                                                    onChange={e => setParams((p: any) => ({ ...p, status: e.target.value }))} disabled={isView}>
                                                    {['Proposed','Consented','Paid','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label>Notes</label>
                                                <textarea rows={2} className="form-textarea" placeholder="Additional notes"
                                                    value={params.notes}
                                                    onChange={e => setParams((p: any) => ({ ...p, notes: e.target.value }))}
                                                    disabled={isView} />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>{isView ? 'Close' : 'Cancel'}</button>
                                            {!isView && (
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>
                                                    {loading ? 'Saving...' : params.id ? 'Update' : 'Add'}
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

export default TreatmentPlansCRUD;
