'use client';
import GenericCRUD from '@/components/management/generic-crud';

const PrescriptionsCRUD = () => {
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
                },
            ]}
            formFields={[
                {
                    key: 'patient_id',
                    label: 'Patient',
                    type: 'api-select',
                    required: true,
                    placeholder: 'Select Patient',
                    apiEndpoint: 'patients',
                    apiValueKey: 'id',
                },
                {
                    key: 'provider_id',
                    label: 'Provider',
                    type: 'api-select',
                    required: true,
                    placeholder: 'Select Provider',
                    apiEndpoint: 'providers',
                    apiValueKey: 'id',
                },
                { key: 'medication_name', label: 'Medication Name', type: 'text', required: true, placeholder: 'Enter medication name' },
                { key: 'dosage', label: 'Dosage', type: 'text', required: true, placeholder: 'e.g., 500mg' },
                { key: 'frequency', label: 'Frequency', type: 'text', required: true, placeholder: 'e.g., Twice daily' },
                { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 7 days' },
                { key: 'date_prescribed', label: 'Date Prescribed', type: 'date', placeholder: 'Defaults to today if not set' },
                { key: 'instructions', label: 'Instructions', type: 'textarea', colSpan: 2, placeholder: 'Special instructions' },
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
