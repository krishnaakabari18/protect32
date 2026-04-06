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
                    render: (value, row) => {
                        const name = row.provider_full_name || value || '-';
                        const email = row.provider_email;
                        return (
                            <div>
                                <div className="font-semibold">{name}</div>
                                {email && <div className="text-xs text-gray-400">{email}</div>}
                            </div>
                        );
                    }
                },
                {
                    key: 'diagnosis',
                    label: 'Diagnosis',
                    render: (value, row) => (row.diagnosis_names || value)
                        ? <span className="text-sm">{row.diagnosis_names || value}</span>
                        : '-'
                },
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

                    apiLabelFormat: (item: any) => {
                        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.full_name || '';
                        const email = item.user_email || item.email || '';
                        return name ? `${name}${email ? ` (${email})` : ''}` : email || item.id;
                    }
                },
                {
                    key: 'diagnosis',
                    label: 'Diagnosis (Procedures)',
                    type: 'multi-checkbox-select',
                    required: true,
                    placeholder: 'Select Procedures',
                    colSpan: 2,
                    dependsOn: 'provider_id',
                    dependentApiEndpoint: (providerId: string) => `providers/${providerId}/procedures`,
                    apiValueKey: 'id',
                    apiLabelFormat: (item: any) => item.category ? `${item.name} (${item.category})` : item.name,
                },
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
                diagnosis: [],
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
