import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

export interface DropdownOption {
    value: string;
    label: string;
    meta?: Record<string, any>;
}

interface UseDropdownOptions {
    type: string;
    parentId?: string;       // for dependent dropdowns (e.g. cities needs state id)
    search?: string;
    enabled?: boolean;       // set false to skip fetching
    staticOptions?: DropdownOption[]; // use static data instead of API
}

interface UseDropdownReturn {
    options: DropdownOption[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

// Static dropdown types that don't need an API call
const STATIC_TYPES: Record<string, DropdownOption[]> = {
    'appointment-status': [
        { value: 'Upcoming', label: 'Upcoming' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
    ],
    'treatment-plan-status': [
        { value: 'Proposed', label: 'Proposed' },
        { value: 'Consented', label: 'Consented' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Rejected', label: 'Rejected' },
    ],
    'payment-status': [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Refunded', label: 'Refunded' },
    ],
    'user-types': [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'support', label: 'Support' },
        { value: 'account', label: 'Account' },
        { value: 'provider', label: 'Provider' },
        { value: 'patient', label: 'Patient' },
    ],
    'availability': [
        { value: 'On Call', label: 'On Call' },
        { value: 'Regular', label: 'Regular' },
        { value: 'Not Available', label: 'Not Available' },
    ],
    'rating': [
        { value: '5', label: '5 Stars' },
        { value: '4', label: '4 Stars' },
        { value: '3', label: '3 Stars' },
        { value: '2', label: '2 Stars' },
        { value: '1', label: '1 Star' },
    ],
};

export function useDropdown({
    type,
    parentId,
    search,
    enabled = true,
    staticOptions,
}: UseDropdownOptions): UseDropdownReturn {
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        // Use provided static options
        if (staticOptions) { setOptions(staticOptions); return; }

        // Use built-in static config
        if (STATIC_TYPES[type]) { setOptions(STATIC_TYPES[type]); return; }

        if (!enabled) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const params = new URLSearchParams();
            if (parentId) params.set('parent_id', parentId);
            if (search) params.set('search', search);
            const url = `${API_ENDPOINTS.dropdowns}/${type}${params.toString() ? '?' + params.toString() : ''}`;
            
            console.log(`[useDropdown] Fetching ${type} from:`, url);
            
            const res = await window.fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            const data = await res.json();
            
            console.log(`[useDropdown] ${type} response:`, data);
            console.log(`[useDropdown] ${type} count:`, data.data?.length || 0);
            
            if (res.ok) {
                setOptions(data.data || []);
            } else {
                console.error(`[useDropdown] ${type} error:`, data.error);
                setError(data.error || 'Failed to load options');
            }
        } catch (e: any) {
            console.error(`[useDropdown] ${type} exception:`, e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [type, parentId, search, enabled]);

    useEffect(() => { fetch(); }, [fetch]);

    return { options, loading, error, refetch: fetch };
}

// Convenience: get options synchronously for static types
export function getStaticOptions(type: string): DropdownOption[] {
    return STATIC_TYPES[type] || [];
}

export { STATIC_TYPES };
