/**
 * Authentication Server Actions
 * Handles user authentication, registration, and profile management
 */

'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { 
  upsertUser, 
  createSellerProfile, 
  logAuthEvent,
  isUsernameAvailable 
} from './supabase-queries'
import { headers } from 'next/headers'
import { handleAuthError } from '@/lib/auth-validation'

interface AuthResult {
  success: boolean
  error?: string
  errorCode?: string
  user?: any
  redirectTo?: string
}

interface SimplifiedSignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  city: string;
  role: 'user' | 'seller';
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  city: string;
  role: 'user' | 'seller';
  sellerData?: {
    username?: string;
    businessName?: string;
    cnic?: string;
    address?: string;
  };
}

interface SignInData {
  email: string
  password: string
}

/**
 * Sign up new user with enhanced validation and rate limiting
 */
export async function signUp(formData: SignUpData): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get client IP for logging and rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null

    // Validate required fields
    if (!formData.email || !formData.password || !formData.name) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: 'Invalid email format'
      }
    }

    // Password validation
    if (formData.password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long'
      }
    }

    // Phone validation for Pakistan
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return {
        success: false,
        error: 'Invalid Pakistani phone number format'
      }
    }

    // Check if seller username is available
    if (formData.role === 'seller' && formData.sellerData?.username) {
      const isAvailable = await isUsernameAvailable(formData.sellerData.username)
      if (!isAvailable) {
        return {
          success: false,
          error: 'Username is already taken'
        }
      }
    }

    // CNIC validation for sellers
    if (formData.role === 'seller' && formData.sellerData?.cnic) {
      const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/
      if (!cnicRegex.test(formData.sellerData.cnic)) {
        return {
          success: false,
          error: 'CNIC must be in format: 12345-1234567-1'
        }
      }
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          role: formData.role
        }
      }
    })

    if (authError) {
      await logAuthEvent(
        null,
        'register',
        false,
        ipAddress,
        undefined,
        authError.message
      )
      // Use enhanced error handling
      const errorMessage = handleAuthError(authError);
      return {
        success: false,
        error: errorMessage,
        errorCode: authError.code
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      }
    }

    // Create user profile in database using SECURITY DEFINER function
    const { error: profileError } = await supabase.rpc('create_user_profile_after_signup', {
        p_id: authData.user.id,
        p_email: formData.email,
        p_phone: formData.phone,
        p_role: formData.role,
        p_city: formData.city,
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
      return {
        success: false,
        error: 'Failed to create user profile'
      }
    }

    // Create seller profile if role is seller
    if (formData.role === 'seller' && formData.sellerData) {
      const sellerProfile = await createSellerProfile({
        id: authData.user.id,
        username: formData.sellerData.username || `seller_${Date.now()}`,
        business_name: formData.sellerData.businessName,
        owner_name: formData.name,
        owner_cnic: formData.sellerData.cnic,
        address_line1: formData.sellerData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        tier: 'basic',
        tier_points: 0,
        verification_status: 'pending',
        is_verified: false,
        is_top_seller: false
      })

      if (!sellerProfile) {
        return {
          success: false,
          error: 'Failed to create seller profile'
        }
      }
    }

    // Log successful registration
    await logAuthEvent(
      authData.user.id,
      'register',
      true,
      ipAddress
    )

    return {
      success: true,
      user: authData.user,
      redirectTo: authData.user.email_confirmed_at 
        ? (formData.role === 'seller' ? '/auth/welcome' : '/dashboard')
        : '/auth/verify-email'
    }

  } catch (error: any) {
    console.error('Sign up error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Sign up new user with simplified registration flow
 */
export async function signUpSimplified(formData: SimplifiedSignUpData): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get client IP for logging and rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null

    // Validate required fields
    if (!formData.email || !formData.password || !formData.name) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: 'Invalid email format'
      }
    }

    // Password validation
    if (formData.password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long'
      }
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          role: formData.role
        }
      }
    })

    if (authError) {
      await logAuthEvent(
        null,
        'register',
        false,
        ipAddress,
        undefined,
        authError.message
      )
      // Use enhanced error handling
      const errorMessage = handleAuthError(authError);
      return {
        success: false,
        error: errorMessage,
        errorCode: authError.code
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      }
    }

    // Create user profile in database using SECURITY DEFINER function
    const { error: profileError } = await supabase.rpc('create_user_profile_after_signup', {
        p_id: authData.user.id,
        p_email: formData.email,
        p_phone: formData.phone,
        p_role: formData.role,
        p_city: formData.city,
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
      return {
        success: false,
        error: 'Failed to create user profile'
      }
    }

    // Log successful registration
    await logAuthEvent(
      authData.user.id,
      'register',
      true,
      ipAddress
    )

    return {
      success: true,
      user: authData.user,
      redirectTo: '/auth/verify-email' // Always redirect to email verification for simplified registration
    }

  } catch (error: any) {
    console.error('Simplified sign up error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Rate limited sign up function
 */
export async function signUpWithRateLimit(formData: SignUpData): Promise<AuthResult> {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null;
    
    // Simple in-memory rate limiting (in production, use Redis)
    const rateLimitKey = `signup_attempts_${ipAddress || 'unknown'}`;
    const now = Date.now();
    const windowSize = 900000; // 15 minutes in milliseconds
    const maxAttempts = 5; // Max 5 attempts per 15 minutes
    
    // In-memory store for rate limiting (in production, use Redis)
    const rateLimitStore = globalThis as any;
    if (!rateLimitStore.signupAttempts) {
      rateLimitStore.signupAttempts = new Map<string, { count: number; timestamp: number }>();
    }
    
    const attemptInfo = rateLimitStore.signupAttempts.get(rateLimitKey) || { count: 0, timestamp: 0 };
    
    // Reset count if window has expired
    if (now - attemptInfo.timestamp > windowSize) {
      attemptInfo.count = 0;
      attemptInfo.timestamp = now;
    }
    
    // Check if rate limit exceeded
    if (attemptInfo.count >= maxAttempts) {
      return {
        success: false,
        error: 'Too many registration attempts. Please try again in 15 minutes.'
      };
    }
    
    // Increment attempt count
    attemptInfo.count++;
    attemptInfo.timestamp = now;
    rateLimitStore.signupAttempts.set(rateLimitKey, attemptInfo);
    
    // Call the regular signup function
    return await signUp(formData);
  } catch (error: any) {
    console.error('Rate limited signup error:', error);
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sign in user
 */
export async function signIn(formData: SignInData, redirectTo?: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get client IP for logging
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null

    // Validate input
    if (!formData.email || !formData.password) {
      return {
        success: false,
        error: 'Email and password are required'
      }
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })

    if (authError) {
      await logAuthEvent(
        null,
        'failed_login',
        false,
        ipAddress,
        undefined,
        authError.message
      )
      // Use enhanced error handling
      const errorMessage = handleAuthError(authError);
      return {
        success: false,
        error: errorMessage,
        errorCode: authError.code
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Login failed'
      }
    }

    // Get user profile to check onboarding status
    const { data: userProfile } = await supabase
      .from('users')
      .select('onboarding_completed, role')
      .eq('id', authData.user.id)
      .single();

    // Update last login
    await upsertUser({
      id: authData.user.id,
      last_login: new Date().toISOString()
    })

    // Log successful login
    await logAuthEvent(
      authData.user.id,
      'login',
      true,
      ipAddress
    )

    // Determine redirect path
    let finalRedirectTo = redirectTo || '/dashboard';
    
    // If user hasn't completed onboarding, redirect to welcome page
    if (userProfile && !userProfile.onboarding_completed) {
      finalRedirectTo = '/auth/welcome';
    }

    return {
      success: true,
      user: authData.user,
      redirectTo: finalRedirectTo
    }

  } catch (error: any) {
    console.error('Sign in error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get current user for logging
    const { data: { user } } = await supabase.auth.getUser()
    
    // Sign out
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    // Log logout
    if (user) {
      await logAuthEvent(user.id, 'logout', true)
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      redirectTo: '/'
    }

  } catch (error: any) {
    console.error('Sign out error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    if (!email) {
      return {
        success: false,
        error: 'Email is required'
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    return {
      success: true
    }

  } catch (error: any) {
    console.error('Password reset error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long'
      }
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    // Update last password change
    if (data.user) {
      await upsertUser({
        id: data.user.id,
        last_password_change: new Date().toISOString()
      })
    }

    return {
      success: true,
      redirectTo: '/dashboard'
    }

  } catch (error: any) {
    console.error('Password update error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
      }
    })

    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    return {
      success: true
    }

  } catch (error: any) {
    console.error('Resend verification error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Enhanced email verification with user onboarding update
 */
export async function verifyEmailAndCompleteOnboarding(userId: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Update user's email verification status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (userError) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(userError);
      return {
        success: false,
        error: errorMessage,
        errorCode: userError.code
      }
    }

    // If user is a seller, also update seller profile
    if (userData.role === 'seller') {
      const { error: sellerError } = await supabase
        .from('seller_profiles')
        .update({ 
          is_verified: true,
          verification_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (sellerError) {
        console.error('Seller profile update error:', sellerError)
        // Don't fail the whole operation if seller profile update fails
      }
    }

    // Log successful verification
    await logAuthEvent(
      userId,
      'email_verified',
      true
    )

    return {
      success: true,
      redirectTo: '/dashboard'
    }

  } catch (error: any) {
    console.error('Email verification error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Send email verification with custom template
 */
export async function sendCustomVerificationEmail(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get user data for personalization
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, role')
      .eq('email', email)
      .single()

    if (userError) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(userError);
      return {
        success: false,
        error: errorMessage,
        errorCode: userError.code
      }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        // In a real implementation, you would customize the email template
        // data: {
        //   user_name: user.name,
        //   user_role: user.role,
        //   site_name: 'RentParLo.pk'
        // }
      }
    })

    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    return {
      success: true
    }

  } catch (error: any) {
    console.error('Custom verification email error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Google OAuth sign in
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    // For OAuth, the redirect is handled by Supabase
    return {
      success: true
    }

  } catch (error: any) {
    console.error('Google OAuth error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Enhanced Google OAuth sign in with better error handling and logging
 */
export async function signInWithGoogleEnhanced(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    // Get client IP for logging
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) {
      await logAuthEvent(
        null,
        'google_oauth_failed',
        false,
        ipAddress,
        undefined,
        error.message
      )
      
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    // Log successful OAuth initiation
    await logAuthEvent(
      null,
      'google_oauth_initiated',
      true,
      ipAddress
    )

    // For OAuth, the redirect is handled by Supabase
    return {
      success: true
    }

  } catch (error: any) {
    console.error('Enhanced Google OAuth error:', error)
    
    // Log the error
    try {
      const headersList = await headers()
      const forwardedFor = headersList.get('x-forwarded-for')
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null
      
      await logAuthEvent(
        null,
        'google_oauth_exception',
        false,
        ipAddress,
        undefined,
        error.message
      )
    } catch (logError) {
      console.error('Error logging OAuth exception:', logError)
    }
    
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get additional user data from database
    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        seller_profiles (*)
      `)
      .eq('id', user.id)
      .single()

    return userData || user

  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return !!user
  } catch {
    return false
  }
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      // Use enhanced error handling
      const errorMessage = handleAuthError(error);
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      }
    }

    return {
      success: true,
      user: data.user
    }

  } catch (error: any) {
    console.error('Refresh session error:', error)
    const errorMessage = handleAuthError(error);
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Wrapper for signOut to be used in form actions, handles redirect.
 */
export async function signOutAndRedirect() {
  'use server'
  const result = await signOut();
  if (result.success && result.redirectTo) {
    redirect(result.redirectTo);
  }
}