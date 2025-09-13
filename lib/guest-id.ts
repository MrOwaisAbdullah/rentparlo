/**
 * Guest ID Management Utility
 * Handles generation and persistence of guest IDs for anonymous users
 * Uses both localStorage and cookies for maximum compatibility
 * Also integrates with user profile guest_id for authenticated users
 */

import { createClient } from '@/utils/supabase/client';

/**
 * Generate or retrieve a guest ID for anonymous users
 * @returns {string} Guest ID
 */
export function getGuestId(): string {
  if (typeof window === 'undefined') {
    // Server-side, we can't access localStorage or cookies directly
    return `ss-guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Try to get from localStorage first
  let guestId = localStorage.getItem('rentparlo_guest_id');
  
  // If not in localStorage, try to get from cookies
  if (!guestId) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('rentparlo_guest_id=')) {
        guestId = cookie.substring('rentparlo_guest_id='.length);
        break;
      }
    }
  }
  
  // If still no guest ID, generate a new one
  if (!guestId) {
    // Generate a new guest ID using crypto if available, fallback to Math.random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      guestId = crypto.randomUUID();
    } else {
      // Fallback for older browsers
      guestId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Store in both localStorage and cookies for persistence
    localStorage.setItem('rentparlo_guest_id', guestId);
    
    // Set cookie with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `rentparlo_guest_id=${guestId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
  } else {
    // Ensure it's also stored in both places
    localStorage.setItem('rentparlo_guest_id', guestId);
    
    // Update cookie expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `rentparlo_guest_id=${guestId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
  }
  
  return guestId;
}

/**
 * Get the guest ID from user profile if user is authenticated
 * @returns {Promise<string|null>} Guest ID from user profile or null
 */
export async function getUserProfileGuestId(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get user profile with guest_id
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('guest_id')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile guest_id:', error);
      return null;
    }
    
    return userProfile?.guest_id || null;
  } catch (error) {
    console.error('Error getting user profile guest_id:', error);
    return null;
  }
}

/**
 * Get the appropriate guest ID for tracking
 * - For authenticated users: Use guest_id from their profile
 * - For anonymous users: Use persistent guest ID
 * @returns {Promise<string>} Guest ID for tracking
 */
export async function getTrackingGuestId(): Promise<string> {
  // Try to get guest ID from user profile first (for authenticated users)
  const userProfileGuestId = await getUserProfileGuestId();
  
  if (userProfileGuestId) {
    return userProfileGuestId;
  }
  
  // For anonymous users, use persistent guest ID
  return getGuestId();
}

/**
 * Clear guest ID (useful for testing or when user logs in)
 */
export function clearGuestId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rentparlo_guest_id');
    document.cookie = 'rentparlo_guest_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
}

/**
 * Check if current user is a guest
 * @param userId - Authenticated user ID if available
 * @returns {boolean} True if user is a guest
 */
export function isGuestUser(userId: string | null | undefined): boolean {
  return !userId;
}

/**
 * Get user ID for tracking (either authenticated user ID or guest ID)
 * @param userId - Authenticated user ID if available
 * @returns {Promise<string>} User ID or guest ID
 */
export async function getUserIdForTracking(userId?: string | null): Promise<string> {
  // If we have an authenticated user ID, use that
  if (userId) {
    return userId;
  }
  
  // Otherwise, get or generate a guest ID
  return getTrackingGuestId();
}