'use client';
import React from 'react';
import Dropdown from '@/components/dropdown';

interface LanguageDropdownProps {
    className?: string;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className = '' }) => {
    const [currentLang, setCurrentLang] = React.useState('en');

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'da', name: 'Danish' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'sv', name: 'Swedish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'zh', name: 'Chinese' },
    ];

    return (
        <div className={className}>
            <Dropdown
                offset={[0, 8]}
                placement="bottom-end"
                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={<img className="h-5 w-5 rounded-full object-cover" src={`/assets/images/flags/${currentLang.toUpperCase()}.svg`} alt="flag" />}
            >
                <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                    {languages.map((item) => (
                        <li key={item.code}>
                            <button
                                type="button"
                                className={`flex w-full hover:text-primary rounded p-2 ${currentLang === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                onClick={() => setCurrentLang(item.code)}
                            >
                                <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </Dropdown>
        </div>
    );
};

export default LanguageDropdown;
