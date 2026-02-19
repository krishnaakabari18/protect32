'use client';
import GenericCRUD from '@/components/management/generic-crud';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const PrescriptionsCRUD = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);

    useEffect(() => {
        fetchPatients();
        fetchProviders();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/users?user_type=patient&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setPatients(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/users?user_type=provider&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setProviders(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    return (
        <GenericCRUD
            title="Prescription"
            endpoint="prescriptions"
            columns={[
                { key: 'id', label: 'ID' },
                { 
                    key: 'patient_id', 
                    label: 'Patient Name',
                    render: (value, row) => row.patient_first_name && row.patient_last_name 
                        ? `${row.patient_first_name} ${row.patient_last_name}`
                        : value || '-'
                },
                { 
                    key: 'provider_id', 
                    label: 'Provider Name',
                    render: (value, row) => row.provider_first_name && row.provider_last_name 
                        ? `${row.provider_first_name} ${row.provider_last_name}`
                        : value || '-'
                },
                { key: 'medication_name', label: 'Medication' },
                { key: 'dosage', label: 'Dosage' },
                { key: 'frequency', label: 'Frequency' },
                {
                    key: 'start_date',
                    label: 'Start Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
                {
                    key: 'end_date',
                    label: 'End Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { 
                    key: 'patient_id', 
                    label: 'Patient', 
                    type: 'select', 
                    required: true,
                    options: patients.map(p => ({
                        value: p.id,
                        label: `${p.first_name} ${p.last_name} (${p.email})`
                    })),
                    placeholder: 'Select Patient'
                },
                { 
                    key: 'provider_id', 
                    label: 'Provider', 
                    type: 'select', 
                    required: true,
                    options: providers.map(p => ({
                        value: p.id,
                        label: `${p.first_name} ${p.last_name} (${p.email})`
                    })),
                    placeholder: 'Select Provider'
                },
                { key: 'medication_name', label: 'Medication Name', type: 'text', required: true, placeholder: 'Enter medication name' },
                { key: 'dosage', label: 'Dosage', type: 'text', required: true, placeholder: 'e.g., 500mg' },
                { key: 'frequency', label: 'Frequency', type: 'text', required: true, placeholder: 'e.g., Twice daily' },
                { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 7 days' },
                { key: 'instructions', label: 'Instructions', type: 'textarea', colSpan: 2, placeholder: 'Special instructions' },
                { key: 'start_date', label: 'Start Date', type: 'date' },
                { key: 'end_date', label: 'End Date', type: 'date' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                medication_name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                start_date: '',
                end_date: '',
            }}
            searchFields={['medication_name', 'dosage', 'frequency']}
        />
    );
};

export default PrescriptionsCRUD;
