/**
 * =====================================================
 * RentParlo.pk Supabase Database Queries (Client-Side)
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
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        ...eventData,
        timestamp: new Date().toISOString()
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