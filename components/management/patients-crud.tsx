'use client';
import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, buildMediaUrl } from '@/config/api.config';
import SearchableSelect from '@/components/ui/searchable-select';
import { getAuthToken } from '@/utils/auth';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    user_type: string;
    profile_picture?: string;
}

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    emergency_contact_name?: string;
    emergency_contact_number?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    profile_photo?: string;
    gender?: string;
    blood_group?: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
    marital_status?: string;
    nationality?: string;
    preferred_language?: string;
    religion?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    chronic_conditions?: string;
    previous_surgeries?: string;
    family_medical_history?: string;
    dental_history?: string;
    dental_concerns?: string;
    previous_dental_treatments?: string;
    dental_anxiety_level?: number;
    preferred_appointment_time?: string;
    special_needs?: string;
    secondary_phone?: string;
    work_phone?: string;
    preferred_contact_method?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    insurance_type?: string;
    insurance_expiry_date?: string;
    insurance_coverage_amount?: number;
    communication_preferences?: any;
    appointment_preferences?: any;
    privacy_settings?: any;
    created_at: string;
    updated_at: string;
}

interface FamilyMember {
    id: string;
    first_name: string;
    last_name: string;
    relationship: string;
    mobile_number?: string;
    date_of_birth?: string;
    profile_photo?: string;
    gender?: string;
    blood_group?: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
    email?: string;
    secondary_phone?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    chronic_conditions?: string;
    previous_surgeries?: string;
    dental_history?: string;
    dental_concerns?: string;
    previous_dental_treatments?: string;
    dental_anxiety_level?: number;
    special_needs?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    insurance_type?: string;
    insurance_expiry_date?: string;
    is_primary_contact?: boolean;
    emergency_contact?: boolean;
    notes?: string;
}

const PatientsCrud = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
    const [currentPatientId, setCurrentPatientId] = useState<string>('');
    const [activeTab, setActiveTab] = useState('basic');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterBloodGroup, setFilterBloodGroup] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    // Form state
    const [formData, setFormData] = useState<Partial<Patient> & { first_name?: string; last_name?: string; email?: string; mobile_number?: string }>({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        insurance_provider: '',
        insurance_policy_number: '',
        gender: '',
        blood_group: '',
        height_cm: undefined,
        weight_kg: undefined,
        occupation: '',
        marital_status: '',
        nationality: '',
        preferred_language: '',
        religion: '',
        medical_history: '',
        current_medications: '',
        allergies: '',
        chronic_conditions: '',
        previous_surgeries: '',
        family_medical_history: '',
        dental_history: '',
        dental_concerns: '',
        previous_dental_treatments: '',
        dental_anxiety_level: undefined,
        preferred_appointment_time: '',
        special_needs: '',
        secondary_phone: '',
        work_phone: '',
        preferred_contact_method: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        insurance_type: '',
        insurance_expiry_date: '',
        insurance_coverage_amount: undefined,
        communication_preferences: {},
        appointment_preferences: {},
        privacy_settings: {}
    });

    const [familyFormData, setFamilyFormData] = useState<Partial<FamilyMember>>({
        first_name: '',
        last_name: '',
        relationship: '',
        mobile_number: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        height_cm: undefined,
        weight_kg: undefined,
        occupation: '',
        email: '',
        secondary_phone: '',
        medical_history: '',
        current_medications: '',
        allergies: '',
        chronic_conditions: '',
        previous_surgeries: '',
        dental_history: '',
        dental_concerns: '',
        previous_dental_treatments: '',
        dental_anxiety_level: undefined,
        special_needs: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_type: '',
        insurance_expiry_date: '',
        is_primary_contact: false,
        emergency_contact: false,
        notes: ''
    });

    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [familyPhoto, setFamilyPhoto] = useState<File | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
        fetchPatients();
        fetchUsers();
    }, [currentPage, searchTerm, filterGender, filterBloodGroup, filterCity]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(filterGender && { gender: filterGender }),
                ...(filterBloodGroup && { blood_group: filterBloodGroup }),
                ...(filterCity && { city: filterCity })
            });

            const response = await fetch(`${API_ENDPOINTS.patients}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPatients(data.data || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalRecords(data.pagination?.total || 0);
            } else {
                console.error('Failed to fetch patients');
                Swal.fire('Error', 'Failed to fetch patients', 'error');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            Swal.fire('Error', 'Failed to fetch patients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_ENDPOINTS.users}?user_type=patient&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchFamilyMembers = async (patientId: string) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_ENDPOINTS.patients}/${patientId}/family-members`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFamilyMembers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
        }
    };

    // Map field name → which tab it lives on
    const fieldTabMap: Record<string, string> = {
        id: 'basic',
        emergency_contact_name: 'basic',
        emergency_contact_number: 'basic',
        gender: 'basic',
        address_line_1: 'contact',
        city: 'contact',
        state: 'contact',

    };

    // Required field labels for error messages
    const requiredFields: Record<string, string> = {
        emergency_contact_name: 'Emergency contact name is required',
        emergency_contact_number: 'Emergency contact number is required',
        gender: 'Gender is required',
        address_line_1: 'Address is required',
        city: 'City is required',
        state: 'State is required',

    };

    const validateForm = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};
        // Only require user selection on create
        if (!editingPatient && !formData.id) newErrors.id = 'Please select a user';
        Object.keys(requiredFields).forEach(key => {
            if (!formData[key as keyof typeof formData]) newErrors[key] = requiredFields[key];
        });
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForm();
        const newTouched: Record<string, boolean> = {};
        Object.keys(newErrors).forEach(k => { newTouched[k] = true; });

        if (Object.keys(newErrors).length > 0) {
            flushSync(() => {
                setErrors(newErrors);
                setTouched(prev => ({ ...prev, ...newTouched }));
            });
            const firstKey = Object.keys(newErrors)[0];
            const targetTab = fieldTabMap[firstKey] || 'basic';
            setActiveTab(targetTab);
            setTimeout(() => {
                const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement;
                if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }, 50);
            return;
        }

        try {
            const token = getAuthToken();
            const submitFormData = new FormData();

            // Add all form fields — convert empty strings to null for constrained enum fields
            const enumFields = ['blood_group', 'marital_status', 'preferred_contact_method', 'gender', 'insurance_type', 'preferred_appointment_time'];
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== undefined && value !== null) {
                    if (enumFields.includes(key) && value === '') {
                        // skip — don't send empty string for enum fields (DB constraint)
                        return;
                    }
                    if (typeof value === 'object') {
                        submitFormData.append(key, JSON.stringify(value));
                    } else {
                        submitFormData.append(key, value.toString());
                    }
                }
            });

            // Add profile photo if selected
            if (profilePhoto) {
                submitFormData.append('profile_photo', profilePhoto);
            }

            const url = editingPatient 
                ? `${API_ENDPOINTS.patients}/${editingPatient.id}`
                : API_ENDPOINTS.patients;
            
            const method = editingPatient ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: result.message || 'Patient saved successfully',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true,
                });
                setIsOpen(false);
                resetForm();
                fetchPatients();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Failed to save patient';
                
                // Parse database constraint errors and show inline
                const newErrors: Record<string, string> = {};
                const newTouched: Record<string, boolean> = {};
                
                if (errorMessage.includes('patients_gender_check')) {
                    newErrors.gender = 'Please select a valid gender';
                    newTouched.gender = true;
                    setActiveTab('basic');
                } else if (errorMessage.includes('blood_group')) {
                    newErrors.blood_group = 'Please select a valid blood group';
                    newTouched.blood_group = true;
                    setActiveTab('basic');
                } else if (errorMessage.includes('marital_status')) {
                    newErrors.marital_status = 'Please select a valid marital status';
                    newTouched.marital_status = true;
                    setActiveTab('basic');
                } else if (errorMessage.includes('preferred_contact_method')) {
                    newErrors.preferred_contact_method = 'Please select a valid contact method';
                    newTouched.preferred_contact_method = true;
                    setActiveTab('contact');
                } else {
                    Swal.fire('Error', errorMessage, 'error');
                    return;
                }                
                setErrors(newErrors);
                setTouched(prev => ({ ...prev, ...newTouched }));
                
                // Focus on the first error field
                setTimeout(() => {
                    const firstKey = Object.keys(newErrors)[0];
                    const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement;
                    if (el) { 
                        el.focus(); 
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error saving patient:', error);
            Swal.fire('Error', 'Failed to save patient', 'error');
        }
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setTouched({});
        setErrors({});
        setFormData({
            id: patient.id,
            first_name: (patient as any).first_name || '',
            last_name: (patient as any).last_name || '',
            email: (patient as any).email || '',
            mobile_number: (patient as any).mobile_number || '',
            emergency_contact_name: patient.emergency_contact_name || '',
            emergency_contact_number: patient.emergency_contact_number || '',
            insurance_provider: patient.insurance_provider || '',
            insurance_policy_number: patient.insurance_policy_number || '',
            gender: patient.gender || '',
            blood_group: patient.blood_group || '',
            height_cm: patient.height_cm,
            weight_kg: patient.weight_kg,
            occupation: patient.occupation || '',
            marital_status: patient.marital_status || '',
            nationality: patient.nationality || '',
            preferred_language: patient.preferred_language || '',
            religion: patient.religion || '',
            medical_history: patient.medical_history || '',
            current_medications: patient.current_medications || '',
            allergies: patient.allergies || '',
            chronic_conditions: patient.chronic_conditions || '',
            previous_surgeries: patient.previous_surgeries || '',
            family_medical_history: patient.family_medical_history || '',
            dental_history: patient.dental_history || '',
            dental_concerns: patient.dental_concerns || '',
            previous_dental_treatments: patient.previous_dental_treatments || '',
            dental_anxiety_level: patient.dental_anxiety_level,
            preferred_appointment_time: patient.preferred_appointment_time || '',
            special_needs: patient.special_needs || '',
            secondary_phone: patient.secondary_phone || '',
            work_phone: patient.work_phone || '',
            preferred_contact_method: patient.preferred_contact_method || '',
            address_line_1: patient.address_line_1 || '',
            address_line_2: patient.address_line_2 || '',
            city: patient.city || '',
            state: patient.state || '',
            postal_code: patient.postal_code || '',
            country: patient.country || 'India',
            insurance_type: patient.insurance_type || '',
            insurance_expiry_date: patient.insurance_expiry_date || '',
            insurance_coverage_amount: patient.insurance_coverage_amount,
            communication_preferences: patient.communication_preferences || {},
            appointment_preferences: patient.appointment_preferences || {},
            privacy_settings: patient.privacy_settings || {}
        });
        // Show existing profile photo preview
        if (patient.profile_photo) {
            setPhotoPreview(buildMediaUrl(patient.profile_photo));
        } else {
            setPhotoPreview(null);
        }
        setProfilePhoto(null);
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the patient and all associated data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_ENDPOINTS.patients}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Patient has been deleted.',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                    fetchPatients();
                } else {
                    Swal.fire('Error', 'Failed to delete patient', 'error');
                }
            } catch (error) {
                console.error('Error deleting patient:', error);
                Swal.fire('Error', 'Failed to delete patient', 'error');
            }
        }
    };

    const resetForm = () => {
        setTouched({});
        setErrors({});
        setFormData({
            id: '',
            first_name: '',
            last_name: '',
            email: '',
            mobile_number: '',
            emergency_contact_number: '',
            insurance_provider: '',
            insurance_policy_number: '',
            gender: '',
            blood_group: '',
            height_cm: undefined,
            weight_kg: undefined,
            occupation: '',
            marital_status: '',
            nationality: '',
            preferred_language: '',
            religion: '',
            medical_history: '',
            current_medications: '',
            allergies: '',
            chronic_conditions: '',
            previous_surgeries: '',
            family_medical_history: '',
            dental_history: '',
            dental_concerns: '',
            previous_dental_treatments: '',
            dental_anxiety_level: undefined,
            preferred_appointment_time: '',
            special_needs: '',
            secondary_phone: '',
            work_phone: '',
            preferred_contact_method: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            insurance_type: '',
            insurance_expiry_date: '',
            insurance_coverage_amount: undefined,
            communication_preferences: {},
            appointment_preferences: {},
            privacy_settings: {}
        });
        setEditingPatient(null);
        setProfilePhoto(null);
        setPhotoPreview(null);
        setActiveTab('basic');
    };

    const handleFamilySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = getAuthToken();
            const submitFormData = new FormData();

            // Add all family form fields
            Object.keys(familyFormData).forEach(key => {
                const value = familyFormData[key as keyof typeof familyFormData];
                if (value !== undefined && value !== null && value !== '') {
                    submitFormData.append(key, value.toString());
                }
            });

            // Add family photo if selected
            if (familyPhoto) {
                submitFormData.append('family_member_photo', familyPhoto);
            }

            const url = editingFamilyMember 
                ? `${API_ENDPOINTS.patients}/${currentPatientId}/family-members/${editingFamilyMember.id}`
                : `${API_ENDPOINTS.patients}/${currentPatientId}/family-members`;
            
            const method = editingFamilyMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: result.message || 'Family member saved successfully',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true,
                });
                resetFamilyForm();
                fetchFamilyMembers(currentPatientId);
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'Failed to save family member', 'error');
            }
        } catch (error) {
            console.error('Error saving family member:', error);
            Swal.fire('Error', 'Failed to save family member', 'error');
        }
    };

    const handleFamilyEdit = (member: FamilyMember) => {
        setEditingFamilyMember(member);
        setFamilyFormData({
            first_name: member.first_name,
            last_name: member.last_name,
            relationship: member.relationship,
            mobile_number: member.mobile_number || '',
            date_of_birth: member.date_of_birth || '',
            gender: member.gender || '',
            blood_group: member.blood_group || '',
            height_cm: member.height_cm,
            weight_kg: member.weight_kg,
            occupation: member.occupation || '',
            email: member.email || '',
            secondary_phone: member.secondary_phone || '',
            medical_history: member.medical_history || '',
            current_medications: member.current_medications || '',
            allergies: member.allergies || '',
            chronic_conditions: member.chronic_conditions || '',
            previous_surgeries: member.previous_surgeries || '',
            dental_history: member.dental_history || '',
            dental_concerns: member.dental_concerns || '',
            previous_dental_treatments: member.previous_dental_treatments || '',
            dental_anxiety_level: member.dental_anxiety_level,
            special_needs: member.special_needs || '',
            insurance_provider: member.insurance_provider || '',
            insurance_policy_number: member.insurance_policy_number || '',
            insurance_type: member.insurance_type || '',
            insurance_expiry_date: member.insurance_expiry_date || '',
            is_primary_contact: member.is_primary_contact || false,
            emergency_contact: member.emergency_contact || false,
            notes: member.notes || ''
        });
    };

    const handleFamilyDelete = async (memberId: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the family member!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_ENDPOINTS.patients}/${currentPatientId}/family-members/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Family member has been deleted.',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                    fetchFamilyMembers(currentPatientId);
                } else {
                    Swal.fire('Error', 'Failed to delete family member', 'error');
                }
            } catch (error) {
                console.error('Error deleting family member:', error);
                Swal.fire('Error', 'Failed to delete family member', 'error');
            }
        }
    };

    const resetFamilyForm = () => {
        setFamilyFormData({
            first_name: '',
            last_name: '',
            relationship: '',
            mobile_number: '',
            date_of_birth: '',
            gender: '',
            blood_group: '',
            height_cm: undefined,
            weight_kg: undefined,
            occupation: '',
            email: '',
            secondary_phone: '',
            medical_history: '',
            current_medications: '',
            allergies: '',
            chronic_conditions: '',
            previous_surgeries: '',
            dental_history: '',
            dental_concerns: '',
            previous_dental_treatments: '',
            dental_anxiety_level: undefined,
            special_needs: '',
            insurance_provider: '',
            insurance_policy_number: '',
            insurance_type: '',
            insurance_expiry_date: '',
            is_primary_contact: false,
            emergency_contact: false,
            notes: ''
        });
        setEditingFamilyMember(null);
        setFamilyPhoto(null);
    };

    const handleFamilyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFamilyFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFamilyFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
        } else {
            setFamilyFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const openFamilyModal = (patientId: string) => {
        setCurrentPatientId(patientId);
        fetchFamilyMembers(patientId);
        resetFamilyForm();
        setIsFamilyModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const newErrors = { ...errors };
        if (name === 'id') {
            if (!formData.id) newErrors.id = 'Please select a user';
            else delete newErrors.id;
        } else if (requiredFields[name]) {
            if (!value) newErrors[name] = requiredFields[name];
            else delete newErrors[name];
        }
        setErrors(newErrors);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPatients();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterGender('');
        setFilterBloodGroup('');
        setFilterCity('');
        setCurrentPage(1);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} entries
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };
    const renderBasicInfoTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                    name="id"
                    options={users.map(u => ({
                        value: u.id,
                        label: `${u.first_name} ${u.last_name} (${u.email || u.mobile_number})`,
                        meta: {
                            first_name: u.first_name,
                            last_name: u.last_name,
                            email: u.email,
                            profile_picture: u.profile_picture,
                        }
                    }))}
                    value={formData.id || ''}
                    onChange={(val, opt) => {
                        handleInputChange({ target: { name: 'id', value: val, type: 'select' } } as any);
                        if (opt?.meta) {
                            setFormData(prev => ({
                                ...prev,
                                id: val,
                                first_name: opt.meta.first_name || '',
                                last_name: opt.meta.last_name || '',
                                email: opt.meta.email || '',
                            } as any));
                            // Show existing profile picture preview
                            if (opt.meta.profile_picture) {
                                const url = buildMediaUrl(opt.meta.profile_picture);
                                setPhotoPreview(url || null);
                            } else {
                                setPhotoPreview(null);
                            }
                        }
                    }}
                    placeholder="Select a user..."
                    disabled={!!editingPatient}
                    className={touched.id && errors.id ? 'border-red-500' : ''}
                />
                {touched.id && errors.id && <p className="mt-1 text-xs text-red-500">{errors.id}</p>}
            </div>

            {/* User info fields — editable, saved to users table */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" value={(formData as any).first_name || ''} onChange={handleInputChange}
                    className="form-input" placeholder="First name" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" value={(formData as any).last_name || ''} onChange={handleInputChange}
                    className="form-input" placeholder="Last name" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={(formData as any).email || ''} onChange={handleInputChange}
                    className="form-input" placeholder="Email address" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                {/* Show existing/selected photo preview */}
                {(photoPreview || profilePhoto) && (
                    <div className="mb-2">
                        <img
                            src={profilePhoto ? URL.createObjectURL(profilePhoto) : photoPreview!}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        />
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setProfilePhoto(file);
                        if (file) setPhotoPreview(URL.createObjectURL(file));
                    }}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.emergency_contact_name && errors.emergency_contact_name ? 'border-red-500' : ''}`}
                />
                {touched.emergency_contact_name && errors.emergency_contact_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.emergency_contact_name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    name="emergency_contact_number"
                    value={formData.emergency_contact_number}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.emergency_contact_number && errors.emergency_contact_number ? 'border-red-500' : ''}`}
                />
                {touched.emergency_contact_number && errors.emergency_contact_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.emergency_contact_number}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                </label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-select ${touched.gender && errors.gender ? 'border-red-500' : ''}`}
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {touched.gender && errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                    className="form-select"
                >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm || ''}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    name="weight_kg"
                    value={formData.weight_kg || ''}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-select ${touched.marital_status && errors.marital_status ? 'border-red-500' : ''}`}
                >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Other">Other</option>
                </select>
                {touched.marital_status && errors.marital_status && <p className="mt-1 text-xs text-red-500">{errors.marital_status}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                <input
                    type="text"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>
        </div>
    );

    const renderMedicalInfoTab = () => (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                <textarea
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                <textarea
                    name="current_medications"
                    value={formData.current_medications}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                <textarea
                    name="chronic_conditions"
                    value={formData.chronic_conditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Surgeries</label>
                <textarea
                    name="previous_surgeries"
                    value={formData.previous_surgeries}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Medical History</label>
                <textarea
                    name="family_medical_history"
                    value={formData.family_medical_history}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>
        </div>
    );

    const renderDentalInfoTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dental History</label>
                <textarea
                    name="dental_history"
                    value={formData.dental_history}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dental Concerns</label>
                <textarea
                    name="dental_concerns"
                    value={formData.dental_concerns}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dental Anxiety Level (1-10)</label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    name="dental_anxiety_level"
                    value={formData.dental_anxiety_level || ''}
                    onChange={handleInputChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Appointment Time</label>
                <select
                    name="preferred_appointment_time"
                    value={formData.preferred_appointment_time}
                    onChange={handleInputChange}
                    className="form-select"
                >
                    <option value="">Select Time</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                </select>
            </div>
        </div>
    );

    const renderContactInfoTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                <input type="tel" name="secondary_phone" value={formData.secondary_phone} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone</label>
                <input type="tel" name="work_phone" value={formData.work_phone} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                <select name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleInputChange} className="form-select">
                    <option value="">Select Method</option>
                    <option value="Phone">Phone</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text" name="address_line_1" value={formData.address_line_1}
                    onChange={handleInputChange} onBlur={handleBlur}
                    className={`form-input ${touched.address_line_1 && errors.address_line_1 ? 'border-red-500' : ''}`}
                />
                {touched.address_line_1 && errors.address_line_1 && <p className="mt-1 text-xs text-red-500">{errors.address_line_1}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                </label>
                <input
                    type="text" name="city" value={formData.city}
                    onChange={handleInputChange} onBlur={handleBlur}
                    className={`form-input ${touched.city && errors.city ? 'border-red-500' : ''}`}
                />
                {touched.city && errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                </label>
                <input
                    type="text" name="state" value={formData.state}
                    onChange={handleInputChange} onBlur={handleBlur}
                    className={`form-input ${touched.state && errors.state ? 'border-red-500' : ''}`}
                />
                {touched.state && errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="form-input" />
            </div>
        </div>
    );

    const renderInsuranceTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <input
                    type="text" name="insurance_provider" value={formData.insurance_provider}
                    onChange={handleInputChange} className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy Number</label>
                <input
                    type="text" name="insurance_policy_number" value={formData.insurance_policy_number}
                    onChange={handleInputChange} className="form-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
                <input type="text" name="insurance_type" value={formData.insurance_type} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                <input type="date" name="insurance_expiry_date" value={formData.insurance_expiry_date || ''} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Coverage Amount (₹)</label>
                <input type="number" name="insurance_coverage_amount" value={formData.insurance_coverage_amount || ''} onChange={handleInputChange} className="form-input" />
            </div>
        </div>
    );
    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Patients Management</h5>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setIsOpen(true);
                    }}
                >
                    Add Patient
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-5">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Filter by city..."
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="form-select"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    
                    <div className="flex gap-2">
                       
                        <button type="button" onClick={clearFilters} className="btn btn-outline-primary">
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Patients Table */}
            <div className="datatables">
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Blood Group</th>
                                    <th>City</th>
                                    <th>Emergency Contact</th>
                                    <th>Insurance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                {patient.profile_photo ? (
                                                    <img
                                                        src={buildMediaUrl(patient.profile_photo)}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="font-semibold">{patient.first_name} {patient.last_name}</div>
                                                <div className="text-xs text-gray-500">{patient.email}</div>
                                            </div>
                                        </td>
                                        <td>{patient.gender || '-'}</td>
                                        <td>{patient.blood_group || '-'}</td>
                                        <td>{patient.city || '-'}</td>
                                        <td>
                                            <div>
                                                <div className="text-sm">{patient.emergency_contact_name || '-'}</div>
                                                <div className="text-xs text-gray-500">{patient.emergency_contact_number || '-'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="text-sm">{patient.insurance_provider || '-'}</div>
                                                <div className="text-xs text-gray-500">{patient.insurance_policy_number || '-'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEdit(patient)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() => openFamilyModal(patient.id)}
                                                >
                                                    Family
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(patient.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {patients.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No patients found
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && patients.length > 0 && renderPagination()}
            </div>

            {/* Add/Edit Patient Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-4xl text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">
                                            {editingPatient ? 'Edit Patient' : 'Add Patient'}
                                        </h5>
                                        <button
                                            type="button"
                                            className="text-white-dark hover:text-dark"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="p-5">
                                        <form onSubmit={handleSubmit}>
                                            {/* Tab Navigation */}
                                            <div className="mb-5">
                                                <div className="flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                                    {[
                                                        { id: 'basic', label: 'Basic Info' },
                                                        { id: 'medical', label: 'Medical Info' },
                                                        { id: 'dental', label: 'Dental Info' },
                                                        { id: 'contact', label: 'Contact & Address' },
                                                        { id: 'insurance', label: 'Insurance' }
                                                    ].map((tab) => {
                                                        const hasError = Object.keys(errors).some(k => (fieldTabMap[k] || 'basic') === tab.id);
                                                        return (
                                                            <button
                                                                key={tab.id}
                                                                type="button"
                                                                className={`${
                                                                    activeTab === tab.id
                                                                        ? '!border-primary !text-primary'
                                                                        : 'border-transparent text-dark dark:text-white-dark hover:text-primary'
                                                                } -mb-[1px] block border-b border-transparent p-3.5 py-2 hover:text-primary relative`}
                                                                onClick={() => setActiveTab(tab.id)}
                                                            >
                                                                {tab.label}
                                                                {hasError && (
                                                                    <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500 align-middle"></span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Tab Content */}
                                            <div className="mb-5">
                                                {activeTab === 'basic' && renderBasicInfoTab()}
                                                {activeTab === 'medical' && renderMedicalInfoTab()}
                                                {activeTab === 'dental' && renderDentalInfoTab()}
                                                {activeTab === 'contact' && renderContactInfoTab()}
                                                {activeTab === 'insurance' && renderInsuranceTab()}
                                            </div>

                                            <div className="flex justify-end items-center mt-8">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {editingPatient ? 'Update Patient' : 'Add Patient'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Family Members Modal */}
            <Transition appear show={isFamilyModalOpen} as={Fragment}>
                <Dialog as="div" open={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-6xl text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">Family Members Management</h5>
                                        <button
                                            type="button"
                                            className="text-white-dark hover:text-dark"
                                            onClick={() => setIsFamilyModalOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="p-5">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Add/Edit Family Member Form */}
                                            <div className="panel">
                                                <h6 className="font-semibold text-lg mb-4">
                                                    {editingFamilyMember ? 'Edit Family Member' : 'Add Family Member'}
                                                </h6>
                                                
                                                <form onSubmit={handleFamilySubmit}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                First Name <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="first_name"
                                                                value={familyFormData.first_name}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Last Name <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="last_name"
                                                                value={familyFormData.last_name}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Relationship <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="relationship"
                                                                value={familyFormData.relationship}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-select"
                                                                required
                                                            >
                                                                <option value="">Select Relationship</option>
                                                                <option value="Spouse">Spouse</option>
                                                                <option value="Child">Child</option>
                                                                <option value="Parent">Parent</option>
                                                                <option value="Sibling">Sibling</option>
                                                                <option value="Grandparent">Grandparent</option>
                                                                <option value="Grandchild">Grandchild</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => setFamilyPhoto(e.target.files?.[0] || null)}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                                            <input
                                                                type="tel"
                                                                name="mobile_number"
                                                                value={familyFormData.mobile_number}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                                            <input
                                                                type="date"
                                                                name="date_of_birth"
                                                                value={familyFormData.date_of_birth}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                            <select
                                                                name="gender"
                                                                value={familyFormData.gender}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-select"
                                                            >
                                                                <option value="">Select Gender</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                                            <select
                                                                name="blood_group"
                                                                value={familyFormData.blood_group}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-select"
                                                            >
                                                                <option value="">Select Blood Group</option>
                                                                <option value="A+">A+</option>
                                                                <option value="A-">A-</option>
                                                                <option value="B+">B+</option>
                                                                <option value="B-">B-</option>
                                                                <option value="AB+">AB+</option>
                                                                <option value="AB-">AB-</option>
                                                                <option value="O+">O+</option>
                                                                <option value="O-">O-</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={familyFormData.email}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                                            <input
                                                                type="text"
                                                                name="occupation"
                                                                value={familyFormData.occupation}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                                            <input
                                                                type="number"
                                                                name="height_cm"
                                                                value={familyFormData.height_cm || ''}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                name="weight_kg"
                                                                value={familyFormData.weight_kg || ''}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                                            <textarea
                                                                name="medical_history"
                                                                value={familyFormData.medical_history}
                                                                onChange={handleFamilyInputChange}
                                                                rows={2}
                                                                className="form-textarea"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                                            <textarea
                                                                name="allergies"
                                                                value={familyFormData.allergies}
                                                                onChange={handleFamilyInputChange}
                                                                rows={2}
                                                                className="form-textarea"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                                                            <input
                                                                type="text"
                                                                name="insurance_provider"
                                                                value={familyFormData.insurance_provider}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy Number</label>
                                                            <input
                                                                type="text"
                                                                name="insurance_policy_number"
                                                                value={familyFormData.insurance_policy_number}
                                                                onChange={handleFamilyInputChange}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    name="is_primary_contact"
                                                                    checked={familyFormData.is_primary_contact}
                                                                    onChange={handleFamilyInputChange}
                                                                    className="form-checkbox"
                                                                />
                                                                <span className="ml-2">Primary Contact</span>
                                                            </label>
                                                        </div>

                                                        <div>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    name="emergency_contact"
                                                                    checked={familyFormData.emergency_contact}
                                                                    onChange={handleFamilyInputChange}
                                                                    className="form-checkbox"
                                                                />
                                                                <span className="ml-2">Emergency Contact</span>
                                                            </label>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                                            <textarea
                                                                name="notes"
                                                                value={familyFormData.notes}
                                                                onChange={handleFamilyInputChange}
                                                                rows={2}
                                                                className="form-textarea"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={resetFamilyForm}
                                                        >
                                                            Reset
                                                        </button>
                                                        <button type="submit" className="btn btn-primary">
                                                            {editingFamilyMember ? 'Update' : 'Add'} Family Member
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Family Members List */}
                                            <div className="panel">
                                                <h6 className="font-semibold text-lg mb-4">Family Members</h6>
                                                
                                                <div className="space-y-4">
                                                    {familyMembers.map((member) => (
                                                        <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                                                        {member.profile_photo ? (
                                                                            <img
                                                                                src={buildMediaUrl(member.profile_photo)}
                                                                                alt="Profile"
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                                                                                {member.first_name?.[0]}{member.last_name?.[0]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="font-semibold">{member.first_name} {member.last_name}</h6>
                                                                        <p className="text-sm text-gray-600">{member.relationship}</p>
                                                                        {member.mobile_number && (
                                                                            <p className="text-sm text-gray-500">{member.mobile_number}</p>
                                                                        )}
                                                                        {member.email && (
                                                                            <p className="text-sm text-gray-500">{member.email}</p>
                                                                        )}
                                                                        <div className="flex gap-2 mt-1">
                                                                            {member.is_primary_contact && (
                                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>
                                                                            )}
                                                                            {member.emergency_contact && (
                                                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Emergency</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => handleFamilyEdit(member)}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleFamilyDelete(member.id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    
                                                    {familyMembers.length === 0 && (
                                                        <div className="text-center py-8 text-gray-500">
                                                            No family members added yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PatientsCrud;