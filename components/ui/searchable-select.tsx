'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useDropdown, DropdownOption } from '@/hooks/useDropdown';

interface SearchableSelectProps {
    // Data — either pass options directly OR a dropdownType to auto-fetch
    options?: DropdownOption[];
    dropdownType?: string;
    parentId?: string;       // for dependent dropdowns

    value: string;
    onChange: (value: string, option?: DropdownOption) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options: propOptions,
    dropdownType,
    parentId,
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    className = '',
    id,
    name,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-fetch if dropdownType provided
    const { options: fetchedOptions, loading, error } = useDropdown({
        type: dropdownType || '',
        parentId,
        enabled: !!dropdownType && !propOptions,
    });

    const options = propOptions || fetchedOptions;
    
    // Log for debugging
    useEffect(() => {
        if (dropdownType && !propOptions) {
            console.log(`[SearchableSelect] ${dropdownType} - Loading: ${loading}, Options: ${options.length}, Error: ${error || 'none'}`);
        }
    }, [dropdownType, loading, options.length, error, propOptions]);
    const selected = options.find(o => o.value === value);

    const filtered = search.trim()
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const handleSelect = (opt: DropdownOption) => {
        onChange(opt.value, opt);
        setOpen(false);
        setSearch('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('', undefined);
        setSearch('');
    };

    if (disabled) {
        return (
            <div className={`form-input bg-gray-100 dark:bg-gray-800 cursor-not-allowed flex items-center min-h-[38px] ${className}`}>
                <span className="text-sm truncate">{selected?.label || <span className="text-gray-400">{placeholder}</span>}</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`relative ${className}`} id={id}>
            {name && <input type="hidden" name={name} value={value} />}

            {/* Trigger button */}
            <button
                type="button"
                className="form-input w-full text-left flex items-center justify-between gap-2 cursor-pointer min-h-[38px]"
                onClick={() => setOpen(o => !o)}
            >
                <span className={`text-sm truncate flex-1 ${!selected ? 'text-gray-400' : ''}`}>
                    {loading ? 'Loading...' : (selected?.label || placeholder)}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {value && (
                        <span className="text-gray-400 hover:text-danger text-base leading-none cursor-pointer px-1"
                            onClick={handleClear}>×</span>
                    )}
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
                </div>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-[200] mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 outline-none focus:border-primary"
                            placeholder="Type to search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {loading ? (
                            <li className="px-3 py-2 text-sm text-gray-400">Loading...</li>
                        ) : error ? (
                            <li className="px-3 py-2 text-sm text-red-500">Error: {error}</li>
                        ) : filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400">
                                {options.length === 0 ? 'No data available' : 'No results found'}
                            </li>
                        ) : filtered.map(opt => (
                            <li
                                key={opt.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors ${opt.value === value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                                onClick={() => handleSelect(opt)}
                            >
                                <div>{opt.label}</div>
                                {opt.meta?.email && (
                                    <div className="text-xs text-gray-400">{opt.meta.email}</div>
                                )}
                                {opt.meta?.category && (
                                    <div className="text-xs text-gray-400">{opt.meta.category}</div>
                                )}
                                {opt.meta?.date && (
                                    <div className="text-xs text-gray-400">{opt.meta.date}{opt.meta.service ? ` · ${opt.meta.service}` : ''}{opt.meta.status ? ` · ${opt.meta.status}` : ''}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
