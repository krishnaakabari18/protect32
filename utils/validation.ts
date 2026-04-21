// Shared validation helpers used across all management forms

export const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone: string): boolean =>
    /^\d{10}$/.test(phone.replace(/[\s\-+]/g, ''));

export const isValidPincode = (pin: string): boolean =>
    /^\d{6}$/.test(pin.trim());

export const isValidPostalCode = (code: string): boolean =>
    /^\d+$/.test(code.trim());

// Returns error message or empty string
export const emailError = (email: string): string => {
    if (!email) return '';
    return isValidEmail(email) ? '' : 'Enter a valid email address';
};

export const phoneError = (phone: string, label = 'Mobile number'): string => {
    if (!phone) return '';
    return isValidPhone(phone) ? '' : `${label} must be exactly 10 digits`;
};

export const pincodeError = (pin: string): string => {
    if (!pin) return '';
    return /^\d+$/.test(pin.trim()) ? '' : 'Pincode must contain numbers only';
};
