'use client';
import GenericCRUD from '@/components/management/generic-crud';

const TreatmentPlansPage = () => {
    return (
        <GenericCRUD
            title="Treatment Plan"
            endpoint="treatment-plans"
            columns={[
                {
                    key: 'patient_id',
                    label: 'Patient',
                    render: (value, row) => row.patient_first_name && row.patient_last_name
                        ? `${row.patient_first_name} ${row.patient_last_name}`
                        : value || '-'
                },
                {
                    key: 'provider_id',
                    label: 'Provider',
                    render: (value, row) => row.provider_first_name && row.provider_last_name
                        ? `${row.provider_first_name} ${row.provider_last_name}`
                        : value || '-'
                },
                { key: 'diagnosis', label: 'Diagnosis' },
                {
                    key: 'estimated_cost',
                    label: 'Estimated Cost (₹)',
                    render: (value) => value ? `₹${parseFloat(value).toFixed(2)}` : '-'
                },
                {
                    key: 'status',
                    label: 'Status',
                    render: (value) => {
                        const colors: any = {
                            Proposed: 'bg-info',
                            Consented: 'bg-primary',
                            Paid: 'bg-success',
                            Rejected: 'bg-danger'
                        };
                        return (
                            <span className={`badge ${colors[value] || 'bg-secondary'}`}>
                                {value || '-'}
                            </span>
                        );
                    }
                },
                {
                    key: 'start_date',
                    label: 'Start Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                {
                    key: 'patient_id', label: 'Patient', type: 'api-select', required: true, placeholder: 'Select Patient',
                    apiEndpoint: 'patients', apiValueKey: 'id',
                    apiLabelFormat: (item: any) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || item.id
                },
                {
                    key: 'provider_id', label: 'Provider', type: 'api-select', required: true, placeholder: 'Select Provider',
                    apiEndpoint: 'providers', apiValueKey: 'id',
                    apiLabelFormat: (item: any) => item.full_name || item.clinic_name || item.id
                },
                { key: 'diagnosis', label: 'Diagnosis', type: 'text', required: true, placeholder: 'Enter diagnosis' },
                { key: 'treatment_description', label: 'Treatment Description', type: 'textarea', colSpan: 2, placeholder: 'Describe the treatment plan' },
                { key: 'estimated_cost', label: 'Estimated Cost (₹)', type: 'number', placeholder: 'Enter cost' },
                { key: 'start_date', label: 'Start Date', type: 'date' },
                { key: 'end_date', label: 'End Date', type: 'date' },
                {
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: '', label: 'Select Status' },
                        { value: 'Proposed', label: 'Proposed' },
                        { value: 'Consented', label: 'Consented' },
                        { value: 'Paid', label: 'Paid' },
                        { value: 'Rejected', label: 'Rejected' },
                    ]
                },
                { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                diagnosis: '',
                treatment_description: '',
                estimated_cost: '',
                start_date: '',
                end_date: '',
                status: 'Proposed',
                notes: '',
            }}
            searchFields={['diagnosis', 'status']}
            filterField={{
                key: 'status',
                label: 'Status',
                options: [
                    { value: 'Proposed', label: 'Proposed' },
                    { value: 'Consented', label: 'Consented' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Rejected', label: 'Rejected' },
                ]
            }}
        />
    );
};

export default TreatmentPlansPage;
