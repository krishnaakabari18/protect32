'use client';
import GenericCRUD from '@/components/management/generic-crud';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

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
            const response = await fetch(`${API_ENDPOINTS.patients}?limit=1000`, {
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
            const response = await fetch(`${API_ENDPOINTS.providers}?limit=1000`, {
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
                        key: 'date_prescribed',
                        label: 'Date Prescribed',
                        render: v => v ? v.split('T')[0] : '-'
                    }
                    // ,
                    // {
                    //     key: 'start_date',
                    //     label: 'Start Date',
                    //     render: v => v ? v.split('T')[0] : '-'
                    // },
                    // {
                    //     key: 'end_date',
                    //     label: 'End Date',
                    //     render: v => v ? v.split('T')[0] : '-'
                    // }
            ]}
            formFields={[
                { 
                    key: 'patient_id', 
                    label: 'Patient', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: '', label: 'Select Patient' },
                        ...patients.map(p => ({
                            value: p.id,
                            label: `${p.first_name} ${p.last_name} (${p.email || p.mobile_number || 'No contact'})`
                        }))
                    ],
                    placeholder: 'Select Patient'
                },
                { 
                    key: 'provider_id', 
                    label: 'Provider', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: '', label: 'Select Provider' },
                        ...providers.map(p => ({
                            value: p.id,
                            label: `${p.first_name} ${p.last_name} (${p.email || p.mobile_number || 'No contact'})`
                        }))
                    ],
                    placeholder: 'Select Provider'
                },
                { key: 'medication_name', label: 'Medication Name', type: 'text', required: true, placeholder: 'Enter medication name' },
                { key: 'dosage', label: 'Dosage', type: 'text', required: true, placeholder: 'e.g., 500mg' },
                { key: 'frequency', label: 'Frequency', type: 'text', required: true, placeholder: 'e.g., Twice daily' },
                { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 7 days' },
                { key: 'date_prescribed', label: 'Date Prescribed', type: 'date', placeholder: 'Defaults to today if not set' },
                { key: 'instructions', label: 'Instructions', type: 'textarea', colSpan: 2, placeholder: 'Special instructions' },
                { key: 'start_date', label: 'Start Date', type: 'date' },
                // { key: 'end_date', label: 'End Date', type: 'date' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                medication_name: '',
                dosage: '',
                frequency: '',
                duration: '',
                date_prescribed: null,
                instructions: '',
                start_date: null,
                end_date: null,
            }}
            searchFields={['medication_name', 'dosage', 'frequency']}
        />
    );
};

export default PrescriptionsCRUD;
