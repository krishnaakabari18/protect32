'use client';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';
import { useDropdown } from '@/hooks/useDropdown';

const PrescriptionsCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Form state
    const [params, setParams] = useState<any>({
        id: null, provider_id: '', patient_id: '',
        medication_name: '', dosage: '', frequency: '',
        duration: '', date_prescribed: '', instructions: '',
    });
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Provider dropdown (all providers)
    const { options: providerOptions } = useDropdown({ type: 'providers' });

    // Patient dropdown — only patients with non-cancelled appointments for selected provider
    const [patientOptions, setPatientOptions] = useState<any[]>([]);
    const fetchPatientsByProvider = useCallback(async (providerId: string) => {
        if (!providerId) { setPatientOptions([]); return; }
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.dropdowns}/provider-patients?parent_id=${providerId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setPatientOptions(data.data || []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (params.provider_id) fetchPatientsByProvider(params.provider_id);
        else setPatientOptions([]);
    }, [params.provider_id, fetchPatientsByProvider]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({
                page: pagination.page.toString(), limit: pagination.limit.toString(),
                ...(searchQuery && { search: searchQuery }),
            });
            const res = await fetch(`${API_ENDPOINTS.prescriptions}?${q}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [pagination.page, pagination.limit, searchQuery]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!params.provider_id)    e.provider_id    = 'Provider is required';
        if (!params.patient_id)     e.patient_id     = 'Patient is required';
        if (!params.medication_name) e.medication_name = 'Medication name is required';
        if (!params.dosage)         e.dosage         = 'Dosage is required';
        if (!params.frequency)      e.frequency      = 'Frequency is required';
        setErrors(e);
        setTouched({ provider_id: true, patient_id: true, medication_name: true, dosage: true, frequency: true });
        return Object.keys(e).length === 0;
    };

    const saveItem = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.prescriptions}/${params.id}` : API_ENDPOINTS.prescriptions;
            const method = params.id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(params),
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: `Prescription ${params.id ? 'updated' : 'added'} successfully.`, timer: 2000, showConfirmButton: false });
                setAddModal(false);
                fetchItems();
            } else {
                Swal.fire({ icon: 'error', title: data.error || 'Operation failed' });
            }
        } catch (e: any) { Swal.fire({ icon: 'error', title: e.message }); }
        finally { setLoading(false); }
    };

    const openModal = async (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        setTouched({}); setErrors({});
        if (item) {
            setParams({
                id: item.id,
                provider_id: item.provider_id || '',
                patient_id: item.patient_id || '',
                medication_name: item.medication_name || '',
                dosage: item.dosage || '',
                frequency: item.frequency || '',
                duration: item.duration || '',
                date_prescribed: item.date_prescribed ? item.date_prescribed.split('T')[0] : '',
                instructions: item.instructions || '',
            });
            if (item.provider_id) await fetchPatientsByProvider(item.provider_id);
        } else {
            setParams({ id: null, provider_id: '', patient_id: '', medication_name: '', dosage: '', frequency: '', duration: '', date_prescribed: '', instructions: '' });
            setPatientOptions([]);
        }
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const r = await Swal.fire({ icon: 'warning', title: 'Delete this prescription?', showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_ENDPOINTS.prescriptions}/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
        if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }); fetchItems(); }
    };

    const isView = modalMode === 'view';

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Prescriptions</h2>
                <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Prescription
                </button>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input type="text" className="form-input w-full max-w-sm"
                    placeholder="Search by medication, patient..."
                    value={searchInput}
                    onChange={e => {
                        const val = e.target.value; setSearchInput(val);
                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(() => { setSearchQuery(val); setPagination(p => ({ ...p, page: 1 })); }, 400);
                    }} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr><th>#</th><th>Patient</th><th>Provider</th><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Date</th><th className="!text-center">Actions</th></tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">No prescriptions found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td>{item.patient_first_name} {item.patient_last_name}</td>
                                        <td>{item.provider_first_name} {item.provider_last_name}</td>
                                        <td className="font-semibold">{item.medication_name}</td>
                                        <td>{item.dosage}</td>
                                        <td>{item.frequency}</td>
                                        <td>{item.date_prescribed ? item.date_prescribed.split('T')[0] : '-'}</td>
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
                                <DialogPanel className="panel my-8 w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Prescription</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* Provider — first */}
                                            <div>
                                                <label>Provider <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    options={providerOptions}
                                                    value={params.provider_id}
                                                    onChange={val => {
                                                        setParams((p: any) => ({ ...p, provider_id: val, patient_id: '' }));
                                                        setErrors(e => { const n={...e}; delete n.provider_id; return n; });
                                                    }}
                                                    placeholder="Select Provider"
                                                    disabled={isView}
                                                    className={touched.provider_id && errors.provider_id ? 'border-red-500' : ''}
                                                />
                                                {touched.provider_id && errors.provider_id && <p className="mt-1 text-xs text-red-500">{errors.provider_id}</p>}
                                            </div>

                                            {/* Patient — depends on provider */}
                                            <div>
                                                <label>Patient <span className="text-red-500">*</span></label>
                                                <SearchableSelect
                                                    options={patientOptions}
                                                    value={params.patient_id}
                                                    onChange={val => {
                                                        setParams((p: any) => ({ ...p, patient_id: val }));
                                                        setErrors(e => { const n={...e}; delete n.patient_id; return n; });
                                                    }}
                                                    placeholder={!params.provider_id ? 'Select Provider first' : patientOptions.length === 0 ? 'No patients found' : 'Select Patient'}
                                                    disabled={isView || !params.provider_id}
                                                    className={touched.patient_id && errors.patient_id ? 'border-red-500' : ''}
                                                />
                                                {touched.patient_id && errors.patient_id && <p className="mt-1 text-xs text-red-500">{errors.patient_id}</p>}
                                            </div>

                                            {/* Medication Name */}
                                            <div>
                                                <label>Medication Name <span className="text-red-500">*</span></label>
                                                <input type="text" className={`form-input ${touched.medication_name && errors.medication_name ? 'border-red-500' : ''}`}
                                                    placeholder="Enter medication name"
                                                    value={params.medication_name} disabled={isView}
                                                    onChange={e => { setParams((p: any) => ({ ...p, medication_name: e.target.value })); setErrors(e2 => { const n={...e2}; delete n.medication_name; return n; }); }} />
                                                {touched.medication_name && errors.medication_name && <p className="mt-1 text-xs text-red-500">{errors.medication_name}</p>}
                                            </div>

                                            {/* Dosage */}
                                            <div>
                                                <label>Dosage <span className="text-red-500">*</span></label>
                                                <input type="text" className={`form-input ${touched.dosage && errors.dosage ? 'border-red-500' : ''}`}
                                                    placeholder="e.g., 500mg"
                                                    value={params.dosage} disabled={isView}
                                                    onChange={e => { setParams((p: any) => ({ ...p, dosage: e.target.value })); setErrors(e2 => { const n={...e2}; delete n.dosage; return n; }); }} />
                                                {touched.dosage && errors.dosage && <p className="mt-1 text-xs text-red-500">{errors.dosage}</p>}
                                            </div>

                                            {/* Frequency */}
                                            <div>
                                                <label>Frequency <span className="text-red-500">*</span></label>
                                                <input type="text" className={`form-input ${touched.frequency && errors.frequency ? 'border-red-500' : ''}`}
                                                    placeholder="e.g., Twice daily"
                                                    value={params.frequency} disabled={isView}
                                                    onChange={e => { setParams((p: any) => ({ ...p, frequency: e.target.value })); setErrors(e2 => { const n={...e2}; delete n.frequency; return n; }); }} />
                                                {touched.frequency && errors.frequency && <p className="mt-1 text-xs text-red-500">{errors.frequency}</p>}
                                            </div>

                                            {/* Duration */}
                                            <div>
                                                <label>Duration</label>
                                                <input type="text" className="form-input" placeholder="e.g., 7 days"
                                                    value={params.duration} disabled={isView}
                                                    onChange={e => setParams((p: any) => ({ ...p, duration: e.target.value }))} />
                                            </div>

                                            {/* Date Prescribed */}
                                            <div>
                                                <label>Date Prescribed</label>
                                                <input type="date" className="form-input"
                                                    value={params.date_prescribed} disabled={isView}
                                                    onChange={e => setParams((p: any) => ({ ...p, date_prescribed: e.target.value }))} />
                                            </div>

                                            {/* Instructions */}
                                            <div className="sm:col-span-2">
                                                <label>Instructions</label>
                                                <textarea rows={3} className="form-textarea" placeholder="Special instructions"
                                                    value={params.instructions} disabled={isView}
                                                    onChange={e => setParams((p: any) => ({ ...p, instructions: e.target.value }))} />
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

export default PrescriptionsCRUD;
