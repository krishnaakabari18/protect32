'use client';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

interface Provider {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    specialization?: string;
}

interface ProviderDropdownProps {
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

const ProviderDropdown: React.FC<ProviderDropdownProps> = ({
    id = 'provider_id',
    name = 'provider_id',
    value,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    className = '',
    placeholder = 'Select Provider',
    showEmail = true,
    error,
    touched,
}) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            console.log('Fetching providers from:', API_ENDPOINTS.providers);
            
            const response = await fetch(`${API_ENDPOINTS.providers}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            
            const data = await response.json();
            console.log('Providers API response:', data);
            
            if (response.ok) {
                const providersList = data.data || [];
                console.log('Providers loaded:', providersList.length);
                setProviders(providersList);
            } else {
                console.error('Failed to fetch providers:', data);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
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
                {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                        Dr. {provider.first_name} {provider.last_name}
                        {showEmail && provider.email ? ` (${provider.email})` : ''}
                    </option>
                ))}
            </select>
            {touched && error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};

export default ProviderDropdown;
