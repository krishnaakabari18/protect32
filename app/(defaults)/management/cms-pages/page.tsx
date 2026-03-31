import CmsPagesCRUD from '@/components/management/cms-pages-crud';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'CMS Pages' };

const CmsPagesPage = () => <CmsPagesCRUD />;

export default CmsPagesPage;
