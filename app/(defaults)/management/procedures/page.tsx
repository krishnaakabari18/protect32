'use client';
import GenericCRUD from '@/components/management/generic-crud';

const PROCEDURE_CATEGORIES = [
    'Diagnostic & Preventive',
    'Restorative',
    'Endodontics',
    'Periodontics',
    'Prosthodontics',
    'Orthodontics',
    'Oral Surgery',
    'Cosmetic',
    'Pediatric',
    'Other'
];

const ProceduresPage = () => {
    return (
        <GenericCRUD
            title="Procedure"
            endpoint="procedures"
            columns={[
                {
                    key: 'name',
                    label: 'Procedure Name',
                },
                {
                    key: 'category',
                    label: 'Category',
                    render: (value) => value || '-'
                },
                {
                    key: 'description',
                    label: 'Description',
                    render: (value) => value ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {value.length > 50 ? value.substring(0, 50) + '...' : value}
                        </span>
                    ) : '-'
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
                    label: 'Procedure Name',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., Root Canal Treatment',
                    colSpan: 2
                },
                {
                    key: 'category',
                    label: 'Category',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Category' },
                        ...PROCEDURE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                    ]
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
                {
                    key: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Enter procedure description',
                    colSpan: 2
                },
            ]}
            defaultValues={{
                id: null,
                name: '',
                category: '',
                description: '',
                is_active: true,
            }}
            searchFields={['name', 'description']}
            filterField={{
                key: 'category',
                label: 'Category',
                options: [
                    { value: '', label: 'All Categories' },
                    ...PROCEDURE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                ]
            }}
        />
    );
};

export default ProceduresPage;
