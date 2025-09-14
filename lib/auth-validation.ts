import { z } from 'zod';

// Pakistani phone number validation
const phoneRegex = /^03[0-9]{2}[0-9]{7}$/;

// Pakistani CNIC validation
const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;

// Email validation
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Export utility functions only

/** 
 * Handle authentication errors and return user-friendly messages
 */
export const handleAuthError = (error: any): string => {
  // Handle specific Supabase errors
  if (error.code === '23505') {
    // Unique violation error
    if (error.message.includes('email')) {
      return 'This email address is already registered';
    }
    if (error.message.includes('phone')) {
      return 'This phone number is already registered';
    }
    if (error.message.includes('username')) {
      return 'This username is already taken';
    }
    if (error.message.includes('owner_cnic')) {
      return 'This CNIC number is already registered';
    }
    return 'This information is already registered';
  }
  
  // Handle check constraint violations
  if (error.code === '23514') {
    if (error.message.includes('valid_phone_format')) {
      return 'Please enter a valid Pakistani phone number (e.g., 03001234567)';
    }
    if (error.message.includes('valid_email_format')) {
      return 'Please enter a valid email address';
    }
    if (error.message.includes('valid_cnic_format')) {
      return 'Please enter a valid CNIC number (e.g., 12345-1234567-1)';
    }
    return 'Please check your input and try again';
  }
  
  // Handle network errors
  if (error.message && (error.message.includes('NetworkError') || error.message.includes('FetchError'))) {
    return 'Network error. Please check your connection and try again';
  }
  
  // Handle timeout errors
  if (error.message && (error.message.includes('timeout') || error.message.includes('UND_ERR') || error.message.includes('Connect Timeout'))) {
    return 'Connection timeout. Please check your internet connection and try again';
  }
  
  // Handle duplicate email errors specifically
  if (error.message && error.message.includes('duplicate key value violates unique constraint "idx_users_email_unique"')) {
    return 'This email address is already registered. Please try logging in instead.';
  }
  
  // Handle generic errors
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again';
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email must be less than 255 characters';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Please enter a valid Pakistani phone number (e.g., 03001234567)';
  return null;
};

export const validateCNIC = (cnic: string): string | null => {
  if (!cnic) return 'CNIC number is required';
  if (!cnicRegex.test(cnic)) return 'Please enter a valid CNIC number (e.g., 12345-1234567-1)';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be less than 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Format Pakistani phone numbers
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 92, remove it and add 0
  if (cleaned.startsWith('92')) {
    return `0${cleaned.substring(2)}`;
  }
  
  // If it's already in the correct format, return as is
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return cleaned;
  }
  
  // If it's 10 digits starting with 3, add 0
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return `0${cleaned}`;
  }
  
  return phone;
};

/**
 * Format CNIC numbers
 */
export const formatCNIC = (cnic: string): string => {
  // Remove all non-digit characters
  const cleaned = cnic.replace(/\D/g, '');
  
  // If it's 13 digits, format it properly
  if (cleaned.length === 13) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 12)}-${cleaned.substring(12, 13)}`;
  }
  
  return cnic;
};