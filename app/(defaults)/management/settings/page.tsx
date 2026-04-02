import { Metadata } from 'next';
import React from 'react';
import SettingsCRUD from '@/components/management/settings-crud';

export const metadata: Metadata = {
    title: 'Settings',
};

const SettingsPage = () => {
    return <SettingsCRUD />;
};

export default SettingsPage;
