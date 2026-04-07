'use client';
import React, { useEffect, useState, Fragment } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';

const defaultForm = { name: '', label: '', icon: '', path: '', sort_order: 0, is_active: true };

const MenusPage = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...defaultForm });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const token = () => localStorage.getItem('auth_token');
    const headers = () => ({ 'Authorization': `Bearer ${token()}`, 'ngrok-skip-browser-warning': 'true' });
    const jsonHeaders = () => ({ ...headers(), 'Content-Type': 'application/json' });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.menus}`, { headers: headers() });
            const data = await res.json();
            if (res.ok) setItems(data.data || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.label.trim()) e.label = 'Label is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const openCreate = () => { setEditId(null); setForm({ ...defaultForm }); setErrors({}); setModal(true); };
    const openEdit = (item: any) => {
        setEditId(item.id);
        setForm({ name: item.name, label: item.label, icon: item.icon || '', path: item.path || '', sort_order: item.sort_order || 0, is_active: item.is_active });
        setErrors({});
        setModal(true);
    };

    const save = async () => {
        if (!validate()) return;
        try {
            const url = editId ? `${API_ENDPOINTS.menus}/${editId}` : API_ENDPOINTS.menus;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: jsonHeaders(), body: JSON.stringify(form) });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: editId ? 'Menu updated' : 'Menu created', timer: 1500, showConfirmButton: false });
                setModal(false); fetchItems();
            } else Swal.fire('Error', data.error || 'Failed', 'error');
        } catch (e: any) { Swal.fire('Error', e.message, 'error'); }
    };

    const deleteItem = async (item: any) => {
        const r = await Swal.fire({ icon: 'warning', title: 'Delete menu?', text: item.label, showCancelButton: true, confirmButtonText: 'Delete' });
        if (!r.value) return;
        const res = await fetch(`${API_ENDPOINTS.menus}/${item.id}`, { method: 'DELETE', headers: headers() });
        if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false }); fetchItems(); }
        else { const d = await res.json(); Swal.fire('Error', d.error, 'error'); }
    };

    const cv = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'sort_order' ? parseInt(value) || 0 : value) }));
        if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Menus</h2>
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Menu
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span></div>
            ) : (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr><th>#</th><th>Name</th><th>Label</th><th>Path</th><th>Icon</th><th>Order</th><th>Status</th><th className="!text-center">Actions</th></tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-8">No menus found</td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{item.name}</code></td>
                                        <td className="font-semibold">{item.label}</td>
                                        <td className="text-sm text-gray-500">{item.path || '-'}</td>
                                        <td className="text-sm text-gray-500">{item.icon || '-'}</td>
                                        <td>{item.sort_order}</td>
                                        <td>
                                            <span className={`badge ${item.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)}><IconPencil /></button>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}><IconTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Transition appear show={modal} as={Fragment}>
                <Dialog as="div" open={modal} onClose={() => setModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{editId ? 'Edit' : 'Add'} Menu</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label>Name (key) <span className="text-red-500">*</span></label>
                                                <input type="text" name="name" className={`form-input ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g. my-menu" value={form.name} onChange={cv} />
                                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label>Label <span className="text-red-500">*</span></label>
                                                <input type="text" name="label" className={`form-input ${errors.label ? 'border-red-500' : ''}`} placeholder="Display name" value={form.label} onChange={cv} />
                                                {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label}</p>}
                                            </div>
                                            <div>
                                                <label>Path</label>
                                                <input type="text" name="path" className="form-input" placeholder="/management/my-menu" value={form.path} onChange={cv} />
                                            </div>
                                            <div>
                                                <label>Icon</label>
                                                <input type="text" name="icon" className="form-input" placeholder="IconFile" value={form.icon} onChange={cv} />
                                            </div>
                                            <div>
                                                <label>Sort Order</label>
                                                <input type="number" name="sort_order" className="form-input" min={0} value={form.sort_order} onChange={cv} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-6">
                                                <input type="checkbox" name="is_active" className="form-checkbox" checked={form.is_active} onChange={cv} />
                                                <label>Active</label>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 border-t pt-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModal(false)}>Cancel</button>
                                            <button type="button" className="btn btn-primary" onClick={save}>{editId ? 'Update' : 'Create'} Menu</button>
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

export default MenusPage;
