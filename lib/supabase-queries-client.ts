/**
 * =====================================================
 * RentParLo.pk Supabase Database Queries (Client-Side)
 * =====================================================
 * Client-side collection of Supabase queries for use in client components
 * Uses browser client instead of server client to avoid next/headers import issues
 */

import { createClient } from '@/utils/supabase/client'
import { 
  User, 
  SellerProfile, 
  Seller, 
  AnalyticsEvent, 
  SellerAnalytics, 
  ListingAnalytics,
  SubscriptionPackage,
  UserSubscription,
  SupportTicket,
  AffiliateCode,
  AffiliateReferral
} from '@/types'

/**
 * =====================================================
 * CLIENT-SIDE HELPER FUNCTIONS
 * =====================================================
 */

// Get Supabase client for client-side operations
function getSupabaseClient() {
  return createClient()
}

/**
 * =====================================================
 * ANALYTICS QUERIES (Client-Side)
 * =====================================================
 */

// Track analytics event (client-side version)
export async function trackAnalyticsEventClient(eventData: Partial<AnalyticsEvent>): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  try {
    const insertData: any = {
      ...eventData,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('analytics_events')
      .insert(insertData)

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
 * USER QUERIES (Client-Side)
 * =====================================================
 */

// Get current user (client-side)
export async function getCurrentUserClient(): Promise<User | null> {
  const supabase = getSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Get additional user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (userError) {
    console.error('Error fetching user data:', userError)
    return null
  }
  
  return userData
}

/**
 * =====================================================
 * SELLER PROFILE QUERIES (Client-Side)
 * =====================================================
 */

// Get seller profile by user ID (client-side)
export async function getSellerProfileClient(userId: string): Promise<SellerProfile | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching seller profile:', error)
    return null
  }

  return data
}

// Get seller profile by username (client-side)
export async function getSellerProfileByUsernameClient(username: string): Promise<Seller | null> {
  const supabase = getSupabaseClient()
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('username', username)
      .single()
      
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching seller profile by username:', profileError)
      return null
    }
    
    if (!profileData) {
      return null
    }
    
    const seller: Seller = {
      id: profileData.id,
      email: profileData.email || '',
      role: 'seller',
      is_verified: profileData.is_verified || false,
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: profileData.updated_at || new Date().toISOString(),
      active: true,
      email_verified: false,
      country: profileData.country || 'Pakistan',
      notification_preferences: { email: true, sms: false, push: true },
      preferred_language: 'en',
      profile: profileData
    }
    
    return seller
  } catch (error) {
    console.error('Unexpected error in getSellerProfileByUsernameClient:', error)
    return null
  }
}