// Centralized API Configuration
// All URLs and API endpoints are defined here

// Base URL Configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const API_BASE_URL = `${BASE_URL}/api/v1`;

// Media URL Configuration
export const MEDIA_BASE_URL = BASE_URL;
export const MEDIA_ENDPOINTS = {
  // Provider media
  providers: `${MEDIA_BASE_URL}/uploads/provider`,
  
  // User media
  users: `${MEDIA_BASE_URL}/uploads/users`,
  
  // Document media
  documents: `${MEDIA_BASE_URL}/uploads/documents`,
  
  // Patient education media
  patientEducation: `${MEDIA_BASE_URL}/uploads/patient-education`,
  
  // General uploads
  uploads: `${MEDIA_BASE_URL}/uploads`,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
    resendOtp: `${API_BASE_URL}/auth/resend-otp`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },

  // Users
  users: `${API_BASE_URL}/users`,
  
  // Patients
  patients: `${API_BASE_URL}/patients`,
  
  // Patient Self-Service
  myFamilyMembers: `${API_BASE_URL}/patients/my/family-members`,
  
  // Providers
  providers: `${API_BASE_URL}/providers`,
  
  // Appointments
  appointments: `${API_BASE_URL}/appointments`,
  
  // Treatment Plans
  treatmentPlans: `${API_BASE_URL}/treatment-plans`,
  
  // Prescriptions
  prescriptions: `${API_BASE_URL}/prescriptions`,
  
  // Plans
  plans: `${API_BASE_URL}/plans`,
  
  // Provider Fees
  providerFees: `${API_BASE_URL}/provider-fees`,
  
  // Procedures
  procedures: `${API_BASE_URL}/procedures`,
  proceduresWithPrice: `${API_BASE_URL}/procedures/with-price-range`,
  
  // Specialties
  specialties: `${API_BASE_URL}/specialties`,
  
  // Menus
  menus: `${API_BASE_URL}/menus`,
  myMenus: `${API_BASE_URL}/menus/my-menus`,
  
  // Support Tickets
  supportTickets: `${API_BASE_URL}/support-tickets`,
  
  // Payments
  payments: `${API_BASE_URL}/payments`,
  
  // Documents
  documents: `${API_BASE_URL}/documents`,
  
  // Reviews
  reviews: `${API_BASE_URL}/reviews`,
  
  // Patient Education
  patientEducation: `${API_BASE_URL}/patient-education`,
  
  // Education Images (inline uploads)
  educationImages: `${API_BASE_URL}/education-images`,

  // Plan Features
  planFeatures: `${API_BASE_URL}/plan-features`,
  
  // CMS Pages
  cmsPages: `${API_BASE_URL}/cms-pages`,

  // FAQs
  faqs: `${API_BASE_URL}/faqs`,

  // States & Cities
  statesCities: `${API_BASE_URL}/states-cities`,

  // Dropdowns (centralized)
  dropdowns: `${API_BASE_URL}/dropdowns`,
  
  // Notifications
  notifications: `${API_BASE_URL}/notifications`,
  
  // Chat
  chat: `${API_BASE_URL}/chat`,
  
  // Settings
  settings: `${API_BASE_URL}/settings`,
  
  // Dashboard
  dashboard: `${API_BASE_URL}/dashboard`,
};

// Helper function to build endpoint with ID
export const buildEndpoint = (endpoint: string, id?: string | number) => {
  return id ? `${endpoint}/${id}` : endpoint;
};

// Helper function to build query string
export const buildQueryString = (params: Record<string, any>) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key].toString());
    }
  });
  return queryParams.toString();
};

// Helper function to build media URL from relative path
export const buildMediaUrl = (relativePath: string | null | undefined): string => {
  if (!relativePath) return '';
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${MEDIA_BASE_URL}/${cleanPath}`;
};

// Helper function to get media URL for specific type
export const getMediaUrl = (type: 'providers' | 'users' | 'documents' | 'patientEducation', relativePath: string | null | undefined): string => {
  if (!relativePath) return '';
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // For provider images, the path already includes 'uploads/provider', so use buildMediaUrl
  if (type === 'providers' && relativePath.startsWith('uploads/provider')) {
    return buildMediaUrl(relativePath);
  }
  
  // For other types, build the full path
  const baseUrl = MEDIA_ENDPOINTS[type];
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${baseUrl}/${cleanPath}`;
};

// Export for backward compatibility
export const API_URL = API_BASE_URL;
