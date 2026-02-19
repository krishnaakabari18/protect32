// Application Constants
// All constant values used throughout the application

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    MENU: 'menu',
    LAYOUT: 'layout',
    RTL_CLASS: 'rtlClass',
    ANIMATION: 'animation',
    NAVBAR: 'navbar',
    SEMIDARK: 'semidark',
};

// Cookie Names
export const COOKIE_NAMES = {
    TOKEN: 'token',
};

// User Roles
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
} as const;

// User Role Options for Dropdowns
export const USER_ROLE_OPTIONS = [
    { value: USER_ROLES.PATIENT, label: 'Patient' },
    { value: USER_ROLES.DOCTOR, label: 'Doctor' },
    { value: USER_ROLES.ADMIN, label: 'Admin' },
    { value: USER_ROLES.SUPER_ADMIN, label: 'Super Admin' },
];

// Routes
export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/',
    USERS: '/management/users',
    PROFILE: '/users/profile',
    ANALYTICS: '/analytics',
    PATIENTS: '/management/patients',
    // Add more routes as needed
};

// Public Routes (no authentication required)
export const PUBLIC_ROUTES = ['/login', '/auth'];

// Toast/Notification Settings
export const TOAST_CONFIG = {
    POSITION: 'top' as const,
    DURATION: 3000,
    CONTAINER_CLASS: 'toast',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'MMM DD, YYYY HH:mm',
};

// Validation
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
};

// Token Expiry
export const TOKEN_EXPIRY = {
    HOURS: 24,
    SECONDS: 24 * 60 * 60,
};
