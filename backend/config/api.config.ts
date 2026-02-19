// Centralized API Configuration
// All URLs and API endpoints are defined here

// Base URL Configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://abbey-stateliest-treva.ngrok-free.dev';
export const API_BASE_URL = `${BASE_URL}/api/v1`;

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
  
  // Payments
  payments: `${API_BASE_URL}/payments`,
  
  // Documents
  documents: `${API_BASE_URL}/documents`,
  
  // Reviews
  reviews: `${API_BASE_URL}/reviews`,
  
  // Notifications
  notifications: `${API_BASE_URL}/notifications`,
  
  // Chat
  chat: `${API_BASE_URL}/chat`,
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

// Export for backward compatibility
export const API_URL = API_BASE_URL;
