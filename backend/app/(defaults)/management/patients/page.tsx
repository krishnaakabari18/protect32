'use client';
import GenericCRUD from '@/components/management/generic-crud';
import { Metadata } from 'next';

const PatientsPage = () => {
    return (
        <GenericCRUD
            title="Patient"
            endpoint="patients"
            columns={[
                { key: 'blood_group', label: 'Blood Group' },
                { key: 'emergency_contact_name', label: 'Emergency Contact' },
                { key: 'emergency_contact_number', label: 'Contact Number' },
                {
                    key: 'created_at',
                    label: 'Created',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { key: 'user_id', label: 'User ID', type: 'number', required: true, placeholder: 'Enter user ID' },
                { 
                    key: 'blood_group', 
                    label: 'Blood Group', 
                    type: 'select', 
                    options: [
                        { value: '', label: 'Select Blood Group' },
                        { value: 'A+', label: 'A+' },
                        { value: 'A-', label: 'A-' },
                        { value: 'B+', label: 'B+' },
                        { value: 'B-', label: 'B-' },
                        { value: 'AB+', label: 'AB+' },
                        { value: 'AB-', label: 'AB-' },
                        { value: 'O+', label: 'O+' },
                        { value: 'O-', label: 'O-' },
                    ]
                },
                { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text', placeholder: 'Enter contact name' },
                { key: 'emergency_contact_number', label: 'Emergency Contact Number', type: 'text', placeholder: 'Enter contact number' },
                { key: 'medical_history', label: 'Medical History', type: 'textarea', colSpan: 2, placeholder: 'Enter medical history' },
                { key: 'allergies', label: 'Allergies', type: 'textarea', colSpan: 2, placeholder: 'Enter allergies' },
                { key: 'current_medications', label: 'Current Medications', type: 'textarea', colSpan: 2, placeholder: 'Enter current medications' },
            ]}
            defaultValues={{
                id: null,
                user_id: '',
                blood_group: '',
                emergency_contact_name: '',
                emergency_contact_number: '',
                medical_history: '',
                allergies: '',
                current_medications: '',
            }}
            searchFields={['emergency_contact_name', 'blood_group', 'emergency_contact_number']}
            filterField={{
                key: 'blood_group',
                label: 'Blood Group',
                options: [
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                ]
            }}
        />
    );
};

export default PatientsPage;
