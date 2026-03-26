import { Metadata } from 'next';
import React from 'react';
import PatientsCrud from '@/components/management/patients-crud';

export const metadata: Metadata = {
    title: 'Patients Management',
};

const PatientsPage = () => {
    return <PatientsCrud />;
};

export default PatientsPage;