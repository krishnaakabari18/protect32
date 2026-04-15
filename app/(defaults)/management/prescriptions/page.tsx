import { Metadata } from 'next';
import PrescriptionsCRUD from '@/components/management/prescriptions-crud';

export const metadata: Metadata = { title: 'Prescriptions' };

const PrescriptionsPage = () => <PrescriptionsCRUD />;

export default PrescriptionsPage;
