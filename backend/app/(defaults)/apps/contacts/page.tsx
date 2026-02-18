import ComponentsAppsContactsUsers from '@/components/apps/contacts/components-apps-contacts-users';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Users Management',
};

const Contacts = () => {
    return <ComponentsAppsContactsUsers />;
};

export default Contacts;
