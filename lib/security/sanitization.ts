import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and scripts
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Escape SQL injection patterns and special characters
  const escaped = validator.escape(cleaned.trim());
  
  return escaped;
};

/**
 * Sanitize HTML content while preserving safe formatting
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return '';
  }

  const cleaned = email.trim().toLowerCase();
  
  // Basic email format validation
  if (!validator.isEmail(cleaned)) {
    return '';
  }

  return validator.normalizeEmail(cleaned) || cleaned;
};

/**
 * Sanitize phone number input
 */
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except + for country code
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle Pakistani phone number format
  if (cleaned.startsWith('0')) {
    cleaned = '+92' + cleaned.substring(1);
  } else if (cleaned.startsWith('92')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+92')) {
    // If no country code, assume Pakistani number starting with 3
    if (cleaned.startsWith('3')) {
      cleaned = '+92' + cleaned;
    }
  }

  return cleaned;
};

/**
 * Sanitize CNIC input
 */
export const sanitizeCnic = (cnic: string): string => {
  if (typeof cnic !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const digitsOnly = cnic.replace(/\D/g, '');
  
  // Format as XXXXX-XXXXXXX-X if 13 digits
  if (digitsOnly.length === 13) {
    return `${digitsOnly.substring(0, 5)}-${digitsOnly.substring(5, 12)}-${digitsOnly.substring(12)}`;
  }
  
  return digitsOnly;
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    return '';
  }

  // Remove path traversal attempts and dangerous characters
  const cleaned = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '')
    .substring(0, 255);

  return cleaned || 'file';
};

/**
 * Sanitize form data object
 */
export const sanitizeFormData = <T extends Record<string, unknown>>(data: T): T => {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Apply specific sanitization based on field name
      if (key.toLowerCase().includes('email')) {
        sanitized[key as keyof T] = sanitizeEmail(value) as T[keyof T];
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key as keyof T] = sanitizePhone(value) as T[keyof T];
      } else if (key.toLowerCase().includes('cnic')) {
        sanitized[key as keyof T] = sanitizeCnic(value) as T[keyof T];
      } else if (key.toLowerCase().includes('html') || key.toLowerCase().includes('content')) {
        sanitized[key as keyof T] = sanitizeHtml(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
      }
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[keyof T];
    } else {
      // Keep non-string values as is (numbers, booleans, objects)
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize file upload
 */
export const validateFileInput = (file: File, allowedTypes: string[], maxSize: number) => {
  const errors: string[] = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  // Check file name
  const sanitizedName = sanitizeFileName(file.name);
  if (!sanitizedName || sanitizedName === 'file') {
    errors.push('Invalid file name');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName
  };
};

/**
 * Rate limiting helper
 */
export const createRateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const requestTimes = requests.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = requestTimes.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    return true;
  };
};

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'self';"
};

/**
 * Utility to apply security headers to response
 */
export const applySecurityHeaders = (response: Response): Response => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};