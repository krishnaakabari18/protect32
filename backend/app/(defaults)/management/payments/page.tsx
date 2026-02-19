'use client';
import GenericCRUD from '@/components/management/generic-crud';

const PaymentsPage = () => {
    return (
        <GenericCRUD
            title="Payment"
            endpoint="payments"
            columns={[
                { 
                    key: 'patient_id', 
                    label: 'Patient Name',
                    render: (value, row) => row.patient_first_name && row.patient_last_name 
                        ? `${row.patient_first_name} ${row.patient_last_name}`
                        : value || '-'
                },
                { key: 'appointment_id', label: 'Appointment ID' },
                {
                    key: 'amount',
                    label: 'Amount',
                    render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
                },
                { key: 'payment_method', label: 'Method' },
                {
                    key: 'payment_status',
                    label: 'Status',
                    render: (value) => {
                        const colors: any = {
                            pending: 'bg-warning',
                            completed: 'bg-success',
                            failed: 'bg-danger',
                            refunded: 'bg-info'
                        };
                        return (
                            <span className={`badge ${colors[value] || 'bg-secondary'}`}>
                                {value?.toUpperCase()}
                            </span>
                        );
                    }
                },
                {
                    key: 'payment_date',
                    label: 'Payment Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
            ]}
            formFields={[
                { key: 'patient_id', label: 'Patient ID', type: 'number', required: true, placeholder: 'Enter patient ID' },
                { key: 'appointment_id', label: 'Appointment ID', type: 'number', placeholder: 'Enter appointment ID' },
                { key: 'amount', label: 'Amount', type: 'number', required: true, placeholder: 'Enter amount' },
                { 
                    key: 'payment_method', 
                    label: 'Payment Method', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Method' },
                        { value: 'cash', label: 'Cash' },
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'debit_card', label: 'Debit Card' },
                        { value: 'insurance', label: 'Insurance' },
                        { value: 'online', label: 'Online' },
                    ]
                },
                { 
                    key: 'payment_status', 
                    label: 'Payment Status', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Status' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'failed', label: 'Failed' },
                        { value: 'refunded', label: 'Refunded' },
                    ]
                },
                { key: 'transaction_id', label: 'Transaction ID', type: 'text', placeholder: 'Enter transaction ID' },
                { key: 'payment_date', label: 'Payment Date', type: 'date' },
                { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                appointment_id: '',
                amount: '',
                payment_method: '',
                payment_status: 'pending',
                transaction_id: '',
                payment_date: '',
                notes: '',
            }}
            searchFields={['transaction_id', 'payment_method', 'payment_status']}
            filterField={{
                key: 'payment_status',
                label: 'Payment Status',
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'refunded', label: 'Refunded' },
                ]
            }}
        />
    );
};

export default PaymentsPage;
