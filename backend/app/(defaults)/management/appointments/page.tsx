'use client';
import GenericCRUD from '@/components/management/generic-crud';

const AppointmentsPage = () => {
    return (
        <GenericCRUD
            title="Appointment"
            endpoint="appointments"
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
                    key: 'appointment_date',
                    label: 'Date',
                    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
                },
                { key: 'appointment_time', label: 'Time' },
                { key: 'appointment_type', label: 'Type' },
                {
                    key: 'status',
                    label: 'Status',
                    render: (value) => {
                        const colors: any = {
                            scheduled: 'bg-info',
                            confirmed: 'bg-primary',
                            completed: 'bg-success',
                            cancelled: 'bg-danger',
                            no_show: 'bg-warning'
                        };
                        return (
                            <span className={`badge ${colors[value] || 'bg-secondary'}`}>
                                {value?.replace('_', ' ').toUpperCase()}
                            </span>
                        );
                    }
                },
            ]}
            formFields={[
                { key: 'patient_id', label: 'Patient ID', type: 'number', required: true, placeholder: 'Enter patient ID' },
                { key: 'provider_id', label: 'Provider ID', type: 'number', required: true, placeholder: 'Enter provider ID' },
                { key: 'appointment_date', label: 'Appointment Date', type: 'date', required: true },
                { key: 'appointment_time', label: 'Appointment Time', type: 'text', required: true, placeholder: 'HH:MM:SS' },
                { key: 'duration_minutes', label: 'Duration (Minutes)', type: 'number', placeholder: 'e.g., 30' },
                { 
                    key: 'appointment_type', 
                    label: 'Appointment Type', 
                    type: 'select',
                    options: [
                        { value: '', label: 'Select Type' },
                        { value: 'consultation', label: 'Consultation' },
                        { value: 'checkup', label: 'Checkup' },
                        { value: 'treatment', label: 'Treatment' },
                        { value: 'follow_up', label: 'Follow Up' },
                        { value: 'emergency', label: 'Emergency' },
                    ]
                },
                { 
                    key: 'status', 
                    label: 'Status', 
                    type: 'select',
                    options: [
                        { value: '', label: 'Select Status' },
                        { value: 'scheduled', label: 'Scheduled' },
                        { value: 'confirmed', label: 'Confirmed' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
                        { value: 'no_show', label: 'No Show' },
                    ]
                },
                { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Enter notes' },
                { key: 'cancellation_reason', label: 'Cancellation Reason', type: 'textarea', colSpan: 2, placeholder: 'Enter reason if cancelled' },
            ]}
            defaultValues={{
                id: null,
                patient_id: '',
                provider_id: '',
                appointment_date: '',
                appointment_time: '',
                duration_minutes: 30,
                appointment_type: '',
                status: 'scheduled',
                notes: '',
                cancellation_reason: '',
            }}
            searchFields={['appointment_type', 'status']}
            filterField={{
                key: 'status',
                label: 'Status',
                options: [
                    { value: 'scheduled', label: 'Scheduled' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'no_show', label: 'No Show' },
                ]
            }}
        />
    );
};

export default AppointmentsPage;
