import UsersCrud from '@/components/management/users-crud';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Users Management',
};

const UsersPage = () => {
    return <UsersCrud />;
};

export default UsersPage;
