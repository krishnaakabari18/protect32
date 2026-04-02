import ComponentsDashboardDental from '@/components/dashboard/components-dashboard-dental';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Dashboard - Protect32',
};

const Dashboard = () => {
    return <ComponentsDashboardDental />;
};

export default Dashboard;
