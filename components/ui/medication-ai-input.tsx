'use client';
import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

interface MedicationSuggestion {
    name: string;
    genericName?: string;
    commonDosages?: string[];
    commonUses?: string;
    frequency?: string;
}

interface MedicationAIInputProps {
    value: string;
    onChange: (value: string, suggestion?: MedicationSuggestion) => void;
    onSelectDosage?: (dosage: string) => void;
    onSelectFrequency?: (frequency: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    id?: string;
    name?: string;
}

const MedicationAIInput: React.FC<MedicationAIInputProps> = ({
    value,
    onChange,
    onSelectDosage,
    onSelectFrequency,
    disabled = false,
    placeholder = 'Type medication name...',
    className = '',
    id = 'medication_name',
    name = 'medication_name',
}) => {
    const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Close suggestions when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_ENDPOINTS.medicationAI}/suggestions?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuggestions(data.data || []);
                setShowSuggestions(true);
            } else {
                setError(data.error || 'Failed to fetch suggestions');
                setSuggestions([]);
            }
        } catch (err: any) {
            console.error('Error fetching medication suggestions:', err);
            setError('Network error. Please try again.');
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce API call
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 500);
    };

    const handleSelectSuggestion = (suggestion: MedicationSuggestion) => {
        onChange(suggestion.name, suggestion);
        setShowSuggestions(false);

        // Auto-fill dosage and frequency if callbacks provided
        if (onSelectDosage && suggestion.commonDosages && suggestion.commonDosages.length > 0) {
            onSelectDosage(suggestion.commonDosages[0]);
        }
        if (onSelectFrequency && suggestion.frequency) {
            onSelectFrequency(suggestion.frequency);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                type="text"
                id={id}
                name={name}
                className="form-input w-full"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                autoComplete="off"
            />

            {/* Loading indicator */}
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && !loading && (suggestions.length > 0 || error) && (
                <div className="absolute z-[200] mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {error ? (
                        <div className="p-3 text-sm text-red-500">{error}</div>
                    ) : (
                        <ul className="py-1">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="px-3 py-2 hover:bg-primary/10 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                    <div className="font-medium text-sm">{suggestion.name}</div>
                                    {suggestion.genericName && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Generic: {suggestion.genericName}
                                        </div>
                                    )}
                                    {suggestion.commonDosages && suggestion.commonDosages.length > 0 && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <span className="font-medium">Dosages:</span> {suggestion.commonDosages.join(', ')}
                                        </div>
                                    )}
                                    {suggestion.frequency && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Frequency:</span> {suggestion.frequency}
                                        </div>
                                    )}
                                    {suggestion.commonUses && (
                                        <div className="text-xs text-gray-500 mt-1 italic">
                                            {suggestion.commonUses}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        Powered by Google AI (Gemini)
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicationAIInput;
