'use client';
import GenericCRUD from '@/components/management/generic-crud';

const PrescriptionsPage = () => {
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
                { key: 'patient_id', label: 'Patient ID', type: 'number', required: true, placeholder: 'Enter patient ID' },
                { key: 'provider_id', label: 'Provider ID', type: 'number', required: true, placeholder: 'Enter provider ID' },
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

export default PrescriptionsPage;
