import { Metadata } from 'next';
import InquiriesCRUD from '@/components/management/inquiries-crud';

export const metadata: Metadata = { title: 'Inquiries' };

const InquiriesPage = () => <InquiriesCRUD />;

export default InquiriesPage;
