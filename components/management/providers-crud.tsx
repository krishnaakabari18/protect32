'use client';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, buildMediaUrl } from '@/config/api.config';

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
    { id: 'provider', label: 'Provider Info' },
    { id: 'clinic', label: 'Clinic Details' },
    { id: 'hours', label: 'Clinic Hours' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'specialists', label: 'Specialists' },
    { id: 'bank', label: 'Bank Details' },
];

const FIELD_TAB: Record<string, string> = {
    id: 'provider', date_of_birth: 'provider',
    pincode: 'provider',
    years_of_experience: 'provider', state_dental_council_reg_number: 'provider',
    procedure_ids: 'provider',
    clinic_0_pan_no: 'clinic', clinic_0_name: 'clinic', clinic_0_contact_number: 'clinic',
    clinic_0_specialty: 'clinic', clinic_0_address: 'clinic', clinic_0_city: 'clinic',
    clinic_0_state: 'clinic', clinic_0_pin_code: 'clinic',
};

const DEFAULT_TIME_SLOTS = [
    { day: 'Monday',    is_open: true,  open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: true,  start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Tuesday',   is_open: true,  open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: true,  start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Wednesday', is_open: true,  open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: true,  start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Thursday',  is_open: true,  open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: true,  start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Friday',    is_open: true,  open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: true,  start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Saturday',  is_open: true,  open_time: '09:00', close_time: '14:00', slot_duration: 30,
      morning: { enabled: true,  start: '09:00', end: '12:00' },
      afternoon: { enabled: false, start: '12:00', end: '14:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
    { day: 'Sunday',    is_open: false, open_time: '09:00', close_time: '18:00', slot_duration: 30,
      morning: { enabled: false, start: '09:00', end: '12:00' },
      afternoon: { enabled: false, start: '12:00', end: '16:00' },
      evening: { enabled: false, start: '16:00', end: '20:00' } },
];

const DEFAULT_CLINIC = {
    pan_no: '', name: '', contact_number: '', specialty: '',
    address: '', city: '', state: '', pin_code: '',
    google_map_url: '', working_hours: '', dental_chairs: 2, clinic_board: null,
};

const DEFAULT_VALUES = {
    id: '', date_of_birth: '', pincode: '',
    first_name: '', last_name: '',
    whatsapp_number: '', same_as_whatsapp: false,
    email: '', years_of_experience: 0, state_dental_council_reg_number: '',
    state_dental_council_reg_photo: null, profile_photo: null,
    dental_chairs: '', iopa_xray_type: 'Digital', has_opg: false,
    has_ultrasonic_cleaner: true, intraoral_camera_type: '', rct_equipment: '',
    autoclave_type: '', sterilization_protocol: '', disinfection_protocol: '',
    specialists_availability: [],
    bank_name: '', bank_branch_name: '', bank_account_name: '',
    bank_account_number: '', bank_account_type: '', bank_micr_no: '', bank_ifsc_code: '',
    number_of_clinics: 1,
    clinics: [{ ...DEFAULT_CLINIC }],
    specialty: '', experience_years: 0, clinic_name: '', contact_number: '',
    location: '', coordinates: null, about: '', availability: '',
    time_slots: DEFAULT_TIME_SLOTS.map(s => ({ ...s })),
    clinic_photos: [],
    clinic_video_url: '',
    procedure_ids: [] as string[],
};

const ProvidersCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [addProcedureModal, setAddProcedureModal] = useState(false);
    const [newProcedure, setNewProcedure] = useState({ name: '', category: 'Diagnostic & Preventive' });
    const [activeTab, setActiveTab] = useState('provider');
    const [items, setItems] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [procedures, setProcedures] = useState<any[]>([]);
    const [procedureDropdownOpen, setProcedureDropdownOpen] = useState(false);
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [statesList, setStatesList] = useState<any[]>([]);
    const [citiesList, setCitiesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_VALUES)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    // drag state for clinic photos
    const dragIndex = useRef<number | null>(null);

    const availabilityOptions = ['On Call','Regular','Not Available'];
    const accountTypes = ['Savings','Current','Business'];
    const cities = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad'];
    const states = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','West Bengal','Telangana','Gujarat'];

    useEffect(() => { fetchUsers(); fetchItems(); fetchProcedures(); fetchSpecialties(); fetchStates(); }, [pagination.page, pagination.limit]);

    const fetchSpecialties = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.specialties}?limit=1000&is_active=true`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setSpecialties(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchStates = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.statesCities}/states`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            if (res.ok) setStatesList(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchCitiesByState = async (stateName: string) => {
        if (!stateName) { setCitiesList([]); return; }
        try {
            const token = localStorage.getItem('auth_token');
            // Find state id by name
            const state = statesList.find(s => s.name === stateName);
            if (!state) return;
            const res = await fetch(`${API_ENDPOINTS.statesCities}/states/${state.id}/cities`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            if (res.ok) setCitiesList(data.data || []);
        } catch (e) { console.error(e); }
    };

    // Close procedure dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.procedure-dropdown-container')) setProcedureDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchProcedures = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.procedures}?limit=1000&is_active=true`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setProcedures(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.users}?user_type=provider&limit=1000`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) setUsers(data.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const q = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString(), search });
            const res = await fetch(`${API_ENDPOINTS.providers}?${q}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            if (res.ok) {
                setItems(data.data || []);
                if (data.pagination) setPagination(p => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // ─── Validation ──────────────────────────────────────────────────────────
    const validateForm = () => {
        const e: Record<string, string> = {};
        
        console.log('=== VALIDATING FORM ===');
        console.log('Modal Mode:', modalMode);
        console.log('Form Data:', {
            id: params.id,
            date_of_birth: params.date_of_birth,
            pincode: params.pincode,
            years_of_experience: params.years_of_experience,
            state_dental_council_reg_number: params.state_dental_council_reg_number,
            procedure_ids: params.procedure_ids,
            procedure_count: params.procedure_ids?.length || 0,
            clinic_0_pan_no: params.clinics?.[0]?.pan_no,
            clinic_0_name: params.clinics?.[0]?.name,
            clinic_0_contact_number: params.clinics?.[0]?.contact_number,
            clinic_0_specialty: params.clinics?.[0]?.specialty,
            clinic_0_address: params.clinics?.[0]?.address,
            clinic_0_city: params.clinics?.[0]?.city,
            clinic_0_state: params.clinics?.[0]?.state,
            clinic_0_pin_code: params.clinics?.[0]?.pin_code,
        });
        
        if (modalMode === 'create' && !params.id) e.id = 'Please select a user';
        if (!params.date_of_birth) e.date_of_birth = 'Date of birth is required';
        if (!params.pincode) e.pincode = 'Pincode is required';
        if (params.years_of_experience === '' || params.years_of_experience === null || params.years_of_experience === undefined) e.years_of_experience = 'Years of experience is required';
        if (!params.state_dental_council_reg_number) e.state_dental_council_reg_number = 'Registration number is required';
        
        // Validate at least one procedure is selected
        if (!params.procedure_ids || params.procedure_ids.length === 0) {
            e.procedure_ids = 'At least one procedure must be selected';
        }
        
        const c = params.clinics?.[0];
        if (c) {
            if (!c.pan_no) e.clinic_0_pan_no = 'Pan No is required';
            if (!c.name) e.clinic_0_name = 'Clinic name is required';
            if (!c.contact_number) e.clinic_0_contact_number = 'Contact number is required';
            // if (!c.specialty) e.clinic_0_specialty = 'Speciality is required';
            if (!c.address) e.clinic_0_address = 'Address is required';
            if (!c.city) e.clinic_0_city = 'City is required';
            if (!c.state) e.clinic_0_state = 'State is required';
            if (!c.pin_code) e.clinic_0_pin_code = 'PIN code is required';
        }

        console.log('Validation Errors:', e);
        console.log('Total Errors:', Object.keys(e).length);

        const allTouched: Record<string, boolean> = {};
        Object.keys(e).forEach(k => { allTouched[k] = true; });
        flushSync(() => { setErrors(e); setTouched(allTouched); });

        if (Object.keys(e).length > 0) {
            const firstKey = Object.keys(e)[0];
            const targetTab = FIELD_TAB[firstKey] || 'provider';
            console.log('First Error Field:', firstKey, '→ Tab:', targetTab);
            setActiveTab(targetTab);
            setTimeout(() => {
                const el = document.querySelector(`[name="${firstKey}"],[id="${firstKey}"]`) as HTMLElement;
                if (el) { 
                    console.log('Focusing on field:', firstKey);
                    el.focus(); 
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                } else {
                    console.error('Field not found in DOM:', firstKey);
                }
            }, 60);
            return false;
        }
        
        console.log('✓ Validation passed - submitting form');
        return true;
    };

    // ─── Save ────────────────────────────────────────────────────────────────
    const saveItem = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const fd = new FormData();
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined) return;
                if (['specialists_availability','clinics','time_slots','coordinates'].includes(key)) {
                    fd.append(key, JSON.stringify(params[key]));
                } else if (key === 'procedure_ids') {
                    fd.append('procedure_ids', JSON.stringify(params[key] || []));
                } else if (['state_dental_council_reg_photo','profile_photo'].includes(key)) {
                    if (params[key] instanceof File) fd.append(key, params[key]);
                } else if (key === 'clinic_photos') {
                    // Split into existing URLs (in reordered sequence) and new File objects
                    const photos: any[] = params[key] || [];
                    const existingUrls: string[] = [];
                    photos.forEach(p => {
                        if (p instanceof File) {
                            fd.append('clinic_photos', p);
                        } else if (typeof p === 'string') {
                            existingUrls.push(p);
                        }
                    });
                    // Send existing URLs in their reordered sequence
                    fd.append('existing_photo_order', JSON.stringify(existingUrls));
                } else {
                    fd.append(key, params[key].toString());
                }
            });
            const url = params.id && modalMode === 'edit' ? `${API_ENDPOINTS.providers}/${params.id}` : API_ENDPOINTS.providers;
            const method = params.id && modalMode === 'edit' ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }, body: fd });
            const data = await res.json();
            if (res.ok) { showMessage(`Provider has been ${modalMode === 'edit' ? 'updated' : 'created'} successfully.`); setAddModal(false); fetchItems(); }
            else showMessage(data.error || 'Operation failed', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
        finally { setLoading(false); }
    };

    // ─── Open / Delete ───────────────────────────────────────────────────────
    const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode); setTouched({}); setErrors({}); setActiveTab('provider');
        const json = JSON.parse(JSON.stringify(DEFAULT_VALUES));
        if (item) {
            Object.keys(item).forEach(k => { if (k in json) json[k] = item[k]; });
            // Populate first_name, last_name, email from user join fields
            json.first_name = item.first_name || '';
            json.last_name = item.last_name || '';
            json.email = item.email || item.user_email || '';
            ['specialists_availability','clinics','time_slots','coordinates'].forEach(k => {
                if (item[k]) json[k] = typeof item[k] === 'string' ? JSON.parse(item[k]) : item[k];
            });
            if (!json.time_slots || !Array.isArray(json.time_slots) || json.time_slots.length !== 7)
                json.time_slots = DEFAULT_TIME_SLOTS.map(s => ({ ...s }));
            json.clinic_photos = Array.isArray(item.clinic_photos) ? item.clinic_photos
                : (typeof item.clinic_photos === 'string' ? JSON.parse(item.clinic_photos) : []);
            // Always ensure exactly 1 clinic
            if (!json.clinics || json.clinics.length === 0) json.clinics = [{ ...DEFAULT_CLINIC }];
            else json.clinics = [json.clinics[0]];
            // Load procedure_ids
            json.procedure_ids = Array.isArray(item.procedure_ids) ? item.procedure_ids
                : (typeof item.procedure_ids === 'string' ? JSON.parse(item.procedure_ids) : []);
            // Fetch cities for existing state
            if (json.clinics[0]?.state) fetchCitiesByState(json.clinics[0].state);
        }
        setParams(json); setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: "You won't be able to revert this!", showCancelButton: true, confirmButtonText: 'Delete' });
        if (!result.value) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.providers}/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) { showMessage('Provider has been deleted successfully.'); fetchItems(); }
            else { const d = await res.json(); showMessage(d.error || 'Delete failed', 'error'); }
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') Swal.fire({ icon: 'success', title: msg, showConfirmButton: true, confirmButtonText: 'OK', timer: 3000, timerProgressBar: true });
        else { const t: any = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, customClass: { container: 'toast' } }); t.fire({ icon: type, title: msg, padding: '10px 20px' }); }
    };

    const saveProcedure = async () => {
        if (!newProcedure.name.trim()) { showMessage('Please enter procedure name', 'error'); return; }
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(API_ENDPOINTS.procedures, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(newProcedure),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('Procedure added successfully');
                setAddProcedureModal(false);
                setNewProcedure({ name: '', category: 'Diagnostic & Preventive' });
                setProcedures(prev => [...prev, data.data]);
                setParams((p: any) => ({ ...p, procedure_ids: [...(p.procedure_ids || []), data.data.id] }));
            } else showMessage(data.error || 'Failed to add procedure', 'error');
        } catch (e: any) { showMessage('Error: ' + e.message, 'error'); }
    };

    // ─── Field helpers ───────────────────────────────────────────────────────
    const cv = (e: any) => {
        const { name, value, type, checked } = e.target;
        let v = type === 'checkbox' ? checked : value;
        if (type === 'number' && ['years_of_experience','dental_chairs','number_of_clinics'].includes(name)) v = value === '' ? 0 : parseInt(value) || 0;
        const np = { ...params, [name]: v };
        // Auto-fill first_name, last_name, email when user is selected
        if (name === 'id' && value) {
            const selectedUser = users.find(u => u.id === value);
            if (selectedUser) {
                np.first_name = selectedUser.first_name || '';
                np.last_name = selectedUser.last_name || '';
                np.email = selectedUser.email || '';
            }
        }
        setParams(np);
        if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };

    const hb = (e: any) => {
        const { name } = e.target; const val = params[name];
        setTouched(p => ({ ...p, [name]: true }));
        const req: Record<string,string> = { date_of_birth:'Date of birth is required', pincode:'Pincode is required', years_of_experience:'Years of experience is required', state_dental_council_reg_number:'Registration number is required' };
        const ne = { ...errors };
        if (name === 'id') { if (modalMode === 'create' && !val) ne.id = 'Please select a user'; else delete ne.id; }
        else if (req[name]) { if (!val && val !== 0) ne[name] = req[name]; else delete ne[name]; }
        setErrors(ne);
    };

    const hcb = (idx: number, field: string, value: any) => {
        const key = `clinic_0_${field}`;
        setTouched(p => ({ ...p, [key]: true }));
        const req: Record<string,string> = { pan_no:'Pan No is required', name:'Clinic name is required', contact_number:'Contact number is required', specialty:'Speciality is required', address:'Address is required', city:'City is required', state:'State is required', pin_code:'PIN code is required' };
        const ne = { ...errors };
        if (req[field]) { if (!value) ne[key] = req[field]; else delete ne[key]; }
        setErrors(ne);
    };

    const updateClinic = (field: string, value: any) => {
        const updated = [{ ...params.clinics[0], [field]: field === 'dental_chairs' ? (value === '' ? 2 : parseInt(value) || 2) : value }];
        setParams({ ...params, clinics: updated });
    };

    const updateTimeSlot = (i: number, field: string, value: any) => {
        const updated = [...params.time_slots]; updated[i] = { ...updated[i], [field]: value };
        setParams({ ...params, time_slots: updated });
    };

    const handleFileChange = (e: any, fieldName: string) => {
        const file = e.target.files[0]; if (file) setParams({ ...params, [fieldName]: file });
    };

    const addClinicPhotos = (files: FileList | null) => {
        if (!files) return;
        const existing = Array.isArray(params.clinic_photos) ? params.clinic_photos : [];
        setParams({ ...params, clinic_photos: [...existing, ...Array.from(files)] });
    };

    const removeClinicPhoto = (i: number) => {
        const updated = [...params.clinic_photos]; updated.splice(i, 1);
        setParams({ ...params, clinic_photos: updated });
    };

    // drag-and-drop reorder
    const onDragStart = (i: number) => { dragIndex.current = i; };
    const onDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === i) return;
        const updated = [...params.clinic_photos];
        const [moved] = updated.splice(dragIndex.current, 1);
        updated.splice(i, 0, moved);
        dragIndex.current = i;
        setParams({ ...params, clinic_photos: updated });
    };
    const onDragEnd = () => { dragIndex.current = null; };

    const deleteProviderImage = async (imageType: string, imagePath?: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.providers}/${params.id}/images/${imageType}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ imagePath }) });
            const data = await res.json();
            if (res.ok) {
                showMessage('Image deleted successfully');
                const up = { ...params };
                if (imageType === 'clinic_photos' && data.data?.clinic_photos) up.clinic_photos = data.data.clinic_photos;
                else if (imageType === 'profile_photo') up.profile_photo = null;
                else if (imageType === 'state_dental_council_reg_photo') up.state_dental_council_reg_photo = null;
                setParams(up);
            } else showMessage(data.error || 'Failed to delete image', 'error');
        } catch (err: any) { showMessage('Error: ' + err.message, 'error'); }
    };

    const imgSrc = (val: any) => val instanceof File ? URL.createObjectURL(val) : (val?.startsWith('http') ? val : buildMediaUrl(val));
    const errCls = (k: string) => touched[k] && errors[k] ? 'border-red-500' : '';
    const errMsg = (k: string) => touched[k] && errors[k] ? <p className="mt-1 text-xs text-red-500">{errors[k]}</p> : null;
    const isView = modalMode === 'view';

    // ─── Tab renderers ───────────────────────────────────────────────────────
    const renderProviderTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User select */}
            <div className="md:col-span-3">
                <label htmlFor="id">Select User <span className="text-red-500">*</span></label>
                <select id="id" name="id" className={`form-select ${errCls('id')}`} value={params.id} onChange={cv} onBlur={hb} disabled={isView || modalMode === 'edit'}>
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
                </select>
                {errMsg('id')}
            </div>
            <div>
                <label htmlFor="first_name">First Name</label>
                <input id="first_name" name="first_name" type="text" className="form-input" value={params.first_name || ''} onChange={cv} disabled={isView} placeholder="Saved to user account" />
            </div>
            <div>
                <label htmlFor="last_name">Last Name</label>
                <input id="last_name" name="last_name" type="text" className="form-input" value={params.last_name || ''} onChange={cv} disabled={isView} placeholder="Saved to user account" />
            </div>
            <div>
                <label htmlFor="email">Email ID</label>
                <input id="email" name="email" type="email" className="form-input" value={params.email} onChange={cv} disabled={isView} placeholder="Saved to user account" />
            </div>
            <div>
                <label htmlFor="date_of_birth">Date of Birth <span className="text-red-500">*</span></label>
                <input id="date_of_birth" name="date_of_birth" type="date" className={`form-input ${errCls('date_of_birth')}`} value={params.date_of_birth} onChange={cv} onBlur={hb} disabled={isView} />
                {errMsg('date_of_birth')}
            </div>
            <div>
                <label htmlFor="pincode">Pincode <span className="text-red-500">*</span></label>
                <input id="pincode" name="pincode" type="text" className={`form-input ${errCls('pincode')}`} value={params.pincode} onChange={cv} onBlur={hb} disabled={isView} placeholder="Enter pincode" />
                {errMsg('pincode')}
            </div>
            <div>
                <label htmlFor="years_of_experience">Years of Experience <span className="text-red-500">*</span></label>
                <input id="years_of_experience" name="years_of_experience" type="number" className={`form-input ${errCls('years_of_experience')}`} value={params.years_of_experience} onChange={cv} onBlur={hb} disabled={isView} />
                {errMsg('years_of_experience')}
            </div>
            <div>
                <label htmlFor="state_dental_council_reg_number">SDC Reg. Number <span className="text-red-500">*</span></label>
                <input id="state_dental_council_reg_number" name="state_dental_council_reg_number" type="text" className={`form-input ${errCls('state_dental_council_reg_number')}`} value={params.state_dental_council_reg_number} onChange={cv} onBlur={hb} disabled={isView} />
                {errMsg('state_dental_council_reg_number')}
            </div>
            {/* WhatsApp */}
            <div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input name="same_as_whatsapp" type="checkbox" className="form-checkbox" checked={params.same_as_whatsapp} onChange={cv} disabled={isView} />
                    <span>Same as WhatsApp</span>
                </label>
                {!params.same_as_whatsapp && <input name="whatsapp_number" type="text" className="form-input" placeholder="WhatsApp Number" value={params.whatsapp_number} onChange={cv} disabled={isView} />}
            </div>
            {/* SDC Photo */}
            <div>
                <label>SDC Registration Photo</label>
                {!isView && <input type="file" accept="image/*" className="form-input" onChange={e => handleFileChange(e, 'state_dental_council_reg_photo')} />}
                {params.state_dental_council_reg_photo && (
                    <div className="mt-2 relative inline-block">
                        <img src={imgSrc(params.state_dental_council_reg_photo)} alt="SDC" className="w-24 h-24 object-cover rounded border" onError={e => { e.currentTarget.style.display='none'; }} />
                        {!isView && <button type="button" onClick={() => params.state_dental_council_reg_photo instanceof File ? setParams({...params, state_dental_council_reg_photo: null}) : deleteProviderImage('state_dental_council_reg_photo', params.state_dental_council_reg_photo)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>}
                    </div>
                )}
            </div>
            {/* Profile Photo */}
            <div>
                <label>Profile Photo</label>
                {!isView && <input type="file" accept="image/*" className="form-input" onChange={e => handleFileChange(e, 'profile_photo')} />}
                {params.profile_photo && (
                    <div className="mt-2 relative inline-block">
                        <img src={imgSrc(params.profile_photo)} alt="Profile" className="w-24 h-24 object-cover rounded-full border" onError={e => { e.currentTarget.style.display='none'; }} />
                        {!isView && <button type="button" onClick={() => params.profile_photo instanceof File ? setParams({...params, profile_photo: null}) : deleteProviderImage('profile_photo', params.profile_photo)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>}
                    </div>
                )}
            </div>
            {/* Procedures multi-select */}
            <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                    <label>Procedures <span className="text-red-500">*</span></label>
                    {!isView && (
                        <button type="button" className="text-primary text-sm hover:underline"
                            onClick={() => { setNewProcedure({ name: '', category: 'Diagnostic & Preventive' }); setAddProcedureModal(true); }}>
                            + Add New Procedure
                        </button>
                    )}
                </div>
                <div className="relative procedure-dropdown-container">
                    <button
                        type="button"
                        className={`form-input w-full text-left flex items-center justify-between ${errCls('procedure_ids')}`}
                        onClick={() => !isView && setProcedureDropdownOpen(o => !o)}
                        disabled={isView}
                    >
                        <span className="truncate">
                            {params.procedure_ids?.length > 0
                                ? procedures.filter(p => params.procedure_ids.includes(p.id)).map(p => p.name).join(', ')
                                : 'Select Procedures'}
                        </span>
                        <span className="ml-2 text-gray-400">▾</span>
                    </button>
                    {procedureDropdownOpen && !isView && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {procedures.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400">No procedures available</div>
                            ) : procedures.map(proc => (
                                <label key={proc.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={params.procedure_ids?.includes(proc.id) || false}
                                        onChange={e => {
                                            const current: string[] = params.procedure_ids || [];
                                            const updated = e.target.checked
                                                ? [...current, proc.id]
                                                : current.filter((id: string) => id !== proc.id);
                                            setParams({ ...params, procedure_ids: updated });
                                            // Clear error when procedure is selected
                                            if (updated.length > 0) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.procedure_ids;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                    />
                                    <span className="text-sm">{proc.name}</span>
                                    {proc.category && <span className="ml-auto text-xs text-gray-400">{proc.category}</span>}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                {errMsg('procedure_ids')}
                {params.procedure_ids?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {procedures.filter(p => params.procedure_ids.includes(p.id)).map(p => (
                            <span key={p.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded px-2 py-0.5">
                                {p.name}
                                {!isView && <button type="button" onClick={() => setParams({ ...params, procedure_ids: params.procedure_ids.filter((id: string) => id !== p.id) })}>×</button>}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderClinicTab = () => {
        const clinic = params.clinics?.[0] || DEFAULT_CLINIC;
        const ef = (f: string) => errCls(`clinic_0_${f}`);
        const em = (f: string) => errMsg(`clinic_0_${f}`);
        return (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label>Pan No <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_pan_no" className={`form-input ${ef('pan_no')}`} value={clinic.pan_no} onChange={e => updateClinic('pan_no', e.target.value)} onBlur={e => hcb(0,'pan_no',e.target.value)} disabled={isView} />
                        {em('pan_no')}
                    </div>
                    <div>
                        <label>Clinic Name <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_name" className={`form-input ${ef('name')}`} value={clinic.name} onChange={e => updateClinic('name', e.target.value)} onBlur={e => hcb(0,'name',e.target.value)} disabled={isView} />
                        {em('name')}
                    </div>
                    <div>
                        <label>Contact Number <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_contact_number" className={`form-input ${ef('contact_number')}`} value={clinic.contact_number} onChange={e => updateClinic('contact_number', e.target.value)} onBlur={e => hcb(0,'contact_number',e.target.value)} disabled={isView} />
                        {em('contact_number')}
                    </div>
                    <div>
                        <label>Speciality <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_specialty" className={`form-input ${ef('specialty')}`} value={clinic.specialty} onChange={e => updateClinic('specialty', e.target.value)} onBlur={e => hcb(0,'specialty',e.target.value)} disabled={isView} />
                        {em('specialty')}
                    </div>
                    <div className="md:col-span-2">
                        <label>Address <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_address" className={`form-input ${ef('address')}`} value={clinic.address} onChange={e => updateClinic('address', e.target.value)} onBlur={e => hcb(0,'address',e.target.value)} disabled={isView} />
                        {em('address')}
                    </div>
                    <div>
                        <label>City <span className="text-red-500">*</span></label>
                        <select name="clinic_0_city" className={`form-select ${ef('city')}`} value={clinic.city} onChange={e => updateClinic('city', e.target.value)} onBlur={e => hcb(0,'city',e.target.value)} disabled={isView}>
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {em('city')}
                    </div>
                    <div>
                        <label>State <span className="text-red-500">*</span></label>
                        <select name="clinic_0_state" className={`form-select ${ef('state')}`} value={clinic.state} onChange={e => updateClinic('state', e.target.value)} onBlur={e => hcb(0,'state',e.target.value)} disabled={isView}>
                            <option value="">Select State</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {em('state')}
                    </div>
                    <div>
                        <label>PIN Code <span className="text-red-500">*</span></label>
                        <input type="text" name="clinic_0_pin_code" className={`form-input ${ef('pin_code')}`} value={clinic.pin_code} onChange={e => updateClinic('pin_code', e.target.value)} onBlur={e => hcb(0,'pin_code',e.target.value)} disabled={isView} />
                        {em('pin_code')}
                    </div>
                    <div>
                        <label>Google Map URL</label>
                        <input type="url" className="form-input" value={clinic.google_map_url} onChange={e => updateClinic('google_map_url', e.target.value)} disabled={isView} />
                    </div>
                    <div>
                        <label>Dental Chairs</label>
                        <input type="number" className="form-input" value={clinic.dental_chairs} onChange={e => updateClinic('dental_chairs', e.target.value)} disabled={isView} />
                    </div>
                    <div>
                        <label>Clinic Board Photo</label>
                        {!isView && <input type="file" accept="image/*" className="form-input" onChange={e => updateClinic('clinic_board', e.target.files?.[0] || null)} />}
                    </div>
                    <div>
                        <label>Clinic Video URL</label>
                        <input name="clinic_video_url" type="url" className="form-input" placeholder="https://youtube.com/..." value={params.clinic_video_url} onChange={cv} disabled={isView} />
                    </div>
                    <div className="md:col-span-3">
                        <label>About</label>
                        <textarea name="about" rows={3} className="form-textarea" placeholder="Enter information about the clinic..." value={params.about} onChange={cv} disabled={isView} />
                    </div>
                </div>

                {/* Clinic Photos with drag-and-drop */}
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Clinic Photos</label>
                    {!isView && (
                        <div className="mb-3">
                            <input type="file" accept="image/*" multiple className="form-input" onChange={e => addClinicPhotos(e.target.files)} />
                            <p className="text-xs text-gray-500 mt-1">Select multiple photos. Drag to reorder.</p>
                        </div>
                    )}
                    {params.clinic_photos && params.clinic_photos.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {params.clinic_photos.map((photo: any, i: number) => (
                                <div
                                    key={i}
                                    draggable={!isView}
                                    onDragStart={() => onDragStart(i)}
                                    onDragOver={e => onDragOver(e, i)}
                                    onDragEnd={onDragEnd}
                                    className={`relative group ${!isView ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                >
                                    <img
                                        src={photo instanceof File ? URL.createObjectURL(photo) : (photo?.startsWith?.('http') ? photo : buildMediaUrl(photo))}
                                        alt={`Clinic ${i + 1}`}
                                        className="w-28 h-28 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary transition-colors"
                                        onError={e => { e.currentTarget.style.display='none'; }}
                                    />
                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs rounded px-1">{i + 1}</div>
                                    {!isView && (
                                        <button type="button" onClick={() => removeClinicPhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderHoursTab = () => {
        const updateSession = (i: number, session: 'morning' | 'afternoon' | 'evening', field: string, value: any) => {
            const u = [...params.time_slots];
            u[i] = { ...u[i], [session]: { ...u[i][session], [field]: value } };
            setParams({ ...params, time_slots: u });
        };

        const slotDuration = params.time_slots[0]?.slot_duration || 30;
        const setSlotDuration = (val: number) => {
            const u = params.time_slots.map((s: any) => ({ ...s, slot_duration: val }));
            setParams({ ...params, time_slots: u });
        };

        const SESSIONS = [
            { key: 'morning',   label: 'Morning',   hint: 'Before 12 PM' },
            { key: 'afternoon', label: 'Afternoon',  hint: '12–4 PM' },
            { key: 'evening',   label: 'Evening',    hint: 'After 4 PM' },
        ] as const;

        return (
            <div className="space-y-4">
                {/* Slot duration — shared for all days */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Appointment Slot Duration</span>
                    <div className="flex gap-2">
                        {[10, 15, 30, 45, 60].map(m => (
                            <button key={m} type="button" disabled={isView}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${slotDuration === m ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`}
                                onClick={() => setSlotDuration(m)}>
                                {m} min
                            </button>
                        ))}
                    </div>
                </div>

                {/* Days */}
                <div className="space-y-2">
                    {params.time_slots.map((slot: any, i: number) => (
                        <div key={slot.day} className="border rounded-lg overflow-hidden">
                            {/* Day header row */}
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800">
                                <div className="w-24 font-medium text-sm">{slot.day}</div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox" checked={slot.is_open} disabled={isView}
                                        onChange={() => { const u=[...params.time_slots]; u[i]={...u[i],is_open:!u[i].is_open}; setParams({...params,time_slots:u}); }} />
                                    <span className={`text-sm font-semibold ${slot.is_open ? 'text-green-600' : 'text-gray-400'}`}>
                                        {slot.is_open ? 'Open' : 'Closed'}
                                    </span>
                                </label>
                            </div>

                            {/* Sessions — only when open */}
                            {slot.is_open && (
                                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {SESSIONS.map(({ key, label, hint }) => {
                                        const s = slot[key] || { enabled: false, start: '09:00', end: '12:00' };
                                        return (
                                            <div key={key} className={`rounded-lg border p-3 ${s.enabled ? 'border-primary/40 bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}>
                                                <label className="flex items-center justify-between cursor-pointer mb-2">
                                                    <div>
                                                        <span className={`text-sm font-medium ${s.enabled ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
                                                        <span className="text-xs text-gray-400 ml-1">({hint})</span>
                                                    </div>
                                                    <input type="checkbox" className="form-checkbox" checked={s.enabled} disabled={isView}
                                                        onChange={e => updateSession(i, key, 'enabled', e.target.checked)} />
                                                </label>
                                                {s.enabled && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <input type="time" className="form-input py-1 text-xs flex-1" value={s.start} disabled={isView}
                                                            onChange={e => updateSession(i, key, 'start', e.target.value)} />
                                                        <span className="text-gray-400">–</span>
                                                        <input type="time" className="form-input py-1 text-xs flex-1" value={s.end} disabled={isView}
                                                            onChange={e => updateSession(i, key, 'end', e.target.value)} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderEquipmentTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label>IOPA X-Ray Type</label>
                <select name="iopa_xray_type" className="form-select" value={params.iopa_xray_type} onChange={cv} disabled={isView}>
                    <option value="Digital">Digital</option><option value="Film">Film</option>
                </select>
            </div>
            <div>
                <label>OPG</label>
                <select className="form-select" value={params.has_opg.toString()} onChange={e => setParams({...params, has_opg: e.target.value === 'true'})} disabled={isView}>
                    <option value="true">Yes</option><option value="false">No</option>
                </select>
            </div>
            <div>
                <label>Ultrasonic Cleaner</label>
                <select className="form-select" value={params.has_ultrasonic_cleaner.toString()} onChange={e => setParams({...params, has_ultrasonic_cleaner: e.target.value === 'true'})} disabled={isView}>
                    <option value="true">Yes</option><option value="false">No</option>
                </select>
            </div>
            <div>
                <label>Intraoral Camera Type</label>
                <input name="intraoral_camera_type" type="text" className="form-input" value={params.intraoral_camera_type} onChange={cv} disabled={isView} />
            </div>
            <div>
                <label>RCT Equipment</label>
                <input name="rct_equipment" type="text" className="form-input" value={params.rct_equipment} onChange={cv} disabled={isView} />
            </div>
            <div>
                <label>Autoclave Type</label>
                <input name="autoclave_type" type="text" className="form-input" value={params.autoclave_type} onChange={cv} disabled={isView} />
            </div>
            <div>
                <label>Sterilization Protocol</label>
                <input name="sterilization_protocol" type="text" className="form-input" value={params.sterilization_protocol} onChange={cv} disabled={isView} />
            </div>
            <div>
                <label>Disinfection Protocol</label>
                <input name="disinfection_protocol" type="text" className="form-input" value={params.disinfection_protocol} onChange={cv} disabled={isView} />
            </div>
        </div>
    );

    const renderSpecialistsTab = () => {
        // Get list of already selected specialty types
        const selectedTypes = params.specialists_availability.map((sp: any) => sp.type);
        
        // Get first available specialty that hasn't been selected
        const getFirstAvailableSpecialty = () => {
            const available = specialties.find(s => !selectedTypes.includes(s.name));
            return available ? available.name : (specialties[0]?.name || '');
        };

        return (
            <div>
                {!isView && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-primary mb-4" 
                        onClick={() => setParams({
                            ...params, 
                            specialists_availability: [
                                ...params.specialists_availability, 
                                { type: getFirstAvailableSpecialty(), availability: 'On Call' }
                            ]
                        })}
                        disabled={selectedTypes.length >= specialties.length}
                    >
                        + Add Specialist
                    </button>
                )}
                {params.specialists_availability.length === 0 && <p className="text-gray-400 text-sm">No specialists added.</p>}
                {params.specialists_availability.map((sp: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Type</label>
                            <select 
                                className="form-select" 
                                value={sp.type} 
                                onChange={e => { 
                                    const u=[...params.specialists_availability]; 
                                    u[i]={...u[i],type:e.target.value}; 
                                    setParams({...params,specialists_availability:u}); 
                                }} 
                                disabled={isView}
                            >
                                {specialties.map(specialty => {
                                    // Disable if already selected by another row
                                    const isSelectedElsewhere = selectedTypes.includes(specialty.name) && sp.type !== specialty.name;
                                    return (
                                        <option 
                                            key={specialty.id} 
                                            value={specialty.name}
                                            disabled={isSelectedElsewhere}
                                        >
                                            {specialty.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Availability</label>
                            <select className="form-select" value={sp.availability} onChange={e => { const u=[...params.specialists_availability]; u[i]={...u[i],availability:e.target.value}; setParams({...params,specialists_availability:u}); }} disabled={isView}>
                                {availabilityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        {!isView && <button type="button" className="btn btn-sm btn-danger mt-4" onClick={() => setParams({...params, specialists_availability: params.specialists_availability.filter((_:any,j:number)=>j!==i)})}>Remove</button>}
                    </div>
                ))}
            </div>
        );
    };

    const renderBankTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[['bank_name','Bank Name'],['bank_branch_name','Branch Name'],['bank_account_name','Account Name'],['bank_account_number','Account Number'],['bank_micr_no','MICR No'],['bank_ifsc_code','IFSC Code']].map(([name,label]) => (
                <div key={name}>
                    <label>{label}</label>
                    <input name={name} type="text" className="form-input" value={params[name]} onChange={cv} disabled={isView} />
                </div>
            ))}
            <div>
                <label>Account Type</label>
                <select name="bank_account_type" className="form-select" value={params.bank_account_type} onChange={cv} disabled={isView}>
                    <option value="">Select</option>
                    {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    const tabContent: Record<string, () => JSX.Element> = {
        provider: renderProviderTab, clinic: renderClinicTab, hours: renderHoursTab,
        equipment: renderEquipmentTab, specialists: renderSpecialistsTab,
        bank: renderBankTab,
    };

    const tabHasError = (tabId: string) => Object.keys(errors).some(k => (FIELD_TAB[k] || 'provider') === tabId);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Providers</h2>
                <div className="flex gap-3 items-center">
                    <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                        <IconUserPlus className="ltr:mr-2 rtl:ml-2" />Add Provider
                    </button>
                    <div className="relative">
                        <input type="text" placeholder="Search Providers" className="peer form-input ltr:pr-11 rtl:pl-11" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchItems()} />
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
                            <thead><tr><th>#</th><th>Provider</th><th>Specialty</th><th>Experience</th><th>Clinic</th><th>Location</th><th className="!text-center">Actions</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">No providers found</td></tr> : items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                        <td>
                                            <div className="font-semibold">
                                                {`${item.first_name || ''} ${item.last_name || ''}`.trim() || item.full_name || 'N/A'}
                                            </div>
                                            <div className="text-xs text-white-dark">{item.user_email || item.email || '-'}</div>
                                        </td>
                                        <td>{(() => { const c = typeof item.clinics === 'string' ? JSON.parse(item.clinics || '[]') : (item.clinics || []); return c[0]?.specialty || item.specialty || '-'; })()}</td>
                                        <td>{item.years_of_experience || item.experience_years} yrs</td>
                                        <td>{(() => { const c = typeof item.clinics === 'string' ? JSON.parse(item.clinics || '[]') : (item.clinics || []); return c[0]?.name || item.clinic_name || '-'; })()}</td>
                                        <td>{item.location}</td>
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
                                <DialogPanel className="panel my-8 w-full max-w-5xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    {/* Modal header */}
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Provider</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}><IconX /></button>
                                    </div>

                                    <div className="p-5">
                                        {/* Tab nav */}
                                        <div className="mb-5 border-b border-white-light dark:border-[#191e3a]">
                                            <div className="flex flex-wrap -mb-px">
                                                {TABS.map(tab => (
                                                    <button key={tab.id} type="button"
                                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                                        onClick={() => setActiveTab(tab.id)}
                                                    >
                                                        {tab.label}
                                                        {tabHasError(tab.id) && <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500 align-middle" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tab content */}
                                        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto pr-1">
                                            {tabContent[activeTab]?.()}
                                        </div>

                                        {/* Footer */}
                                        {!isView && (
                                            <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>Cancel</button>
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>{loading ? 'Saving...' : modalMode === 'create' ? 'Add Provider' : 'Update Provider'}</button>
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

            {/* Add New Procedure Modal */}
            <Transition appear show={addProcedureModal} as={Fragment}>
                <Dialog as="div" open={addProcedureModal} onClose={() => setAddProcedureModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[1000] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Add New Procedure</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddProcedureModal(false)}><IconX /></button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label>Category <span className="text-red-500">*</span></label>
                                            <select className="form-select" value={newProcedure.category}
                                                onChange={e => setNewProcedure({ ...newProcedure, category: e.target.value })}>
                                                <option value="Diagnostic & Preventive">Diagnostic & Preventive</option>
                                                <option value="Restorative">Restorative</option>
                                                <option value="Endodontic">Endodontic</option>
                                                <option value="Periodontal">Periodontal</option>
                                                <option value="Prosthodontics, Removable">Prosthodontics, Removable</option>
                                                <option value="Implant">Implant</option>
                                                <option value="Prosthodontics, Fixed">Prosthodontics, Fixed</option>
                                                <option value="OS">OS</option>
                                                <option value="Ortho">Ortho</option>
                                                <option value="Adjunctive">Adjunctive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Procedure Name <span className="text-red-500">*</span></label>
                                            <input type="text" className="form-input" placeholder="Enter procedure name"
                                                value={newProcedure.name}
                                                onChange={e => setNewProcedure({ ...newProcedure, name: e.target.value })}
                                                onKeyDown={e => e.key === 'Enter' && saveProcedure()}
                                                autoFocus />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddProcedureModal(false)}>Cancel</button>
                                            <button type="button" className="btn btn-primary" onClick={saveProcedure}>Add Procedure</button>
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

export default ProvidersCRUD;
