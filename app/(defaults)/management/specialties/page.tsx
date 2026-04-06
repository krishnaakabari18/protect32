'use client';
import GenericCRUD from '@/components/management/generic-crud';

const SpecialtiesPage = () => {
    return (
        <GenericCRUD
            title="Specialty"
            endpoint="specialties"
            columns={[
                {
                    key: 'name',
                    label: 'Specialty Name',
                },
                {
                    key: 'description',
                    label: 'Description',
                    render: (value) => value || '-'
                },
                {
                    key: 'is_active',
                    label: 'Status',
                    render: (value) => (
                        <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                            {value ? 'Active' : 'Inactive'}
                        </span>
                    )
                },
            ]}
            formFields={[
                {
                    key: 'name',
                    label: 'Specialty Name',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., Endodontist, Orthodontist',
                    colSpan: 2
                },
                {
                    key: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Enter specialty description',
                    colSpan: 2
                },
                {
                    key: 'is_active',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                    ]
                },
            ]}
            defaultValues={{
                id: null,
                name: '',
                description: '',
                is_active: true,
            }}
            searchFields={['name', 'description']}
            filterField={{
                key: 'is_active',
                label: 'Status',
                options: [
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                ]
            }}
        />
    );
};

export default SpecialtiesPage;
