'use client';
import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, buildMediaUrl } from '@/config/api.config';
import { getAuthToken, getUser as getUserData } from '@/utils/auth';

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

const PatientFamilyManagement = () => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [currentPatientId, setCurrentPatientId] = useState<string>('');

    const [formData, setFormData] = useState<Partial<FamilyMember>>({
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

    const [familyPhoto, setFamilyPhoto] = useState<File | null>(null);

    useEffect(() => {
        const userData = getUserData();
        if (userData && userData.id) {
            setCurrentPatientId(userData.id);
            fetchFamilyMembers(userData.id);
        }
    }, []);

    const fetchFamilyMembers = async (patientId: string) => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(`${API_ENDPOINTS.myFamilyMembers}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFamilyMembers(data.data || []);
            } else {
                console.error('Failed to fetch family members');
                Swal.fire('Error', 'Failed to fetch family members', 'error');
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
            Swal.fire('Error', 'Failed to fetch family members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = getAuthToken();
            const submitFormData = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== undefined && value !== null && value !== '') {
                    submitFormData.append(key, value.toString());
                }
            });

            // Add family photo if selected
            if (familyPhoto) {
                submitFormData.append('family_member_photo', familyPhoto);
            }

            const url = editingMember 
                ? `${API_ENDPOINTS.myFamilyMembers}/${editingMember.id}`
                : API_ENDPOINTS.myFamilyMembers;
            
            const method = editingMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire('Success', result.message || 'Family member saved successfully', 'success');
                setIsModalOpen(false);
                resetForm();
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

    const handleEdit = (member: FamilyMember) => {
        setEditingMember(member);
        setFormData({
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
        setIsModalOpen(true);
    };

    const handleDelete = async (memberId: string) => {
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
                const response = await fetch(`${API_ENDPOINTS.myFamilyMembers}/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    Swal.fire('Deleted!', 'Family member has been deleted.', 'success');
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

    const resetForm = () => {
        setFormData({
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
        setEditingMember(null);
        setFamilyPhoto(null);
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
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Family Members</h1>
                    <p className="text-gray-600">Manage your family member information</p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    Add Family Member
                </button>
            </div>

            {/* Family Members List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : familyMembers.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-gray-500 text-lg mb-4">No family members added yet</div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    resetForm();
                                    setIsModalOpen(true);
                                }}
                            >
                                Add Your First Family Member
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {familyMembers.map((member) => (
                                <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
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
                                                <h3 className="font-semibold text-gray-900">
                                                    {member.first_name} {member.last_name}
                                                </h3>
                                                <p className="text-sm text-gray-600">{member.relationship}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {member.mobile_number && (
                                            <p className="text-sm text-gray-600">📱 {member.mobile_number}</p>
                                        )}
                                        {member.email && (
                                            <p className="text-sm text-gray-600">✉️ {member.email}</p>
                                        )}
                                        {member.date_of_birth && (
                                            <p className="text-sm text-gray-600">🎂 {new Date(member.date_of_birth).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        {member.is_primary_contact && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>
                                        )}
                                        {member.emergency_contact && (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Emergency</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary flex-1"
                                            onClick={() => handleEdit(member)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger flex-1"
                                            onClick={() => handleDelete(member.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Family Member Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
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
                                            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                                        </h5>
                                        <button
                                            type="button"
                                            className="text-white-dark hover:text-dark"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="p-5">
                                        <form onSubmit={handleSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
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
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
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
                                                        value={formData.relationship}
                                                        onChange={handleInputChange}
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
                                                        value={formData.mobile_number}
                                                        onChange={handleInputChange}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={formData.date_of_birth}
                                                        onChange={handleInputChange}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                                    <input
                                                        type="text"
                                                        name="occupation"
                                                        value={formData.occupation}
                                                        onChange={handleInputChange}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                                    <textarea
                                                        name="medical_history"
                                                        value={formData.medical_history}
                                                        onChange={handleInputChange}
                                                        rows={2}
                                                        className="form-textarea"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                                    <textarea
                                                        name="allergies"
                                                        value={formData.allergies}
                                                        onChange={handleInputChange}
                                                        rows={2}
                                                        className="form-textarea"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="is_primary_contact"
                                                            checked={formData.is_primary_contact}
                                                            onChange={handleInputChange}
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
                                                            checked={formData.emergency_contact}
                                                            onChange={handleInputChange}
                                                            className="form-checkbox"
                                                        />
                                                        <span className="ml-2">Emergency Contact</span>
                                                    </label>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={handleInputChange}
                                                        rows={2}
                                                        className="form-textarea"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center mt-8">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setIsModalOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {editingMember ? 'Update' : 'Add'} Family Member
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
        </div>
    );
};

export default PatientFamilyManagement;