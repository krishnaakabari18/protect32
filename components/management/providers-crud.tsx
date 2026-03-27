'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, buildMediaUrl } from '@/config/api.config';

const ProvidersCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [items, setItems] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const defaultValues = {
        id: '',
        // Provider Details
        full_name: '',
        date_of_birth: '',
        pincode: '',
        mobile_number: '',
        whatsapp_number: '',
        same_as_whatsapp: false,
        email: '',
        years_of_experience: 0,
        state_dental_council_reg_number: '',
        state_dental_council_reg_photo: null,
        profile_photo: null,
        
        // Clinic Equipment
        dental_chairs: '',
        iopa_xray_type: '',
        has_opg: false,
        has_ultrasonic_cleaner: true,
        intraoral_camera_type: '',
        rct_equipment: '',
        autoclave_type: '',
        sterilization_protocol: '',
        disinfection_protocol: '',
        
        // Specialists Availability
        specialists_availability: [],
        
        // Bank Details
        bank_name: '',
        bank_branch_name: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_account_type: '',
        bank_micr_no: '',
        bank_ifsc_code: '',
        
        // Clinic Details
        number_of_clinics: 1,
        clinics: [
            {
                pan_no: '',
                name: '',
                contact_number: '',
                specialty: '',
                address: '',
                city: '',
                state: '',
                pin_code: '',
                google_map_url: '',
                working_hours: '',
                dental_chairs: 0,
                clinic_board: null
            }
        ],
        
        // Missing Legacy fields that need to be included
        specialty: '',
        experience_years: 0,
        clinic_name: '',
        contact_number: '',
        location: '',
        coordinates: null,
        about: '',
        availability: '',
        time_slots: [
            { day: 'Monday', is_open: true, open_time: '09:00', close_time: '18:00' },
            { day: 'Tuesday', is_open: true, open_time: '09:00', close_time: '18:00' },
            { day: 'Wednesday', is_open: true, open_time: '09:00', close_time: '18:00' },
            { day: 'Thursday', is_open: true, open_time: '09:00', close_time: '18:00' },
            { day: 'Friday', is_open: true, open_time: '09:00', close_time: '18:00' },
            { day: 'Saturday', is_open: true, open_time: '09:00', close_time: '14:00' },
            { day: 'Sunday', is_open: false, open_time: '09:00', close_time: '18:00' }
        ],
        clinic_photos: [],
        clinic_video_url: ''
    };

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultValues)));
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const firstErrorRef = useRef<HTMLElement | null>(null);

    const specialistTypes = [
        'Endodontist', 'Periodontist', 'Prosthodontist', 'Omfs', 
        'Orthodontist', 'Pedodontist'
    ];

    const availabilityOptions = ['On Call', 'Regular', 'Not Available'];

    const accountTypes = ['Savings', 'Current', 'Business'];

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'];

    useEffect(() => {
        fetchUsers();
        fetchItems();
    }, [pagination.page, pagination.limit]);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (params.clinic_photos && Array.isArray(params.clinic_photos)) {
                params.clinic_photos.forEach((photo: any) => {
                    if (photo instanceof File) {
                        URL.revokeObjectURL(URL.createObjectURL(photo));
                    }
                });
            }
        };
    }, [params.clinic_photos]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.users}?user_type=provider&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: search,
            });

            const response = await fetch(`${API_ENDPOINTS.providers}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setItems(data.data || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages,
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchItems();
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        // User selection (create only)
        if (modalMode === 'create' && !params.id) newErrors.id = 'Please select a user';
        // Provider Details
        if (!params.full_name) newErrors.full_name = 'Full name is required';
        if (!params.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!params.pincode) newErrors.pincode = 'Pincode is required';
        if (!params.mobile_number) newErrors.mobile_number = 'Mobile number is required';
        if (!params.email) newErrors.email = 'Email is required';
        if (params.years_of_experience === '' || params.years_of_experience === null || params.years_of_experience === undefined) newErrors.years_of_experience = 'Years of experience is required';
        if (!params.state_dental_council_reg_number) newErrors.state_dental_council_reg_number = 'Registration number is required';
        // Clinic fields (first clinic)
        if (params.clinics && params.clinics.length > 0) {
            const c = params.clinics[0];
            if (!c.pan_no) newErrors['clinic_0_pan_no'] = 'Pan No is required';
            if (!c.name) newErrors['clinic_0_name'] = 'Clinic name is required';
            if (!c.contact_number) newErrors['clinic_0_contact_number'] = 'Contact number is required';
            if (!c.specialty) newErrors['clinic_0_specialty'] = 'Speciality is required';
            if (!c.address) newErrors['clinic_0_address'] = 'Address is required';
            if (!c.city) newErrors['clinic_0_city'] = 'City is required';
            if (!c.state) newErrors['clinic_0_state'] = 'State is required';
            if (!c.pin_code) newErrors['clinic_0_pin_code'] = 'PIN code is required';
        }
        // Additional Info
        if (!params.specialty) newErrors.specialty = 'Primary specialty is required';
        if (!params.clinic_name) newErrors.clinic_name = 'Main clinic name is required';

        const allTouched: Record<string, boolean> = {};
        Object.keys(newErrors).forEach(k => { allTouched[k] = true; });

        flushSync(() => {
            setErrors(newErrors);
            setTouched(allTouched);
        });

        if (Object.keys(newErrors).length > 0) {
            const firstKey = Object.keys(newErrors)[0];
            const el = document.querySelector(`[name="${firstKey}"], [id="${firstKey}"]`) as HTMLElement;
            if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            return false;
        }
        return true;
    };

    const saveItem = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();

            // Add all form fields
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    if (key === 'specialists_availability' || key === 'clinics' || key === 'time_slots' || key === 'coordinates') {
                        formData.append(key, JSON.stringify(params[key]));
                    } else if (key === 'state_dental_council_reg_photo' || key === 'profile_photo') {
                        if (params[key] instanceof File) {
                            formData.append(key, params[key]);
                        }
                    } else if (key === 'clinic_photos' && Array.isArray(params[key])) {
                        // Handle multiple clinic photos - send as individual files with same field name
                        params[key].forEach((photo: File) => {
                            if (photo instanceof File) {
                                formData.append('clinic_photos', photo);
                            }
                        });
                    } else if (key !== 'clinic_photos') { // Skip clinic_photos as it's handled above
                        formData.append(key, params[key].toString());
                    }
                }
            });

            const url = params.id && modalMode === 'edit' ? `${API_ENDPOINTS.providers}/${params.id}` : API_ENDPOINTS.providers;
            const method = params.id && modalMode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Provider has been ${modalMode === 'edit' ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchItems();
            } else {
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
        setModalMode(mode);
        setTouched({});
        setErrors({});
        const json = JSON.parse(JSON.stringify(defaultValues));
        
        if (item) {
            Object.keys(item).forEach(key => {
                if (json.hasOwnProperty(key)) {
                    json[key] = item[key];
                }
            });
            
            // Parse JSON fields
            if (item.specialists_availability) {
                json.specialists_availability = typeof item.specialists_availability === 'string' 
                    ? JSON.parse(item.specialists_availability) 
                    : item.specialists_availability;
            }
            if (item.clinics) {
                json.clinics = typeof item.clinics === 'string' 
                    ? JSON.parse(item.clinics) 
                    : item.clinics;
            }
            if (item.time_slots) {
                json.time_slots = typeof item.time_slots === 'string' 
                    ? JSON.parse(item.time_slots) 
                    : item.time_slots;
            }
            
            // Ensure time_slots is always a proper array with all days
            if (!json.time_slots || !Array.isArray(json.time_slots) || json.time_slots.length !== 7) {
                json.time_slots = [
                    { day: 'Monday', is_open: true, open_time: '09:00', close_time: '18:00' },
                    { day: 'Tuesday', is_open: true, open_time: '09:00', close_time: '18:00' },
                    { day: 'Wednesday', is_open: true, open_time: '09:00', close_time: '18:00' },
                    { day: 'Thursday', is_open: true, open_time: '09:00', close_time: '18:00' },
                    { day: 'Friday', is_open: true, open_time: '09:00', close_time: '18:00' },
                    { day: 'Saturday', is_open: true, open_time: '09:00', close_time: '14:00' },
                    { day: 'Sunday', is_open: false, open_time: '09:00', close_time: '18:00' }
                ];
            }
            if (item.coordinates) {
                json.coordinates = typeof item.coordinates === 'string' 
                    ? JSON.parse(item.coordinates) 
                    : item.coordinates;
            }
            if (item.clinic_photos) {
                json.clinic_photos = Array.isArray(item.clinic_photos) 
                    ? item.clinic_photos 
                    : (typeof item.clinic_photos === 'string' ? JSON.parse(item.clinic_photos) : []);
                console.log('Parsed clinic_photos:', json.clinic_photos);
            } else {
                json.clinic_photos = [];
            }
        }
        
        setParams(json);
        setAddModal(true);
    };

    const deleteItem = async (item: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: { container: 'sweet-alerts' },
        }).then(async (result) => {
            if (result.value) {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_ENDPOINTS.providers}/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    });

                    if (response.ok) {
                        showMessage('Provider has been deleted successfully.');
                        fetchItems();
                    } else {
                        const data = await response.json();
                        showMessage(data.error || 'Delete failed', 'error');
                    }
                } catch (error: any) {
                    showMessage('Error: ' + error.message, 'error');
                }
            }
        });
    };

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') {
            Swal.fire({
                icon: 'success',
                title: msg,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 3000,
                timerProgressBar: true,
            });
        } else {
            const toast: any = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'toast' },
            });
            toast.fire({ icon: type, title: msg, padding: '10px 20px' });
        }
    };

    const changeValue = (e: any) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        
        // Handle number inputs - convert empty strings to 0 for integer fields
        if (type === 'number' && ['years_of_experience', 'experience_years', 'dental_chairs', 'number_of_clinics'].includes(name)) {
            newValue = value === '' ? 0 : parseInt(value) || 0;
        }
        
        const newParams = { ...params, [name]: newValue };
        
        // Auto-populate contact_number from mobile_number if contact_number is empty
        if (name === 'mobile_number' && value && !newParams.contact_number) {
            newParams.contact_number = value;
        }
        
        setParams(newParams);
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleBlur = (e: any) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const val = params[name];
        const newErrors = { ...errors };
        const requiredFields: Record<string, string> = {
            full_name: 'Full name is required',
            date_of_birth: 'Date of birth is required',
            pincode: 'Pincode is required',
            mobile_number: 'Mobile number is required',
            email: 'Email is required',
            years_of_experience: 'Years of experience is required',
            state_dental_council_reg_number: 'Registration number is required',
            specialty: 'Primary specialty is required',
            clinic_name: 'Main clinic name is required',
        };
        if (name === 'id') {
            if (modalMode === 'create' && !val) newErrors.id = 'Please select a user';
            else delete newErrors.id;
        } else if (requiredFields[name]) {
            if (!val && val !== 0) newErrors[name] = requiredFields[name];
            else delete newErrors[name];
        }
        setErrors(newErrors);
    };

    const handleClinicBlur = (index: number, field: string, value: any) => {
        const key = `clinic_${index}_${field}`;
        setTouched(prev => ({ ...prev, [key]: true }));
        const newErrors = { ...errors };
        const clinicRequiredFields: Record<string, string> = {
            pan_no: 'Pan No is required',
            name: 'Clinic name is required',
            contact_number: 'Contact number is required',
            specialty: 'Speciality is required',
            address: 'Address is required',
            city: 'City is required',
            state: 'State is required',
            pin_code: 'PIN code is required',
        };
        if (clinicRequiredFields[field]) {
            if (!value) newErrors[key] = clinicRequiredFields[field];
            else delete newErrors[key];
        }
        setErrors(newErrors);
    };

    const handleFileChange = (e: any, fieldName: string) => {
        const file = e.target.files[0];
        if (file) {
            setParams({ ...params, [fieldName]: file });
        }
    };

    const addSpecialist = () => {
        setParams({
            ...params,
            specialists_availability: [
                ...params.specialists_availability,
                { type: 'Endodontist', availability: 'On Call' }
            ]
        });
    };

    const removeSpecialist = (index: number) => {
        const updated = params.specialists_availability.filter((_: any, i: number) => i !== index);
        setParams({ ...params, specialists_availability: updated });
    };

    const updateSpecialist = (index: number, field: string, value: string) => {
        const updated = [...params.specialists_availability];
        updated[index][field] = value;
        setParams({ ...params, specialists_availability: updated });
    };

    const updateClinicCount = (count: number) => {
        const safeCount = parseInt(count.toString()) || 1;
        const clinics = [];
        for (let i = 0; i < safeCount; i++) {
            clinics.push(params.clinics[i] || {
                pan_no: '',
                name: '',
                contact_number: '',
                specialty: '',
                address: '',
                city: '',
                state: '',
                pin_code: '',
                google_map_url: '',
                working_hours: '',
                dental_chairs: 2,
                clinic_board: null
            });
        }
        setParams({ ...params, number_of_clinics: safeCount, clinics });
    };

    const updateClinic = (index: number, field: string, value: any) => {
        const updated = [...params.clinics];
        
        // Handle number fields properly
        if (field === 'dental_chairs') {
            updated[index][field] = value === '' ? 2 : (parseInt(value) || 2);
        } else {
            updated[index][field] = value;
        }
        
        setParams({ ...params, clinics: updated });
    };

    const updateTimeSlot = (dayIndex: number, field: string, value: any) => {
        const updated = [...params.time_slots];
        updated[dayIndex][field] = value;
        setParams({ ...params, time_slots: updated });
    };

    const toggleDayOpen = (dayIndex: number) => {
        const updated = [...params.time_slots];
        updated[dayIndex].is_open = !updated[dayIndex].is_open;
        setParams({ ...params, time_slots: updated });
    };

    const copyTimeToAllDays = (sourceIndex: number) => {
        const sourceSlot = params.time_slots[sourceIndex];
        const updated = params.time_slots.map((slot: any) => ({
            ...slot,
            open_time: sourceSlot.open_time,
            close_time: sourceSlot.close_time,
            is_open: sourceSlot.is_open
        }));
        setParams({ ...params, time_slots: updated });
    };

    const removeClinicPhoto = (index: number) => {
        const updated = [...params.clinic_photos];
        updated.splice(index, 1);
        setParams({ ...params, clinic_photos: updated });
    };

    const addClinicPhotos = (newFiles: FileList | null) => {
        if (newFiles) {
            const files = Array.from(newFiles);
            const existingPhotos = Array.isArray(params.clinic_photos) ? params.clinic_photos : [];
            setParams({ ...params, clinic_photos: [...existingPhotos, ...files] });
        }
    };

    const deleteProviderImage = async (imageType: string, imagePath?: string, imageIndex?: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_ENDPOINTS.providers}/${params.id}/images/${imageType}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({
                    imagePath,
                    imageIndex
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Image deleted successfully');
                // Update local state with the updated provider data
                if (data.data) {
                    const updatedParams = { ...params };
                    if (imageType === 'clinic_photos' && data.data.clinic_photos) {
                        updatedParams.clinic_photos = data.data.clinic_photos;
                    } else if (imageType === 'profile_photo') {
                        updatedParams.profile_photo = null;
                    } else if (imageType === 'state_dental_council_reg_photo') {
                        updatedParams.state_dental_council_reg_photo = null;
                    }
                    setParams(updatedParams);
                }
            } else {
                showMessage(data.error || 'Failed to delete image', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl">Providers</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Provider
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'list' && 'bg-primary text-white'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'grid' && 'bg-primary text-white'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Providers"
                            className="peer form-input w-full sm:w-auto ltr:pr-11 rtl:pl-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            type="button"
                            className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
                            onClick={handleSearch}
                        >
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block align-middle"></span>
                </div>
            ) : (
                <>
                    {viewMode === 'list' && (
                        <div className="panel mt-5 overflow-hidden border-0 p-0">
                            <div className="table-responsive">
                                <table className="table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Provider</th>
                                            <th>Specialty</th>
                                            <th>Experience</th>
                                            <th>Clinic</th>
                                            <th>Contact</th>
                                            <th>Location</th>
                                            <th className="!text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                                <td>
                                                    <div className="whitespace-nowrap font-semibold">
                                                        {item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-white-dark">{item.user_email || item.email}</div>
                                                </td>
                                                <td>{item.specialty}</td>
                                                <td>{item.years_of_experience || item.experience_years} years</td>
                                                <td>{item.clinic_name}</td>
                                                <td>{item.mobile_number || item.contact_number}</td>
                                                <td>{item.location}</td>
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('view', item)}>
                                                            <IconEye />
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal('edit', item)}>
                                                            <IconPencil />
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}>
                                                            <IconTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`btn btn-sm ${pagination.page === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Complete Modal with all form sections */}
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={() => setAddModal(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel my-8 w-full max-w-6xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">
                                            {modalMode === 'create' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Provider
                                        </h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAddModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        
                                        {/* 1. User Selection (Create mode only) */}
                                        {modalMode === 'create' && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                                <label htmlFor="id">Select User <span className="text-red-500">*</span></label>
                                                <select id="id" name="id" className={`form-select ${touched.id && errors.id ? 'border-red-500' : ''}`} value={params.id} onChange={changeValue} onBlur={handleBlur}>
                                                    <option value="">Select User</option>
                                                    {users.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.first_name} {user.last_name} ({user.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                {touched.id && errors.id && <p className="mt-1 text-xs text-red-500">{errors.id}</p>}
                                            </div>
                                        )}

                                        {/* 2. Provider Details Section */}
                                        <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-pink-700">Provider Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label htmlFor="full_name">Full Name <span className="text-red-500">*</span></label>
                                                    <input id="full_name" name="full_name" type="text" className={`form-input ${touched.full_name && errors.full_name ? 'border-red-500' : ''}`}
                                                           value={params.full_name} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.full_name && errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="date_of_birth">Date Of Birth <span className="text-red-500">*</span></label>
                                                    <input id="date_of_birth" name="date_of_birth" type="date" className={`form-input ${touched.date_of_birth && errors.date_of_birth ? 'border-red-500' : ''}`}
                                                           value={params.date_of_birth} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.date_of_birth && errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="pincode">Pincode <span className="text-red-500">*</span></label>
                                                    <input id="pincode" name="pincode" type="text" className={`form-input ${touched.pincode && errors.pincode ? 'border-red-500' : ''}`}
                                                           value={params.pincode} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.pincode && errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="mobile_number">Mobile Number <span className="text-red-500">*</span></label>
                                                    <input id="mobile_number" name="mobile_number" type="text" className={`form-input ${touched.mobile_number && errors.mobile_number ? 'border-red-500' : ''}`}
                                                           value={params.mobile_number} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.mobile_number && errors.mobile_number && <p className="mt-1 text-xs text-red-500">{errors.mobile_number}</p>}
                                                </div>
                                                <div>
                                                    <div className="flex items-center mb-2">
                                                        <input id="same_as_whatsapp" name="same_as_whatsapp" type="checkbox" 
                                                               checked={params.same_as_whatsapp} onChange={changeValue} disabled={modalMode === 'view'} />
                                                        <label htmlFor="same_as_whatsapp" className="ml-2">Same as WhatsApp number</label>
                                                    </div>
                                                    {!params.same_as_whatsapp && (
                                                        <input id="whatsapp_number" name="whatsapp_number" type="text" className="form-input" 
                                                               placeholder="WhatsApp Number" value={params.whatsapp_number} onChange={changeValue} disabled={modalMode === 'view'} />
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="email">Email ID <span className="text-red-500">*</span></label>
                                                    <input id="email" name="email" type="email" className={`form-input ${touched.email && errors.email ? 'border-red-500' : ''}`}
                                                           value={params.email} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="years_of_experience">Years of Experience <span className="text-red-500">*</span></label>
                                                    <input id="years_of_experience" name="years_of_experience" type="number" className={`form-input ${touched.years_of_experience && errors.years_of_experience ? 'border-red-500' : ''}`}
                                                           value={params.years_of_experience} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.years_of_experience && errors.years_of_experience && <p className="mt-1 text-xs text-red-500">{errors.years_of_experience}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="state_dental_council_reg_number">State Dental Council Registration Number <span className="text-red-500">*</span></label>
                                                    <input id="state_dental_council_reg_number" name="state_dental_council_reg_number" type="text" className={`form-input ${touched.state_dental_council_reg_number && errors.state_dental_council_reg_number ? 'border-red-500' : ''}`}
                                                           value={params.state_dental_council_reg_number} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.state_dental_council_reg_number && errors.state_dental_council_reg_number && <p className="mt-1 text-xs text-red-500">{errors.state_dental_council_reg_number}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="state_dental_council_reg_photo">State Dental Council Registration Photo</label>
                                                    <input id="state_dental_council_reg_photo" type="file" accept="image/*" className="form-input" 
                                                           onChange={(e) => handleFileChange(e, 'state_dental_council_reg_photo')} disabled={modalMode === 'view'} />
                                                    {params.state_dental_council_reg_photo && (
                                                        <div className="mt-2">
                                                            <div className="relative inline-block">
                                                                <img
                                                                    src={params.state_dental_council_reg_photo instanceof File 
                                                                        ? URL.createObjectURL(params.state_dental_council_reg_photo)
                                                                        : (params.state_dental_council_reg_photo?.startsWith('http') 
                                                                            ? params.state_dental_council_reg_photo 
                                                                            : buildMediaUrl(params.state_dental_council_reg_photo))
                                                                    }
                                                                    alt="State Dental Council Registration"
                                                                    className="w-32 h-32 object-cover rounded border"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                                                    }}
                                                                />
                                                                {modalMode !== 'view' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (params.state_dental_council_reg_photo instanceof File) {
                                                                                setParams({ ...params, state_dental_council_reg_photo: null });
                                                                            } else {
                                                                                deleteProviderImage('state_dental_council_reg_photo', params.state_dental_council_reg_photo);
                                                                            }
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                                                        title="Remove photo"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {params.state_dental_council_reg_photo instanceof File 
                                                                    ? `${params.state_dental_council_reg_photo.name} (New)`
                                                                    : 'Current Registration Photo'
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="profile_photo">Profile Photo</label>
                                                    <input id="profile_photo" type="file" accept="image/*" className="form-input" 
                                                           onChange={(e) => handleFileChange(e, 'profile_photo')} disabled={modalMode === 'view'} />
                                                    {params.profile_photo && (
                                                        <div className="mt-2">
                                                            <div className="relative inline-block">
                                                                <img
                                                                    src={params.profile_photo instanceof File 
                                                                        ? URL.createObjectURL(params.profile_photo)
                                                                        : (params.profile_photo?.startsWith('http') 
                                                                            ? params.profile_photo 
                                                                            : buildMediaUrl(params.profile_photo))
                                                                    }
                                                                    alt="Profile Photo"
                                                                    className="w-32 h-32 object-cover rounded-full border"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                                                    }}
                                                                />
                                                                {modalMode !== 'view' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (params.profile_photo instanceof File) {
                                                                                setParams({ ...params, profile_photo: null });
                                                                            } else {
                                                                                deleteProviderImage('profile_photo', params.profile_photo);
                                                                            }
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                                                        title="Remove photo"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {params.profile_photo instanceof File 
                                                                    ? `${params.profile_photo.name} (New)`
                                                                    : 'Current Profile Photo'
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Clinic Details Section */}
                                        <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-pink-700">Clinic Details</h3>
                                            <div className="mb-4">
                                                <label htmlFor="number_of_clinics">Number of Clinics *</label>
                                                <select id="number_of_clinics" className="form-select" value={params.number_of_clinics} 
                                                        onChange={(e) => updateClinicCount(parseInt(e.target.value))} disabled={modalMode === 'view'}>
                                                    {[1,2,3,4,5].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {params.clinics.map((clinic: any, index: number) => (
                                                <div key={index} className="mb-4 p-4 border rounded-lg">
                                                    <h4 className="font-semibold mb-3">Clinic Details ({index + 1})</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label>Pan No <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_pan_no`} className={`form-input ${touched[`clinic_${index}_pan_no`] && errors[`clinic_${index}_pan_no`] ? 'border-red-500' : ''}`} value={clinic.pan_no}
                                                                   onChange={(e) => updateClinic(index, 'pan_no', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'pan_no', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_pan_no`] && errors[`clinic_${index}_pan_no`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_pan_no`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>Name of the Clinic <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_name`} className={`form-input ${touched[`clinic_${index}_name`] && errors[`clinic_${index}_name`] ? 'border-red-500' : ''}`} value={clinic.name}
                                                                   onChange={(e) => updateClinic(index, 'name', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'name', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_name`] && errors[`clinic_${index}_name`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_name`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>Clinic Contact Number <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_contact_number`} className={`form-input ${touched[`clinic_${index}_contact_number`] && errors[`clinic_${index}_contact_number`] ? 'border-red-500' : ''}`} value={clinic.contact_number}
                                                                   onChange={(e) => updateClinic(index, 'contact_number', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'contact_number', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_contact_number`] && errors[`clinic_${index}_contact_number`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_contact_number`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>Speciality <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_specialty`} className={`form-input ${touched[`clinic_${index}_specialty`] && errors[`clinic_${index}_specialty`] ? 'border-red-500' : ''}`} value={clinic.specialty}
                                                                   onChange={(e) => updateClinic(index, 'specialty', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'specialty', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_specialty`] && errors[`clinic_${index}_specialty`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_specialty`]}</p>}
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label>Clinic's Address <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_address`} className={`form-input ${touched[`clinic_${index}_address`] && errors[`clinic_${index}_address`] ? 'border-red-500' : ''}`} value={clinic.address}
                                                                   onChange={(e) => updateClinic(index, 'address', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'address', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_address`] && errors[`clinic_${index}_address`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_address`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>City <span className="text-red-500">*</span></label>
                                                            <select name={`clinic_${index}_city`} className={`form-select ${touched[`clinic_${index}_city`] && errors[`clinic_${index}_city`] ? 'border-red-500' : ''}`} value={clinic.city}
                                                                    onChange={(e) => updateClinic(index, 'city', e.target.value)}
                                                                    onBlur={(e) => handleClinicBlur(index, 'city', e.target.value)} disabled={modalMode === 'view'}>
                                                                <option value="">Select City</option>
                                                                {cities.map(city => (
                                                                    <option key={city} value={city}>{city}</option>
                                                                ))}
                                                            </select>
                                                            {touched[`clinic_${index}_city`] && errors[`clinic_${index}_city`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_city`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>State <span className="text-red-500">*</span></label>
                                                            <select name={`clinic_${index}_state`} className={`form-select ${touched[`clinic_${index}_state`] && errors[`clinic_${index}_state`] ? 'border-red-500' : ''}`} value={clinic.state}
                                                                    onChange={(e) => updateClinic(index, 'state', e.target.value)}
                                                                    onBlur={(e) => handleClinicBlur(index, 'state', e.target.value)} disabled={modalMode === 'view'}>
                                                                <option value="">Select State</option>
                                                                {states.map(state => (
                                                                    <option key={state} value={state}>{state}</option>
                                                                ))}
                                                            </select>
                                                            {touched[`clinic_${index}_state`] && errors[`clinic_${index}_state`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_state`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>Clinic PIN Code <span className="text-red-500">*</span></label>
                                                            <input type="text" name={`clinic_${index}_pin_code`} className={`form-input ${touched[`clinic_${index}_pin_code`] && errors[`clinic_${index}_pin_code`] ? 'border-red-500' : ''}`} value={clinic.pin_code}
                                                                   onChange={(e) => updateClinic(index, 'pin_code', e.target.value)}
                                                                   onBlur={(e) => handleClinicBlur(index, 'pin_code', e.target.value)} disabled={modalMode === 'view'} />
                                                            {touched[`clinic_${index}_pin_code`] && errors[`clinic_${index}_pin_code`] && <p className="mt-1 text-xs text-red-500">{errors[`clinic_${index}_pin_code`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label>Clinic Google Map Location URL</label>
                                                            <input type="url" className="form-input" value={clinic.google_map_url} 
                                                                   onChange={(e) => updateClinic(index, 'google_map_url', e.target.value)} disabled={modalMode === 'view'} />
                                                        </div>
                                                        <div>
                                                            <label>No. of Dental Chairs <span className="text-red-500">*</span></label>
                                                            <input type="number" className="form-input" value={clinic.dental_chairs} 
                                                                   onChange={(e) => updateClinic(index, 'dental_chairs', parseInt(e.target.value))} disabled={modalMode === 'view'} />
                                                        </div>
                                                        <div>
                                                            <label>Clinic Board</label>
                                                            <input type="file" accept="image/*" className="form-input" 
                                                                   onChange={(e) => updateClinic(index, 'clinic_board', e.target.files?.[0] || null)} disabled={modalMode === 'view'} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 4. Clinic Equipment Section */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4">Clinic Equipment</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* <div>
                                                    <label htmlFor="dental_chairs">Dental Chairs</label>
                                                    <input id="dental_chairs" name="dental_chairs" type="number" className="form-input" 
                                                           value={params.dental_chairs} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div> */}
                                                <div>
                                                    <label htmlFor="iopa_xray_type">IOPA Xray type</label>
                                                    <select id="iopa_xray_type" name="iopa_xray_type" className="form-select" 
                                                            value={params.iopa_xray_type} onChange={changeValue} disabled={modalMode === 'view'}>
                                                        <option value="Digital">Digital</option>
                                                        <option value="Film">Film</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="has_opg">OPG</label>
                                                    <select id="has_opg" name="has_opg" className="form-select" 
                                                            value={params.has_opg.toString()} onChange={(e) => setParams({...params, has_opg: e.target.value === 'true'})} disabled={modalMode === 'view'}>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="has_ultrasonic_cleaner">Ultrasonic Cleaner</label>
                                                    <select id="has_ultrasonic_cleaner" name="has_ultrasonic_cleaner" className="form-select" 
                                                            value={params.has_ultrasonic_cleaner.toString()} onChange={(e) => setParams({...params, has_ultrasonic_cleaner: e.target.value === 'true'})} disabled={modalMode === 'view'}>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="intraoral_camera_type">Intraoral Camera type</label>
                                                    <input id="intraoral_camera_type" name="intraoral_camera_type" type="text" className="form-input" 
                                                           value={params.intraoral_camera_type} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="rct_equipment">RCT Equipment</label>
                                                    <input id="rct_equipment" name="rct_equipment" type="text" className="form-input" 
                                                           value={params.rct_equipment} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="autoclave_type">Autoclave type</label>
                                                    <input id="autoclave_type" name="autoclave_type" type="text" className="form-input" 
                                                           value={params.autoclave_type} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="sterilization_protocol">Sterilization Protocol</label>
                                                    <input id="sterilization_protocol" name="sterilization_protocol" type="text" className="form-input" 
                                                           value={params.sterilization_protocol} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="disinfection_protocol">Disinfection Protocol</label>
                                                    <input id="disinfection_protocol" name="disinfection_protocol" type="text" className="form-input" 
                                                           value={params.disinfection_protocol} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Specialists Availability Section */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Specialists Availability</h3>
                                                {modalMode !== 'view' && (
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addSpecialist}>
                                                        Add Specialist
                                                    </button>
                                                )}
                                            </div>
                                            {params.specialists_availability.map((specialist: any, index: number) => (
                                                <div key={index} className="flex items-center gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <label>Type</label>
                                                        <select className="form-select" value={specialist.type} 
                                                                onChange={(e) => updateSpecialist(index, 'type', e.target.value)} disabled={modalMode === 'view'}>
                                                            {specialistTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label>Availability</label>
                                                        <select className="form-select" value={specialist.availability} 
                                                                onChange={(e) => updateSpecialist(index, 'availability', e.target.value)} disabled={modalMode === 'view'}>
                                                            {availabilityOptions.map(option => (
                                                                <option key={option} value={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {modalMode !== 'view' && (
                                                        <button type="button" className="btn btn-sm btn-danger mt-6" onClick={() => removeSpecialist(index)}>
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* 6. Clinic Bank Details Section */}
                                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-blue-700">Clinic Bank Details (1)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label htmlFor="bank_name">Bank Name</label>
                                                    <input id="bank_name" name="bank_name" type="text" className="form-input" 
                                                           value={params.bank_name} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_branch_name">Branch Name</label>
                                                    <input id="bank_branch_name" name="bank_branch_name" type="text" className="form-input" 
                                                           value={params.bank_branch_name} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_account_name">Account Name</label>
                                                    <input id="bank_account_name" name="bank_account_name" type="text" className="form-input" 
                                                           value={params.bank_account_name} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_account_number">Account Number</label>
                                                    <input id="bank_account_number" name="bank_account_number" type="text" className="form-input" 
                                                           value={params.bank_account_number} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_account_type">Account Type</label>
                                                    <select id="bank_account_type" name="bank_account_type" className="form-select" 
                                                            value={params.bank_account_type} onChange={changeValue} disabled={modalMode === 'view'}>
                                                        <option value="">Select Account Type</option>
                                                        {accountTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_micr_no">MICR No</label>
                                                    <input id="bank_micr_no" name="bank_micr_no" type="text" className="form-input" 
                                                           value={params.bank_micr_no} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="bank_ifsc_code">IFSC Code</label>
                                                    <input id="bank_ifsc_code" name="bank_ifsc_code" type="text" className="form-input" 
                                                           value={params.bank_ifsc_code} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 7. Additional Provider Information */}
                                        <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-green-700">Additional Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="specialty">Primary Specialty <span className="text-red-500">*</span></label>
                                                    <input id="specialty" name="specialty" type="text" className={`form-input ${touched.specialty && errors.specialty ? 'border-red-500' : ''}`}
                                                           value={params.specialty} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.specialty && errors.specialty && <p className="mt-1 text-xs text-red-500">{errors.specialty}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="clinic_name">Main Clinic Name <span className="text-red-500">*</span></label>
                                                    <input id="clinic_name" name="clinic_name" type="text" className={`form-input ${touched.clinic_name && errors.clinic_name ? 'border-red-500' : ''}`}
                                                           value={params.clinic_name} onChange={changeValue} onBlur={handleBlur} disabled={modalMode === 'view'} />
                                                    {touched.clinic_name && errors.clinic_name && <p className="mt-1 text-xs text-red-500">{errors.clinic_name}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="location">Location</label>
                                                    <input id="location" name="location" type="text" className="form-input" 
                                                           value={params.location} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="contact_number">Contact Number (Legacy)</label>
                                                    <input id="contact_number" name="contact_number" type="text" className="form-input" 
                                                           value={params.contact_number} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                <div>
                                                    <label htmlFor="availability">Availability</label>
                                                    <select id="availability" name="availability" className="form-select" 
                                                            value={params.availability} onChange={changeValue} disabled={modalMode === 'view'}>
                                                        <option value="">Select Availability</option>
                                                        {availabilityOptions.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="clinic_video_url">Clinic Video URL</label>
                                                    <input id="clinic_video_url" name="clinic_video_url" type="url" className="form-input" 
                                                           placeholder="https://youtube.com/watch?v=..." 
                                                           value={params.clinic_video_url} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                                {/* <div>
                                                    <label htmlFor="experience_years">Experience Years (Legacy)</label>
                                                    <input id="experience_years" name="experience_years" type="number" className="form-input" 
                                                           value={params.experience_years} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div> */}
                                                <div className="md:col-span-2">
                                                    <label htmlFor="about">About Provider</label>
                                                    <textarea id="about" name="about" rows={4} className="form-textarea" 
                                                              placeholder="Brief description about the provider and services..."
                                                              value={params.about} onChange={changeValue} disabled={modalMode === 'view'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 8. Clinic Photos Section */}
                                        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-purple-700">Clinic Photos</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label htmlFor="clinic_photos">Upload Multiple Clinic Photos</label>
                                                    <input 
                                                        id="clinic_photos" 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple 
                                                        className="form-input" 
                                                        onChange={(e) => addClinicPhotos(e.target.files)} 
                                                        disabled={modalMode === 'view'} 
                                                    />
                                                    <small className="text-gray-500">You can select multiple images at once</small>
                                                </div>
                                                {params.clinic_photos && params.clinic_photos.length > 0 && (
                                                    <div>
                                                        <label>Clinic Photos:</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                                                            {params.clinic_photos.map((photo: any, index: number) => {
                                                                // Handle both File objects (new uploads) and URL strings (existing photos)
                                                                const isFile = photo instanceof File;
                                                                const isExistingImage = typeof photo === 'string' && photo.length > 0;
                                                                
                                                                let imageUrl = '';
                                                                let imageName = '';
                                                                
                                                                if (isFile) {
                                                                    imageUrl = URL.createObjectURL(photo);
                                                                    imageName = photo.name;
                                                                } else if (isExistingImage) {
                                                                    // Check if it's already a full URL or needs to be converted
                                                                    if (photo.startsWith('http://') || photo.startsWith('https://')) {
                                                                        imageUrl = photo; // Already a full URL from API
                                                                    } else {
                                                                        imageUrl = buildMediaUrl(photo); // Convert relative path to full URL
                                                                    }
                                                                    imageName = photo.split('/').pop() || `Photo ${index + 1}`;
                                                                    console.log('Clinic photo:', photo, '-> Display URL:', imageUrl);
                                                                } else {
                                                                    imageName = `Photo ${index + 1}`;
                                                                    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                                                }
                                                                
                                                                return (
                                                                    <div key={index} className="relative group">
                                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={imageName}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    // Fallback for broken images
                                                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {modalMode !== 'view' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (isFile) {
                                                                                        // Remove from local state for new uploads
                                                                                        removeClinicPhoto(index);
                                                                                    } else if (isExistingImage) {
                                                                                        // Delete from server for existing images
                                                                                        deleteProviderImage('clinic_photos', photo, index);
                                                                                    }
                                                                                }}
                                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                                                                title="Remove photo"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        )}
                                                                        <div className="mt-1 text-xs text-gray-600 truncate" title={imageName}>
                                                                            {imageName}
                                                                            {isExistingImage && <span className="text-green-600 ml-1">✓</span>}
                                                                            {isFile && <span className="text-blue-600 ml-1">●</span>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            <span className="text-green-600">✓ Saved</span> | <span className="text-blue-600">● New</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 9. Weekly Time Slots Section */}
                                        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4 text-orange-700">Weekly Time Slots</h3>
                                            {(!params.time_slots || !Array.isArray(params.time_slots)) && (
                                                <div className="mb-4 p-3 bg-yellow-100 rounded text-yellow-800">
                                                    <p>Time slots not properly loaded. Using default schedule.</p>
                                                </div>
                                            )}
                                            <div className="space-y-4">
                                                {(params.time_slots && Array.isArray(params.time_slots) ? params.time_slots : []).map((slot: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-4 p-3 bg-white rounded border">
                                                        <div className="w-24">
                                                            <label className="font-medium">{slot.day}</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={slot.is_open}
                                                                onChange={() => toggleDayOpen(index)}
                                                                disabled={modalMode === 'view'}
                                                                className="form-checkbox"
                                                            />
                                                            {/* <label className="text-sm">Open</label> */}
                                                        </div>
                                                        {slot.is_open && (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-sm font-medium">Open:</label>
                                                                    <input
                                                                        type="time"
                                                                        value={slot.open_time}
                                                                        onChange={(e) => updateTimeSlot(index, 'open_time', e.target.value)}
                                                                        disabled={modalMode === 'view'}
                                                                        className="form-input w-32"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-sm font-medium">Close:</label>
                                                                    <input
                                                                        type="time"
                                                                        value={slot.close_time}
                                                                        onChange={(e) => updateTimeSlot(index, 'close_time', e.target.value)}
                                                                        disabled={modalMode === 'view'}
                                                                        className="form-input w-32"
                                                                    />
                                                                </div>
                                                                {modalMode !== 'view' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyTimeToAllDays(index)}
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        title="Copy this time to all days"
                                                                    >
                                                                        Copy to All
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {!slot.is_open && (
                                                            <div className="text-gray-500 italic">Closed</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                           
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex justify-end items-center mt-8 gap-3">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                {modalMode === 'view' ? 'Close' : 'Cancel'}
                                            </button>
                                            {modalMode !== 'view' && (
                                                <button type="button" className="btn btn-primary" onClick={saveItem} disabled={loading}>
                                                    {loading ? 'Saving...' : modalMode === 'create' ? 'Add Provider' : 'Update Provider'}
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

export default ProvidersCRUD;