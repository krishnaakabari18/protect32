'use client';
import GenericCRUD from '@/components/management/generic-crud';

const ProvidersPage = () => {
    return (
        <GenericCRUD
            title="Provider"
            endpoint="providers"
            columns={[
                { key: 'id', label: 'ID' },
                { key: 'user_id', label: 'User ID' },
                { key: 'specialization', label: 'Specialization' },
                { key: 'license_number', label: 'License Number' },
                { key: 'years_of_experience', label: 'Experience (Years)' },
                {
                    key: 'created_at',
                    label: 'Created',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { key: 'user_id', label: 'User ID', type: 'number', required: true, placeholder: 'Enter user ID' },
                { key: 'specialization', label: 'Specialization', type: 'text', required: true, placeholder: 'e.g., Orthodontist, Endodontist' },
                { key: 'license_number', label: 'License Number', type: 'text', required: true, placeholder: 'Enter license number' },
                { key: 'years_of_experience', label: 'Years of Experience', type: 'number', placeholder: 'Enter years' },
                { key: 'education', label: 'Education', type: 'textarea', colSpan: 2, placeholder: 'Enter education details' },
                { key: 'certifications', label: 'Certifications', type: 'textarea', colSpan: 2, placeholder: 'Enter certifications' },
                { key: 'availability_schedule', label: 'Availability Schedule', type: 'textarea', colSpan: 2, placeholder: 'Enter availability schedule' },
            ]}
            defaultValues={{
                id: null,
                user_id: '',
                specialization: '',
                license_number: '',
                years_of_experience: '',
                education: '',
                certifications: '',
                availability_schedule: '',
            }}
            searchFields={['specialization', 'license_number']}
        />
    );
};

export default ProvidersPage;
