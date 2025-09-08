'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { signInSchema, getRegistrationSchema } from '@/lib/validations/auth'
import { sanitizeFormData, createRateLimiter } from '@/lib/security/sanitization'
import { headers } from 'next/headers'

// Rate limiting: 5 attempts per 15 minutes
const loginRateLimit = createRateLimiter(15 * 60 * 1000, 5);
const signupRateLimit = createRateLimiter(15 * 60 * 1000, 3);

// Get client IP for rate limiting
const getClientIP = async () => {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0] || 
         headersList.get('x-real-ip') ||
         'unknown';
};

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
  fieldErrors?: Record<string, string>;
}

// Security logging function
async function logSecurityEvent(action: string, ip: string, metadata?: any) {
  try {
    const supabase = await createClient();
    
    // In production, you might want to use a separate logging service
    // For now, we'll log to console and optionally to database
    console.log(`Security Event: ${action}`, {
      timestamp: new Date().toISOString(),
      ip,
      metadata
    });
    
    // Optionally log to database (if you have an audit_logs table)
    // await supabase
    //   .from('audit_logs')
    //   .insert({
    //     action,
    //     ip_address: ip,
    //     metadata,
    //     timestamp: new Date().toISOString()
    //   });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    // Rate limiting
    const clientIP = await getClientIP();
    if (!loginRateLimit(clientIP)) {
      return {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.'
      };
    }

    // Extract and sanitize form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'true'
    };

    const sanitizedData = sanitizeFormData(rawData);

    // Validate with Zod schema
    const validationResult = signInSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid email or password format.'
      };
    }

    const { email, password } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Attempt sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // Log failed attempt (in production, use proper logging)
      console.error('Sign in failed:', authError.message);
      
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    }

    // Update last login timestamp if needed
    if (authData.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);
    }

    // Revalidate and redirect
    revalidatePath('/', 'layout');
    
    const redirectTo = formData.get('redirectTo') as string;
    redirect(redirectTo || '/');
    
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    // Rate limiting
    const clientIP = await getClientIP();
    if (!signupRateLimit(clientIP)) {
      return {
        success: false,
        error: 'Too many signup attempts. Please try again in 15 minutes.'
      };
    }

    // Extract raw form data
    const rawData = {
      role: formData.get('role') as 'user' | 'seller',
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      city: formData.get('city') as string,
      terms: formData.get('terms') === 'true',
      // Seller-specific fields
      businessName: formData.get('businessName') as string || undefined,
      cnic: formData.get('cnic') as string || undefined,
      address: formData.get('address') as string || undefined
    };

    // Remove empty strings and convert to proper types
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).filter(([_, value]) => value !== '' && value !== null)
    );

    const sanitizedData = sanitizeFormData(cleanedData);

    // Validate with Zod schema
    const registrationSchema = getRegistrationSchema();
    const validationResult = registrationSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ');
      return {
        success: false,
        error: `Validation failed: ${errors}`
      };
    }

    const validData = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', validData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists.'
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validData.email,
      password: validData.password,
      options: {
        data: {
          name: validData.name,
          phone: validData.phone,
          city: validData.city,
          role: validData.role
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError.message);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account.'
      };
    }

    // Create user profile in public schema
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validData.email,
        phone: validData.phone,
        role: validData.role,
        city: validData.city,
        country: 'Pakistan',
        is_verified: false,
        email_verified: false,
        active: true,
        guest_id: `guest_${Date.now()}`,
        notification_preferences: {
          email: true,
          sms: false,
          push: true
        },
        preferred_language: 'en'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      // Note: In production, you might want to clean up the auth user here
    }

    // If seller, create seller profile
    if (validData.role === 'seller') {
      const { error: sellerError } = await supabase
        .from('seller_profiles')
        .insert({
          id: authData.user.id,
          username: validData.email.split('@')[0], // Generate username from email
          business_name: validData.businessName,
          owner_cnic: validData.cnic,
          address_line1: validData.address,
          is_verified: false,
          is_top_seller: false,
          tier: 'basic',
          tier_points: 0,
          verification_status: 'pending',
          verification_documents: {
            cnic_front: null,
            cnic_back: null,
            business_license: null
          }
        });

      if (sellerError) {
        console.error('Seller profile creation error:', sellerError.message);
      }
    }

    // Revalidate and redirect
    revalidatePath('/', 'layout');
    redirect('/auth/verify-email');

  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function signOut() {
  const clientIP = await getClientIP();
  
  try {
    const supabase = await createClient();
    
    // Get user info before signing out for logging
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error.message);
      throw error;
    }
    
    if (user) {
      // await logSecurityEvent('LOGOUT_SUCCESS', clientIP, { 
      //   userId: user.id,
      //   email: user.email
      // });
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Sign out error:', error);
    // await logSecurityEvent('LOGOUT_ERROR', clientIP, { error: error.message });
    redirect('/error');
  }
}

// Google OAuth sign-up (registration)
export async function signUpWithGoogle(): Promise<ActionResult> {
  const clientIP = await getClientIP();
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      // await logSecurityEvent('GOOGLE_SIGNUP_FAILED', clientIP, { 
      //   error: error.message
      // });
      return {
        success: false,
        error: 'Failed to initiate Google sign-up. Please try again.'
      };
    }

    if (data.url) {
      // await logSecurityEvent('GOOGLE_SIGNUP_INITIATED', clientIP);
      redirect(data.url);
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Google sign-up error:', error);
    // await logSecurityEvent('GOOGLE_SIGNUP_ERROR', clientIP, { error: error.message });
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// Google OAuth sign-in
export async function signInWithGoogle(): Promise<ActionResult> {
  const clientIP = await getClientIP();
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      // await logSecurityEvent('GOOGLE_SIGNIN_FAILED', clientIP, { 
      //   error: error.message
      // });
      return {
        success: false,
        error: 'Failed to initiate Google sign-in. Please try again.'
      };
    }

    if (data.url) {
      // await logSecurityEvent('GOOGLE_SIGNIN_INITIATED', clientIP);
      redirect(data.url);
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Google sign-in error:', error);
    // await logSecurityEvent('GOOGLE_SIGNIN_ERROR', clientIP, { error: error.message });
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// Handle OAuth callback
export async function handleOAuthCallback(code: string, provider: string, type?: string): Promise<ActionResult> {
  const clientIP = await getClientIP();
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      await logSecurityEvent('OAUTH_CALLBACK_FAILED', clientIP, { 
        provider,
        error: error.message
      });
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
    
    if (data.user) {
      // Check if this is a new user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, onboarding_completed')
        .eq('id', data.user.id)
        .single();
        
      let isNewUser = false;
      let needsOnboarding = false;
        
      if (!existingUser) {
        isNewUser = true;
        // Create user profile for new OAuth user
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            profile_image_url: data.user.user_metadata?.avatar_url,
            role: 'user', // Default role, can be changed during onboarding
            country: 'Pakistan',
            is_verified: false,
            email_verified: data.user.email_confirmed_at ? true : false,
            phone_verified: false,
            active: true,
            onboarding_completed: false, // New Google users need onboarding
            guest_id: `guest_${Date.now()}`,
            notification_preferences: {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              security_alerts: true
            },
            privacy_settings: {
              profile_visible: true,
              contact_info_visible: false,
              activity_visible: true,
              location_sharing: false
            },
            preferred_language: 'en',
            timezone: 'Asia/Karachi',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('OAuth profile creation error:', profileError);
        } else {
          needsOnboarding = true;
        }
      } else {
        // Existing user - check if they need onboarding
        needsOnboarding = !existingUser.onboarding_completed;
      }
      
      // Update login info
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          login_count: supabase.sql`login_count + 1`
        })
        .eq('id', data.user.id);
        
      await logSecurityEvent('OAUTH_LOGIN_SUCCESS', clientIP, { 
        userId: data.user.id,
        email: data.user.email,
        provider,
        isNewUser,
        type: type || 'signin'
      });
      
      revalidatePath('/', 'layout');
      
      // Determine redirect path
      let redirectTo = '/dashboard';
      
      if (type === 'signup' || needsOnboarding) {
        redirectTo = '/auth/welcome';
      }
      
      return {
        success: true,
        redirectTo
      };
    }

    return {
      success: false,
      error: 'Authentication failed. Please try again.'
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    await logSecurityEvent('OAUTH_CALLBACK_ERROR', clientIP, { 
      provider,
      error: error.message 
    });
    return {
      success: false,
      error: 'Authentication failed. Please try again.'
    };
  }
}