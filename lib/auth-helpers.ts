import { createClient } from '@/utils/supabase/server';
import { User } from '@/types';

/**
 * Get current authenticated user with full profile information
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return null;
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        seller_profiles (*)
      `)
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    return userProfile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user's session
 */
export async function getCurrentSession() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is a verified seller
 */
export async function isVerifiedSeller(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'seller' && user?.seller_profiles?.[0]?.is_verified === true;
}

/**
 * Get user's seller profile
 */
export async function getSellerProfile() {
  const user = await getCurrentUser();
  if (user?.role !== 'seller') {
    return null;
  }
  return user.seller_profiles?.[0] || null;
}