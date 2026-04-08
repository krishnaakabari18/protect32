'use client';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number?: string;
}

interface PatientDropdownProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    showEmail?: boolean;
    error?: string;
    touched?: boolean;
}

const PatientDropdown: React.FC<PatientDropdownProps> = ({
    id = 'patient_id',
    name = 'patient_id',
    value,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    className = '',
    placeholder = 'Select Patient',
    showEmail = true,
    error,
    touched,
}) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            console.log('Fetching patients from:', API_ENDPOINTS.patients);
            
            const response = await fetch(`${API_ENDPOINTS.patients}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            
            const data = await response.json();
            console.log('Patients API response:', data);
            
            if (response.ok) {
                const patientsList = data.data || [];
                console.log('Patients loaded:', patientsList.length);
                setPatients(patientsList);
            } else {
                console.error('Failed to fetch patients:', data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <select
                id={id}
                name={name}
                className={`form-select ${touched && error ? 'border-red-500' : ''} ${className}`}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled || loading}
                required={required}
            >
                <option value="">{loading ? 'Loading...' : placeholder}</option>
                {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                        {showEmail && patient.email ? ` (${patient.email})` : ''}
                    </option>
                ))}
            </select>
            {touched && error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};

export default PatientDropdown;
