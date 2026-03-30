import UsersCrud from '@/components/management/users-crud';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Users Management',
};

const Contacts = () => {
    return <UsersCrud />;
};

export default Contacts;
