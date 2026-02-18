'use client';
import GenericCRUD from '@/components/management/generic-crud';

const TreatmentPlansPage = () => {
    return (
        <GenericCRUD
            title="Treatment Plan"
            endpoint="treatment-plans"
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
                { key: 'diagnosis', label: 'Diagnosis' },
                {
                    key: 'estimated_cost',
                    label: 'Estimated Cost',
                    render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
                },
                {
                    key: 'status',
                    label: 'Status',
                    render: (value) => {
                        const colors: any = {
                            planned: 'bg-info',
                            in_progress: 'bg-primary',
                            completed: 'bg-success',
                            cancelled: 'bg-danger'
                        };
                        return (
                            <span className={`badge ${colors[value] || 'bg-secondary'}`}>
                                {value?.replace('_', ' ').toUpperCase()}
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
                { key: 'patient_id', label: 'Patient ID', type: 'number', required: true, placeholder: 'Enter patient ID' },
                { key: 'provider_id', label: 'Provider ID', type: 'number', required: true, placeholder: 'Enter provider ID' },
                { key: 'diagnosis', label: 'Diagnosis', type: 'text', required: true, placeholder: 'Enter diagnosis' },
                { key: 'treatment_description', label: 'Treatment Description', type: 'textarea', colSpan: 2, placeholder: 'Describe the treatment plan' },
                { key: 'estimated_cost', label: 'Estimated Cost', type: 'number', placeholder: 'Enter cost' },
                { key: 'start_date', label: 'Start Date', type: 'date' },
                { key: 'end_date', label: 'End Date', type: 'date' },
                { 
                    key: 'status', 
                    label: 'Status', 
                    type: 'select',
                    options: [
                        { value: '', label: 'Select Status' },
                        { value: 'planned', label: 'Planned' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
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
                status: 'planned',
                notes: '',
            }}
            searchFields={['diagnosis', 'status']}
            filterField={{
                key: 'status',
                label: 'Status',
                options: [
                    { value: 'planned', label: 'Planned' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                ]
            }}
        />
    );
};

export default TreatmentPlansPage;
