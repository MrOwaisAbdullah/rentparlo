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
  redirectUrl?: string;
  redirectTo?: string;
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

    // Check if user exists in our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // If user doesn't exist in our users table, create a profile for them
    if (!userProfile && !profileError) {
      // Get user metadata from auth
      const userMetadata = authData.user.user_metadata || {};
      
      // Create user profile using SECURITY DEFINER function
      const { error: createProfileError } = await supabase.rpc('create_user_profile_after_signup', {
        p_id: authData.user.id,
        p_email: authData.user.email,
        p_phone: userMetadata.phone || null,
        p_role: userMetadata.role || 'user',
        p_city: userMetadata.city || null,
        p_country: 'Pakistan',
        p_is_verified: false,
        p_email_verified: authData.user.email_confirmed_at ? true : false,
        p_active: true,
        p_guest_id: `guest_${Date.now()}`,
        p_notification_preferences: {
          email: true,
          sms: false,
          push: true
        },
        p_preferred_language: 'en'
      });

      if (createProfileError) {
        console.error('Profile creation error:', createProfileError.message);
      }
    }

    // Update last login timestamp if user exists
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

    // Create user profile using SECURITY DEFINER function
    const { error: profileError } = await supabase.rpc('create_user_profile_after_signup', {
        p_id: authData.user.id,
        p_email: validData.email,
        p_phone: validData.phone,
        p_role: validData.role,
        p_city: validData.city,
        p_country: 'Pakistan',
        p_is_verified: false,
        p_email_verified: false,
        p_active: true,
        p_guest_id: `guest_${Date.now()}`,
        p_notification_preferences: {
          email: true,
          sms: false,
          push: true
        },
        p_preferred_language: 'en'
    });

    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      // Note: In production, you might want to clean up the auth user here
    }

    // If seller, create seller profile using SECURITY DEFINER function
    if (validData.role === 'seller') {
      const { error: sellerError } = await supabase.rpc('create_seller_profile_after_signup', {
          p_id: authData.user.id,
          p_username: validData.email.split('@')[0],
          p_business_name: validData.businessName,
          p_owner_cnic: validData.cnic,
          p_address_line1: validData.address,
          p_is_verified: false,
          p_is_top_seller: false,
          p_tier: 'basic',
          p_tier_points: 0,
          p_verification_status: 'pending',
          p_verification_documents: {
            cnic_front: null,
            cnic_back: null,
            business_license: null
          },
          p_city: validData.city,
          p_phone: validData.phone,
          p_email: validData.email
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
    
    // Force production URL for OAuth redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; // CHANGE THIS TO YOUR ACTUAL DOMAIN
    
    console.log('OAuth signup site URL:', siteUrl);
    console.log('Full signup redirect URL:', `${siteUrl}/auth/callback?type=signup`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback?type=signup`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: 'Failed to initiate Google sign-up. Please try again.'
      };
    }

    if (data.url) {
      console.log('Redirecting to OAuth signup URL:', data.url);
      return {
        success: true,
        redirectUrl: data.url
      };
    }

    return {
      success: false,
      error: 'Failed to get redirect URL from OAuth provider'
    };

  } catch (error: any) {
    console.error('Google sign-up error:', error);
    
    // Check if this is a redirect error that should not be caught
    if (error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      // Rethrow redirect errors so Next.js can handle them properly
      throw error;
    }
    
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
    
    // Force production URL for OAuth redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; // CHANGE THIS TO YOUR ACTUAL DOMAIN
    
    console.log('OAuth sign-in site URL:', siteUrl);
    console.log('Full redirect URL:', `${siteUrl}/auth/callback`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Supabase OAuth error:', error);
      return {
        success: false,
        error: `OAuth Error: ${error.message || 'Failed to initiate Google sign-in'}`
      };
    }

    if (data.url) {
      console.log('Redirecting to OAuth URL:', data.url);
      return {
        success: true,
        redirectUrl: data.url
      };
    }

    return {
      success: false,
      error: 'Failed to get redirect URL from OAuth provider'
    };

  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Check if this is a redirect error that should not be caught
    if (error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      // Rethrow redirect errors so Next.js can handle them properly
      throw error;
    }
    
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
      // Check if this is a new user or existing user
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, onboarding_completed')
        .eq('id', data.user.id)
        .single();
        
      let isNewUser = false;
      let needsOnboarding = false;
        
      if (!existingUser && !userError) {
        isNewUser = true;
        // Create user profile for new OAuth user using SECURITY DEFINER function
        const { error: profileError } = await supabase.rpc('create_user_profile_after_signup', {
            p_id: data.user.id,
            p_email: data.user.email!,
            p_phone: null, // Assuming phone is not available from OAuth directly
            p_role: 'user', // Default role, can be changed during onboarding
            p_city: null, // Assuming city is not available from OAuth directly
            p_country: 'Pakistan',
            p_is_verified: false,
            p_email_verified: data.user.email_confirmed_at ? true : false,
            p_active: true,
            p_guest_id: `guest_${Date.now()}`,
            p_notification_preferences: {
              email: true,
              sms: false,
              push: true
            },
            p_preferred_language: 'en'
        });
          
        if (profileError) {
          console.error('OAuth profile creation error:', profileError);
        } else {
          needsOnboarding = true;
        }
      } else if (existingUser) {
        // Existing user - check if they need onboarding
        needsOnboarding = !existingUser.onboarding_completed;
      }
      
      // Update login info
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString()
        })
        .eq('id', data.user.id);
      
      // Increment login count separately
      await supabase
        .rpc('increment_user_login_count', { user_id: data.user.id });
        
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
        // New users or users who haven't completed onboarding go to welcome page
        redirectTo = '/auth/welcome';
      } else if (redirectTo === '/' || redirectTo === '/auth/login' || redirectTo === '/auth/register') {
        // Existing users go to dashboard unless they have a specific destination
        redirectTo = '/dashboard';
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