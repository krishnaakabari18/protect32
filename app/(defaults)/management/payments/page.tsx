'use client';
import GenericCRUD from '@/components/management/generic-crud';
const formatLabel = (value: string): string => {
    return value
        ?.replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
};
const PaymentsPage = () => {
    return (
        <GenericCRUD
            title="Order"
            endpoint="payments"
            hideDelete={true}
            columns={[
                {
                    key: 'patient_id',
                    label: 'Patient',
                    render: (value, row) => row.patient_first_name && row.patient_last_name
                        ? `${row.patient_first_name} ${row.patient_last_name}`
                        : value || '-'
                },
                {
                    key: 'amount',
                    label: 'Amount (₹)',
                    render: (value) => value ? `₹${parseFloat(value).toFixed(2)}` : '-'
                },
                { key: 'transaction_id', label: 'Transaction ID' },
                { key: 'payment_method', label: 'Method', render: (value) => value ? formatLabel(value) : '-' },
                {
                    key: 'payment_status',
                    label: 'Status',
                    render: (value) => {
                        const colors: any = {
                            Pending: 'bg-warning',
                            Paid: 'bg-success',
                            Failed: 'bg-danger',
                            Refunded: 'bg-info'
                        };
                        return (
                            <span className={`badge ${colors[value] || 'bg-secondary'}`}>
                                {value || '-'}
                            </span>
                        );
                    }
                },
                {
                    key: 'payment_date',
                    label: 'Payment Date & Time',
                    render: (value) => value
                        ? new Date(value).toLocaleString('en-IN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })
                        : '-'
                },
            ]}
            formFields={[
                {
                    key: 'patient_id', label: 'Patient', type: 'api-select', required: true,
                    placeholder: 'Select Patient',
                    apiEndpoint: 'patients', apiValueKey: 'id',
                    apiLabelFormat: (item: any) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || item.id
                },
                {
                    key: 'appointment_id', label: 'Appointment Code', type: 'dependent-api-select',
                    placeholder: 'Select appointment code',
                    dependsOn: 'patient_id',
                    dependentApiEndpoint: (patientId: string) => `dropdowns/patient-appointments?parent_id=${patientId}`,
                    apiValueKey: 'value',
                    apiLabelFormat: (item: any) => item.label || item.appointment_code || item.value,
                },
                { key: 'amount', label: 'Amount (₹)', type: 'number', required: true, placeholder: 'Enter amount' },
                {
                    key: 'payment_method',
                    label: 'Method',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Method' },
                        { value: 'cash', label: 'Cash' },
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'debit_card', label: 'Debit Card' },
                        { value: 'insurance', label: 'Insurance' },
                        { value: 'online', label: 'Online' },
                        { value: 'upi', label: 'UPI' },
                    ]
                },
                {
                    key: 'payment_status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Status' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Paid', label: 'Paid' },
                        { value: 'Failed', label: 'Failed' },
                        { value: 'Refunded', label: 'Refunded' },
                    ]
                },
                { key: 'transaction_id', label: 'Transaction ID', type: 'text', placeholder: 'Enter transaction ID' },
                { key: 'payment_date', label: 'Payment Date & Time', type: 'datetime-local' },
                { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                appointment_id: '',
                amount: '',
                payment_method: '',
                payment_status: 'Pending',
                transaction_id: '',
                payment_date: '',
                notes: '',
            }}
            searchFields={['transaction_id', 'payment_method', 'payment_status']}
            filterField={{
                key: 'payment_status',
                label: 'Status',
                options: [
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Failed', label: 'Failed' },
                    { value: 'Refunded', label: 'Refunded' },
                ]
            }}
        />
    );
};

export default PaymentsPage;
