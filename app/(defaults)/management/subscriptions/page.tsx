import { Metadata } from 'next';
import SubscriptionsCRUD from '@/components/management/subscriptions-crud';

export const metadata: Metadata = { title: 'Subscriptions' };

const SubscriptionsPage = () => <SubscriptionsCRUD />;

export default SubscriptionsPage;
