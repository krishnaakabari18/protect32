import { Metadata } from 'next';
import PrescriptionsCRUDWithAI from '@/components/management/prescriptions-crud-with-ai';

export const metadata: Metadata = { title: 'Prescriptions' };

const PrescriptionsPage = () => <PrescriptionsCRUDWithAI />;

export default PrescriptionsPage;
