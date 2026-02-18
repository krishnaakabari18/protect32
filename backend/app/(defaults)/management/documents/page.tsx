'use client';
import GenericCRUD from '@/components/management/generic-crud';

const DocumentsPage = () => {
    return (
        <GenericCRUD
            title="Document"
            endpoint="documents"
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
                { key: 'document_type', label: 'Type' },
                { key: 'document_name', label: 'Document Name' },
                {
                    key: 'upload_date',
                    label: 'Upload Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { key: 'patient_id', label: 'Patient ID', type: 'number', placeholder: 'Enter patient ID' },
                { key: 'provider_id', label: 'Provider ID', type: 'number', placeholder: 'Enter provider ID' },
                { 
                    key: 'document_type', 
                    label: 'Document Type', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Type' },
                        { value: 'medical_record', label: 'Medical Record' },
                        { value: 'xray', label: 'X-Ray' },
                        { value: 'lab_report', label: 'Lab Report' },
                        { value: 'prescription', label: 'Prescription' },
                        { value: 'consent_form', label: 'Consent Form' },
                        { value: 'insurance', label: 'Insurance' },
                        { value: 'other', label: 'Other' },
                    ]
                },
                { key: 'document_name', label: 'Document Name', type: 'text', required: true, placeholder: 'Enter document name' },
                { key: 'file_path', label: 'File Path', type: 'text', placeholder: 'Enter file path or URL' },
                { key: 'upload_date', label: 'Upload Date', type: 'date' },
                { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                document_type: '',
                document_name: '',
                file_path: '',
                upload_date: '',
                notes: '',
            }}
            searchFields={['document_name', 'document_type']}
            filterField={{
                key: 'document_type',
                label: 'Document Type',
                options: [
                    { value: 'medical_record', label: 'Medical Record' },
                    { value: 'xray', label: 'X-Ray' },
                    { value: 'lab_report', label: 'Lab Report' },
                    { value: 'prescription', label: 'Prescription' },
                    { value: 'consent_form', label: 'Consent Form' },
                    { value: 'insurance', label: 'Insurance' },
                    { value: 'other', label: 'Other' },
                ]
            }}
        />
    );
};

export default DocumentsPage;
