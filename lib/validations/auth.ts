import { z } from 'zod';

/**
 * Pakistani cities for validation
 */
const pakistaniCities = [
  'Karachi',
  'Lahore', 
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana'
] as const;

/**
 * Sign-in form validation schema
 */
export const signInSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean()
});

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  role: z.literal('user'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .refine(email => !email.includes('+'), 'Email aliases are not allowed'),
  
  phone: z.string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, 'Please enter a valid Pakistani phone number (03XXXXXXXXX)')
    .transform(val => val.replace(/\s+/g, '')), // Remove spaces
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  city: z.enum(pakistaniCities, {
    errorMap: () => ({ message: 'Please select a valid Pakistani city' })
  }),
  
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions to continue')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Seller registration schema with additional business fields
 */
export const sellerRegistrationSchema = z.object({
  role: z.literal('seller'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .refine(email => !email.includes('+'), 'Email aliases are not allowed'),
  
  phone: z.string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, 'Please enter a valid Pakistani phone number (03XXXXXXXXX)')
    .transform(val => val.replace(/\s+/g, '')), // Remove spaces
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  city: z.enum(pakistaniCities, {
    errorMap: () => ({ message: 'Please select a valid Pakistani city' })
  }),
  
  confirmPassword: z.string(),
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters long')
    .max(100, 'Business name must be less than 100 characters')
    .optional(),
  
  cnic: z.string()
    .regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X')
    .optional(),
  
  address: z.string()
    .min(10, 'Address must be at least 10 characters long')
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions to continue')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Multi-step registration schema that handles both user and seller types
 */
export const getRegistrationSchema = () => z.union([
  userRegistrationSchema,
  sellerRegistrationSchema
]);

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  subject: z.enum(['General', 'Support', 'Business', 'Press'], {
    errorMap: () => ({ message: 'Please select a valid subject' })
  }),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters long')
    .max(1000, 'Message must be less than 1000 characters'),
  
  urgency: z.enum(['Low', 'Medium', 'High'])
});

/**
 * Type definitions derived from schemas
 */
export type SignInFormData = z.infer<typeof signInSchema>;
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type SellerRegistrationFormData = z.infer<typeof sellerRegistrationSchema>;
export type RegistrationFormData = z.infer<ReturnType<typeof getRegistrationSchema>>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Helper function to format Zod errors
 */
export const formatZodErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
};