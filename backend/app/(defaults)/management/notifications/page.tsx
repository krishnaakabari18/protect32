'use client';
import GenericCRUD from '@/components/management/generic-crud';

const NotificationsPage = () => {
    return (
        <GenericCRUD
            title="Notification"
            endpoint="notifications"
            columns={[
                { key: 'notification_type', label: 'Type' },
                { key: 'title', label: 'Title' },
                { 
                    key: 'message', 
                    label: 'Message',
                    render: (value) => {
                        if (!value) return '-';
                        return value.length > 50 ? value.substring(0, 50) + '...' : value;
                    }
                },
                {
                    key: 'is_read',
                    label: 'Status',
                    render: (value) => (
                        <span className={`badge ${value ? 'bg-success' : 'bg-warning'}`}>
                            {value ? 'READ' : 'UNREAD'}
                        </span>
                    )
                },
            ]}
            formFields={[
                { key: 'user_id', label: 'User ID', type: 'number', required: true, placeholder: 'Enter user ID' },
                { 
                    key: 'notification_type', 
                    label: 'Notification Type', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: '', label: 'Select Type' },
                        { value: 'appointment', label: 'Appointment' },
                        { value: 'payment', label: 'Payment' },
                        { value: 'reminder', label: 'Reminder' },
                        { value: 'system', label: 'System' },
                        { value: 'alert', label: 'Alert' },
                    ]
                },
                { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter notification title' },
                { key: 'message', label: 'Message', type: 'textarea', colSpan: 2, required: true, placeholder: 'Enter notification message' },
                { key: 'is_read', label: 'Mark as Read', type: 'checkbox', placeholder: 'Check if read' },
                { key: 'sent_at', label: 'Sent At', type: 'datetime-local' },
            ]}
            defaultValues={{
                id: null,
                user_id: '',
                notification_type: '',
                title: '',
                message: '',
                is_read: false,
                sent_at: '',
            }}
            searchFields={['title', 'message', 'notification_type']}
        />
    );
};

export default NotificationsPage;
