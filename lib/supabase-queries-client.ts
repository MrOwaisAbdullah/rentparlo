/**
 * =====================================================
 * RentParlo.pk Supabase Database Queries - Client Side
 * =====================================================
 * Collection of Supabase queries for use in client components
 */

import { createClient } from '../utils/supabase/client'
import { 
  User, 
  SellerProfile, 
  Seller, 
  AnalyticsEvent, 
  SellerAnalytics, 
  ListingAnalytics,
  SubscriptionPackage,
  UserSubscription,
  EnhancedUserSubscription,
  SupportTicket,
  AffiliateCode,
  AffiliateReferral
} from '@/types'

/**
 * =====================================================
 * USER QUERIES
 * =====================================================
 */

// Client-side version of getUserById for use in client components
export async function getUserByIdClient(userId: string): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      seller_profiles (*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    // Don't log as error if user simply doesn't exist - this is expected in many cases
    if (error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
    }
    return null
  }

  console.log('User data fetched (client):', data); // Debugging
  return data
}

/**
 * =====================================================
 * ANALYTICS QUERIES
 * =====================================================
 */

// Client-side version of trackAnalyticsEvent for use in client components
export async function trackAnalyticsEventClient(eventData: Partial<AnalyticsEvent> & {
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}): Promise<boolean> {
  try {
    const supabase = createClient() // Use client version for browser usage
    
    // For client-side tracking, we'll simplify the session handling
    // since we don't have access to server-side session creation
    const sessionId = eventData.session_id;
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        ...eventData,
        session_ref: sessionId,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error tracking analytics event:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error tracking analytics event:', error)
    return false
  }
}

/** 
 * ===================================================== 
 * PROFILE QUERIES 
 * ===================================================== 
 */ 
  
// Get current user profile with seller profile if applicable 
export async function getUserProfile(): Promise<{ user: User; sellerProfile?: SellerProfile } | null> { 
  const supabase = createClient() 
  
  const { data: { user } } = await supabase.auth.getUser() 
  
  if (!user) { 
    return null 
  } 
  
  // Get user data with seller profile if applicable 
  const { data: userData, error: userError } = await supabase 
    .from('users') 
    .select(` 
      *, 
      seller_profiles (*) 
    `) 
    .eq('id', user.id) 
    .single() 
  
  if (userError) { 
    console.error('Error fetching user profile:', userError) 
    return null 
  } 
  
  return { 
    user: userData, 
    sellerProfile: userData.seller_profiles || undefined 
  } 
} 
  
// Update user profile 
export async function updateUserProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> { 
  const supabase = createClient() 
  
  const { data: { user } } = await supabase.auth.getUser() 
  
  if (!user) { 
    return { success: false, error: 'User not authenticated' } 
  } 
  
  const { error } = await supabase 
    .from('users') 
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    }) 
    .eq('id', user.id) 
  
  if (error) { 
    console.error('Error updating user profile:', error) 
    return { success: false, error: error.message } 
  } 
  
  return { success: true } 
}