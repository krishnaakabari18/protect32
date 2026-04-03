// User Roles
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    SUPPORT: 'support',
    ACCOUNT: 'account',
    PROVIDER: 'provider',
    PATIENT: 'patient',
} as const;

// Admin-level user types (can log into management panel)
export const ADMIN_USER_TYPES = ['super_admin', 'admin', 'support', 'account'] as const;

// User type options for the Users management page (admin panel users only)
export const ADMIN_USER_TYPE_OPTIONS = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'support', label: 'Support' },
    { value: 'account', label: 'Account' },
];

// Menu permissions per role — super_admin sees all, others see subset
// To add/remove menu access for a role, edit the arrays below.
// Available keys: users, patients, providers, appointments, treatment-plans,
//   prescriptions, plans, provider-fees, payments, documents,
//   reviews, notifications, support-tickets, patienteducation, cms-pages
export const MENU_PERMISSIONS: Record<string, string[]> = {
    super_admin: [
        'users', 'patients', 'providers', 'appointments', 'treatment-plans',
        'prescriptions', 'plans', 'provider-fees', 'payments', 'documents',
        'reviews', 'notifications', 'support-tickets', 'patienteducation', 'cms-pages', 'faqs', 'settings',
    ],
    admin: [
        'patients', 'providers', 'appointments', 'treatment-plans',
        'prescriptions', 'plans', 'provider-fees', 'payments', 'documents',
        'reviews', 'notifications', 'support-tickets', 'patienteducation', 'cms-pages', 'faqs', 'settings',
    ],
    support: [
        'patients', 'appointments', 'support-tickets', 'notifications',
        'documents', 'reviews',
    ],
    account: [
        'patients', 'providers', 'payments', 'plans', 'provider-fees',
        'documents',
    ],
};
