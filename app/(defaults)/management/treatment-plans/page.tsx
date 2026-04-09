import { Metadata } from 'next';
import TreatmentPlansCRUD from '@/components/management/treatment-plans-crud';

export const metadata: Metadata = { title: 'Treatment Plans' };

const TreatmentPlansPage = () => <TreatmentPlansCRUD />;

export default TreatmentPlansPage;
