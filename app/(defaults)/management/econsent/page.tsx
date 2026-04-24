import { Metadata } from 'next';
import EConsentCRUD from '@/components/management/econsent-crud';

export const metadata: Metadata = { title: 'eConsent' };

const EConsentPage = () => <EConsentCRUD />;

export default EConsentPage;
