import FaqsCRUD from '@/components/management/faqs-crud';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQs' };

const FaqsPage = () => <FaqsCRUD />;

export default FaqsPage;
