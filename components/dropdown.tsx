import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

interface DropdownProps {
    button?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    btnClassName?: string;
    offset?: [number, number];
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'right-start';
}

const Dropdown: React.FC<DropdownProps> = ({
    button,
    children,
    className,
    btnClassName,
    placement = 'bottom-start',
}) => {
    const placementClass: Record<string, string> = {
        'bottom-start': 'left-0 top-full',
        'bottom-end': 'right-0 top-full',
        'top-start': 'left-0 bottom-full',
        'top-end': 'right-0 bottom-full',
        'left-start': 'right-full top-0',
        'right-start': 'left-full top-0',
    };

    return (
        <Menu as="div" className={`relative inline-flex ${className || ''}`}>
            {({ open }) => (
                <>
                    <MenuButton as={Fragment}>
                        <button type="button" className={btnClassName || ''}>
                            {button}
                        </button>
                    </MenuButton>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems
                            className={`absolute z-50 min-w-[10rem] rounded bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,.1),0_2px_4px_-1px_rgba(0,0,0,.06)] dark:bg-[#1b2e4b] ${placementClass[placement] || placementClass['bottom-start']}`}
                        >
                            {children}
                        </MenuItems>
                    </Transition>
                </>
            )}
        </Menu>
    );
};

export default Dropdown;
