'use client';
import GenericCRUD from '@/components/management/generic-crud';

const ReviewsPage = () => {
    return (
        <GenericCRUD
            title="Review"
            endpoint="reviews"
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
                {
                    key: 'rating',
                    label: 'Rating',
                    render: (value) => {
                        const stars = '⭐'.repeat(value || 0);
                        return <span>{stars} ({value}/5)</span>;
                    }
                },
                { 
                    key: 'review_text', 
                    label: 'Review',
                    render: (value) => {
                        if (!value) return '-';
                        return value.length > 50 ? value.substring(0, 50) + '...' : value;
                    }
                },
                {
                    key: 'review_date',
                    label: 'Review Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { key: 'patient_id', label: 'Patient ID', type: 'number', required: true, placeholder: 'Enter patient ID' },
                { key: 'provider_id', label: 'Provider ID', type: 'number', required: true, placeholder: 'Enter provider ID' },
                { 
                    key: 'rating', 
                    label: 'Rating (1-5)', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Rating' },
                        { value: '1', label: '1 - Poor' },
                        { value: '2', label: '2 - Fair' },
                        { value: '3', label: '3 - Good' },
                        { value: '4', label: '4 - Very Good' },
                        { value: '5', label: '5 - Excellent' },
                    ]
                },
                { key: 'review_text', label: 'Review Text', type: 'textarea', colSpan: 2, placeholder: 'Write your review' },
                { key: 'review_date', label: 'Review Date', type: 'date' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                rating: '',
                review_text: '',
                review_date: '',
            }}
            searchFields={['review_text']}
            filterField={{
                key: 'rating',
                label: 'Rating',
                options: [
                    { value: '5', label: '5 Stars' },
                    { value: '4', label: '4 Stars' },
                    { value: '3', label: '3 Stars' },
                    { value: '2', label: '2 Stars' },
                    { value: '1', label: '1 Star' },
                ]
            }}
        />
    );
};

export default ReviewsPage;
