'use client';
import React, { useState } from 'react';

interface PanelCodeHighlightProps {
    title?: string;
    children: React.ReactNode;
    codeHighlight?: string;
    className?: string;
}

const PanelCodeHighlight = ({ title, children, codeHighlight, className }: PanelCodeHighlightProps) => {
    const [showCode, setShowCode] = useState(false);

    return (
        <div className={`panel ${className || ''}`}>
            <div className="mb-5 flex items-center justify-between">
                {title && <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>}
                {codeHighlight && (
                    <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600"
                    >
                        <span className="flex items-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:mr-2 rtl:ml-2">
                                <path d="M14.5 2.5C14.5 2.5 13.3 8.5 10 11.5C6.7 14.5 2.5 14.5 2.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.5 21.5C9.5 21.5 10.7 15.5 14 12.5C17.3 9.5 21.5 9.5 21.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Code
                        </span>
                    </button>
                )}
            </div>
            {children}
            {showCode && codeHighlight && (
                <div className="mt-5">
                    <pre className="overflow-auto rounded bg-[#f8f8f8] p-4 text-sm dark:bg-[#0e1726]">
                        <code>{codeHighlight}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export default PanelCodeHighlight;
