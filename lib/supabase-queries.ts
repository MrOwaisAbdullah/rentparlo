/**
 * =====================================================
 * RentParlo.pk Supabase Database Queries
 * =====================================================
 * Comprehensive collection of Supabase queries for user management,
 * analytics, seller operations, and database interactions
 */

export { validateListingData, getSellerDashboardData } from './supabase-queries-missing';

import { createClient } from '../utils/supabase/server'
import { createClient as createBrowserClient } from '../utils/supabase/client'
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

// Helper function to determine which client to use
function getSupabaseClient() {
  // In server components, we can use cookies, so we use the server client
  // In client components, we use the browser client
  // For now, we'll default to server client but this can be enhanced
  return createClient()
}

// Client-side version for use in client components
function getBrowserSupabaseClient() {
  return createBrowserClient()
}

/**
 * =====================================================
 * USER QUERIES
 * =====================================================
 */

// Get user by ID with full profile information
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient()
  
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

  console.log('User data fetched:', data); // Debugging
  return data
}

// Client-side version of getUserById for use in client components
export async function getUserByIdClient(userId: string): Promise<User | null> {
  const supabase = createBrowserClient()
  
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

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    // Don't log as error if user simply doesn't exist
    if (error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error)
    }
    return null
  }

  return data
}

// Create or update user profile
export async function upsertUser(userData: Partial<User>): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .upsert(userData)
    .select()
    .single()

  if (error) {
    console.error('Error upserting user:', error)
    return null
  }

  return data
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    return false
  }

  return true
}

// Update user last login
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update({
      last_login: new Date().toISOString(),
      login_count: supabase.rpc('increment_login_count', { user_id: userId })
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating last login:', error)
    return false
  }

  return true
}

/**
 * =====================================================
 * SELLER PROFILE QUERIES
 * =====================================================
 */

// Get seller profile by user ID
export async function getSellerProfile(userId: string): Promise<SellerProfile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // Don't log as error if seller profile simply doesn't exist - this is expected in many cases
    if (error.code !== 'PGRST116') {
      console.error('Error fetching seller profile:', error)
    }
    return null
  }

  console.log('Seller profile data fetched:', data); // Debugging
  return data
}

// Get seller profile by username
export async function getSellerProfileByUsername(username: string): Promise<Seller | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(`
      *,
      users (*)
    `)
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching seller by username:', error)
    return null
  }

  // Check if data exists
  if (!data) {
    return null
  }

  // Transform the data to match our Seller type
  // The users data is nested under data.users due to the join
  const seller: Seller = {
    ...(data.users || {}),
    guest_id: data.users?.guest_id || null,
    profile: data
  }

  return seller
}

// Create seller profile
export async function createSellerProfile(profileData: Partial<SellerProfile>): Promise<SellerProfile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Error creating seller profile:', error)
    return null
  }

  return data
}

// Update seller profile
export async function updateSellerProfile(userId: string, updates: Partial<SellerProfile>): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('seller_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating seller profile:', error)
    return false
  }

  return true
}

// Get top sellers with tier information
export async function getTopSellers(limit: number = 10): Promise<SellerProfile[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(`
      *,
      users!seller_profiles_id_fkey (
        name,
        email,
        city,
        is_verified
      )
    `)
    .eq('is_verified', true)
    .order('tier_points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top sellers:', error)
    return []
  }

  return data || []
}

// Update seller tier
export async function updateSellerTier(
  sellerId: string, 
  newTier: string, 
  newPoints: number,
  reason?: string
): Promise<boolean> {
  const supabase = await createClient()

  // Get current tier for history
  const { data: currentProfile } = await supabase
    .from('seller_profiles')
    .select('tier, tier_points')
    .eq('id', sellerId)
    .single()

  if (!currentProfile) return false

  // Update seller profile
  const { error: updateError } = await supabase
    .from('seller_profiles')
    .update({
      tier: newTier,
      tier_points: newPoints,
      tier_last_updated: new Date().toISOString()
    })
    .eq('id', sellerId)

  if (updateError) {
    console.error('Error updating seller tier:', updateError)
    return false
  }

  // Add tier history record
  const { error: historyError } = await supabase
    .from('seller_tier_history')
    .insert({
      seller_id: sellerId,
      old_tier: currentProfile.tier,
      new_tier: newTier,
      points_change: newPoints - currentProfile.tier_points,
      reason: reason || 'Automatic tier update'
    })

  if (historyError) {
    console.error('Error creating tier history:', historyError)
  }

  return true
}

/**
 * =====================================================
 * ANALYTICS QUERIES
 * =====================================================
 */

// Track analytics event with session support
export async function trackAnalyticsEvent(eventData: Partial<AnalyticsEvent> & {
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}): Promise<boolean> {
  try {
    const supabase = await createClient() // Use server client for proper authentication
    
    let sessionId = eventData.session_id;
    
    // Get or create session if not provided and we have enough data
    if (!sessionId && (eventData.user_id || eventData.guest_id)) {
      try {
        const { data: session, error: sessionError } = await supabase.rpc('get_or_create_session', {
          p_user_id: eventData.user_id || null,
          p_guest_id: eventData.guest_id || null,
          p_ip_address: eventData.ip_address || null,
          p_user_agent: eventData.user_agent || null,
          p_referrer: eventData.referrer || null
        });
        
        if (!sessionError && session) {
          sessionId = session;
        }
      } catch (error) {
        console.warn('Session creation failed, tracking without session:', error);
      }
    }
    
    // For server-side tracking, we want to ensure we always have a guest_id
    // If we have a user_id, we still want to track the guest_id for continuity
    let guestId = eventData.guest_id;
    
    // If we have a user_id but no guest_id, try to get it from the user profile
    if (eventData.user_id && !guestId) {
      try {
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('guest_id')
          .eq('id', eventData.user_id)
          .single();
        
        if (!userError && userProfile?.guest_id) {
          guestId = userProfile.guest_id;
        }
      } catch (error) {
        console.warn('Could not fetch user profile guest_id:', error);
      }
    }
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        ...eventData,
        guest_id: guestId, // Ensure guest_id is always set
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

// Get listing analytics with enhanced session data
export async function getListingAnalytics(listingId: string, days: number = 30): Promise<ListingAnalytics & {
  uniqueSessions?: number;
  uniqueUsers?: number;
  avgSessionDuration?: number;
  bounceRate?: number;
}> {
  const supabase = await createClient()
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Try to use enhanced analytics view first
  const { data: enhancedData, error: enhancedError } = await supabase
    .from('enhanced_seller_analytics')
    .select('*')
    .eq('listing_id', listingId)
    .gte('event_date', startDate.toISOString().split('T')[0]);

  if (!enhancedError && enhancedData && enhancedData.length > 0) {
    // Aggregate enhanced data
    const totals = enhancedData.reduce((acc, day) => ({
      views: acc.views + (day.total_views || 0),
      contactClicks: acc.contactClicks + (day.contact_clicks || 0),
      whatsappClicks: acc.whatsappClicks + (day.whatsapp_clicks || 0),
      impressions: acc.impressions + (day.shares || 0), // Using shares as impressions for now
      listingClicks: acc.listingClicks + (day.total_views || 0), // Views as listing clicks
      uniqueSessions: acc.uniqueSessions + (day.unique_sessions || 0),
      uniqueUsers: acc.uniqueUsers + (day.unique_users || 0),
      totalSessionDuration: acc.totalSessionDuration + (day.avg_session_duration || 0),
      bounceSessions: acc.bounceSessions + (day.bounce_sessions || 0)
    }), {
      views: 0,
      contactClicks: 0,
      whatsappClicks: 0,
      impressions: 0,
      listingClicks: 0,
      uniqueSessions: 0,
      uniqueUsers: 0,
      totalSessionDuration: 0,
      bounceSessions: 0
    });

    return {
      ...totals,
      avgSessionDuration: enhancedData.length > 0 ? totals.totalSessionDuration / enhancedData.length : 0,
      bounceRate: totals.uniqueSessions > 0 ? (totals.bounceSessions / totals.uniqueSessions) * 100 : 0
    };
  }

  // Fallback to original analytics query
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, user_id, guest_id, session_ref')
    .eq('listing_id', listingId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching listing analytics:', error)
    return {
      views: 0,
      contactClicks: 0,
      whatsappClicks: 0,
      impressions: 0,
      listingClicks: 0,
      uniqueSessions: 0,
      uniqueUsers: 0
    }
  }

  const analytics = data.reduce((acc, event) => {
    switch (event.event_type) {
      case 'view':
        acc.views++
        break
      case 'contact_click':
        acc.contactClicks++
        break
      case 'WhatsApp_click':
        acc.whatsappClicks++
        break
      case 'impressions':
        acc.impressions++
        break
      case 'listing_click':
        acc.listingClicks++
        break
    }
    return acc
  }, {
    views: 0,
    contactClicks: 0,
    whatsappClicks: 0,
    impressions: 0,
    listingClicks: 0
  })

  // Calculate unique sessions and users
  const uniqueSessions = new Set(data.filter(e => e.session_ref).map(e => e.session_ref)).size;
  const uniqueUsers = new Set(data.filter(e => e.user_id).map(e => e.user_id)).size;

  return {
    ...analytics,
    uniqueSessions,
    uniqueUsers
  }
}

// Get seller analytics
export async function getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
  const supabase = await createClient()
  
  // Get analytics events for seller's listings
  const { data: analyticsData, error: analyticsError } = await supabase
    .rpc('get_seller_analytics', { seller_id: sellerId })

  if (analyticsError) {
    console.error('Error fetching seller analytics:', analyticsError)
  }

  // Get listing counts
  const { count: totalListings } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact' })
    .eq('user_id', sellerId)

  const { count: activeListings } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact' })
    .eq('user_id', sellerId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  return {
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    totalViews: analyticsData?.total_views || 0,
    totalContactClicks: analyticsData?.total_contact_clicks || 0,
    totalWhatsAppClicks: analyticsData?.total_whatsapp_clicks || 0,
    topListings: analyticsData?.top_listings || [],
    viewsByDay: analyticsData?.views_by_day || []
  }
}

// Get analytics for date range
export async function getAnalyticsForDateRange(
  startDate: string,
  endDate: string,
  sellerId?: string
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (sellerId) {
    query = query.eq('user_id', sellerId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching analytics for date range:', error)
    return []
  }

  return data || []
}

/**
 * =====================================================
 * SUBSCRIPTION QUERIES
 * =====================================================
 */

// Get all subscription packages
export async function getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching subscription packages:', error)
    return []
  }

  return data || []
}

// Get user's active subscription
export async function getUserActiveSubscription(userId: string): Promise<EnhancedUserSubscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_packages (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
    .single()

  if (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }

  return data
}

// Create user subscription
export async function createUserSubscription(subscriptionData: Partial<UserSubscription>): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_subscriptions')
    .insert(subscriptionData)

  if (error) {
    console.error('Error creating user subscription:', error)
    return false
  }

  return true
}

/**
 * =====================================================
 * SUPPORT TICKET QUERIES
 * =====================================================
 */

// Create support ticket
export async function createSupportTicket(ticketData: Partial<SupportTicket>): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('support_tickets')
    .insert(ticketData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating support ticket:', error)
    return null
  }

  return data.id
}

// Get user's support tickets
export async function getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user support tickets:', error)
    return []
  }

  return data || []
}

// Update support ticket status
export async function updateSupportTicketStatus(
  ticketId: string, 
  status: string, 
  assignedTo?: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (assignedTo) {
    updates.assigned_to = assignedTo
  }

  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)

  if (error) {
    console.error('Error updating support ticket:', error)
    return false
  }

  return true
}

/**
 * =====================================================
 * AFFILIATE PROGRAM QUERIES
 * =====================================================
 */

// Get seller's affiliate codes
export async function getSellerAffiliateCodes(sellerId: string): Promise<AffiliateCode[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('affiliate_codes')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching affiliate codes:', error)
    return []
  }

  return data || []
}

// Create affiliate code
export async function createAffiliateCode(codeData: Partial<AffiliateCode>): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('affiliate_codes')
    .insert(codeData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating affiliate code:', error)
    return null
  }

  return data.id
}

// Get affiliate code by code string
export async function getAffiliateCodeByCode(code: string): Promise<AffiliateCode | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('affiliate_codes')
    .select('*')
    .eq('code', code)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching affiliate code:', error)
    return null
  }

  return data
}

// Create affiliate referral
export async function createAffiliateReferral(referralData: Partial<AffiliateReferral>): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('affiliate_referrals')
    .insert(referralData)

  if (error) {
    console.error('Error creating affiliate referral:', error)
    return false
  }

  return true
}

/**
 * =====================================================
 * AUTHENTICATION LOG QUERIES
 * =====================================================
 */

// Log authentication event
export async function logAuthEvent(
  userId: string | null,
  action: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('auth_logs')
    .insert({
      user_id: userId,
      action,
      success,
      ip_address: ipAddress,
      user_agent: userAgent,
      error_message: errorMessage
    })

  if (error) {
    console.error('Error logging auth event:', error)
    return false
  }

  return true
}

// Get user's recent auth logs
export async function getUserAuthLogs(userId: string, limit: number = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('auth_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching auth logs:', error)
    return []
  }

  return data || []
}

/**
 * =====================================================
 * UTILITY FUNCTIONS
 * =====================================================
 */

// Check if username is available
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const supabase = await createClient()
  
  let query = supabase
    .from('seller_profiles')
    .select('id')
    .eq('username', username)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query.single()

  if (error && error.code === 'PGRST116') {
    // No rows returned, username is available
    return true
  }

  return false
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription: EnhancedUserSubscription | null = await getUserActiveSubscription(userId)
  return !!subscription
}

// Get Pakistani cities
export async function getPakistaniCities() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching cities:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return []
  }

  return data || []
}

// Alias for getCities (used in search page)
export const getCities = getPakistaniCities;

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * =====================================================
 * REAL-TIME SUBSCRIPTIONS
 * =====================================================
 */

// Subscribe to analytics events for a seller
export function subscribeToSellerAnalytics(
  sellerId: string, 
  onUpdate: (payload: any) => void
) {
  const supabase = createBrowserClient()
  
  return supabase
    .channel(`seller_analytics_${sellerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'analytics_events',
        filter: `user_id=eq.${sellerId}`
      },
      onUpdate
    )
    .subscribe()
}

// Subscribe to support ticket updates
export function subscribeToSupportTickets(
  userId: string,
  onUpdate: (payload: any) => void
) {
  const supabase = createBrowserClient()
  
  return supabase
    .channel(`support_tickets_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'support_tickets',
        filter: `user_id=eq.${userId}`
      },
      onUpdate
    )
    .subscribe()
}