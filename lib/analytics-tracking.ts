/**
 * Comprehensive Analytics Tracking Utility
 * Handles tracking of all user interactions with listings, profiles, and banners
 * Properly tracks both authenticated users and guests using persistent IDs
 * Uses guest_id from user profiles when available for authenticated users
 */

import { createClient } from '@/utils/supabase/client';
import { getTrackingGuestId, getUserIdForTracking } from '@/lib/guest-id';

// Define event types
export type AnalyticsEventType = 
  | 'view'                    // Listing view
  | 'profile_view'            // Seller profile view
  | 'contact_click'           // Call button click
  | 'WhatsApp_click'          // WhatsApp button click
  | 'map_click'              // Map location click
  | 'banner_impression'      // Banner display
  | 'banner_click'           // Banner click
  | 'search'                 // Search query
  | 'share'                  // Share action
  | 'save'                   // Save/favorite action
  | 'listing_click';         // Click on listing card

// Base event data interface
interface BaseAnalyticsEvent {
  event_type: AnalyticsEventType;
  user_id?: string | null;
  guest_id?: string;
  session_ref?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

// Listing-specific event data
interface ListingEvent extends BaseAnalyticsEvent {
  listing_id?: string;
}

// Banner-specific event data
interface BannerEvent extends BaseAnalyticsEvent {
  banner_id?: string;
  placement?: string;
  banner_size?: string;
  target_url?: string;
  page_url?: string;
  page_title?: string;
  category_context?: string;
  search_query?: string;
}

// Combined event type
type AnalyticsEvent = ListingEvent | BannerEvent | BaseAnalyticsEvent;

/**
 * Get device information for tracking
 */
function getDeviceInfo(): {
  device_type: string;
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      device_type: 'unknown',
      browser: 'unknown',
      os: 'unknown'
    };
  }

  // Device type detection
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)) {
    device_type = 'mobile';
  } else if (/tablet|ipad/i.test(navigator.userAgent)) {
    device_type = 'tablet';
  }

  // Browser detection (simplified)
  let browser = 'unknown';
  if (navigator.userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (navigator.userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (navigator.userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (navigator.userAgent.indexOf('Edge') > -1) browser = 'Edge';

  // OS detection (simplified)
  let os = 'unknown';
  if (navigator.userAgent.indexOf('Win') > -1) os = 'Windows';
  else if (navigator.userAgent.indexOf('Mac') > -1) os = 'MacOS';
  else if (navigator.userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (navigator.userAgent.indexOf('Android') > -1) os = 'Android';
  else if (navigator.userAgent.indexOf('iPhone') > -1) os = 'iOS';

  return {
    device_type,
    browser,
    os
  };
}

/**
 * Track analytics event with comprehensive data
 * Automatically handles guest ID tracking for both authenticated and anonymous users
 */
export async function trackAnalyticsEvent(eventData: Partial<AnalyticsEvent>): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get user ID from session if not provided
    let userId = eventData.user_id;
    if (userId === undefined) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }
    
    // Get appropriate tracking ID (user ID for authenticated users, guest ID for anonymous)
    const trackingId = await getUserIdForTracking(userId);
    
    // Determine if this is a guest user
    const isGuest = !userId;
    
    // Get guest ID for tracking (from user profile for authenticated users, or generated for anonymous)
    const guestId = await getTrackingGuestId();
    
    // Get device information
    const deviceInfo = getDeviceInfo();
    
    // Prepare the event data
    const event: Partial<AnalyticsEvent> = {
      ...eventData,
      user_id: userId || undefined,
      guest_id: guestId, // Always include guest ID for proper tracking
      ...deviceInfo,
      created_at: new Date().toISOString(),
      ...eventData.metadata // Include any additional metadata
    };
    
    // Insert the event into the database
    const { error } = await supabase
      .from('analytics_events')
      .insert([event]);
    
    if (error) {
      console.error('Error tracking analytics event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
}

/**
 * Track listing view
 */
export async function trackListingView(listingId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'view',
    listing_id: listingId,
    user_id: userId || undefined
  });
}

/**
 * Track seller profile view
 */
export async function trackProfileView(sellerId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'profile_view',
    user_id: userId || undefined,
    metadata: { seller_id: sellerId }
  });
}

/**
 * Track contact click (call button)
 */
export async function trackContactClick(listingId: string, sellerId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'contact_click',
    listing_id: listingId,
    user_id: userId || undefined,
    metadata: { seller_id, contact_method: 'call' }
  });
}

/**
 * Track WhatsApp click
 */
export async function trackWhatsAppClick(listingId: string, sellerId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'WhatsApp_click',
    listing_id: listingId,
    user_id: userId || undefined,
    metadata: { seller_id, contact_method: 'whatsapp' }
  });
}

/**
 * Track map click
 */
export async function trackMapClick(listingId: string, sellerId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'map_click',
    listing_id: listingId,
    user_id: userId || undefined,
    metadata: { seller_id, contact_method: 'map' }
  });
}

/**
 * Track banner impression
 */
export async function trackBannerImpression(bannerId: string, placement: string, bannerSize: string, userId?: string | null): Promise<boolean> {
  // Get page context
  let pageUrl = '';
  let pageTitle = '';
  let categoryContext = '';
  let searchQuery = '';
  
  if (typeof window !== 'undefined') {
    pageUrl = window.location.href;
    pageTitle = document.title;
    
    // Extract category context from URL if on category page
    const categoryMatch = window.location.pathname.match(/\/category\/([^\/]+)/);
    if (categoryMatch) {
      categoryContext = categoryMatch[1];
    }
    
    // Extract search query from URL if on search page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
      searchQuery = urlParams.get('q') || '';
    }
  }
  
  return trackAnalyticsEvent({
    event_type: 'banner_impression',
    banner_id: bannerId,
    placement,
    banner_size: bannerSize,
    page_url: pageUrl,
    page_title: pageTitle,
    category_context: categoryContext,
    search_query: searchQuery,
    user_id: userId || undefined
  });
}

/**
 * Track banner click
 */
export async function trackBannerClick(bannerId: string, placement: string, bannerSize: string, targetUrl: string, userId?: string | null): Promise<boolean> {
  // Get page context
  let pageUrl = '';
  let pageTitle = '';
  let categoryContext = '';
  let searchQuery = '';
  
  if (typeof window !== 'undefined') {
    pageUrl = window.location.href;
    pageTitle = document.title;
    
    // Extract category context from URL if on category page
    const categoryMatch = window.location.pathname.match(/\/category\/([^\/]+)/);
    if (categoryMatch) {
      categoryContext = categoryMatch[1];
    }
    
    // Extract search query from URL if on search page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
      searchQuery = urlParams.get('q') || '';
    }
  }
  
  return trackAnalyticsEvent({
    event_type: 'banner_click',
    banner_id: bannerId,
    placement,
    banner_size: bannerSize,
    target_url: targetUrl,
    page_url: pageUrl,
    page_title: pageTitle,
    category_context: categoryContext,
    search_query: searchQuery,
    user_id: userId || undefined
  });
}

/**
 * Track search query
 */
export async function trackSearch(query: string, filters?: Record<string, any>, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'search',
    user_id: userId || undefined,
    metadata: { 
      query,
      filters
    }
  });
}

/**
 * Track share action
 */
export async function trackShare(listingId: string, platform: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'share',
    listing_id: listingId,
    user_id: userId || undefined,
    metadata: { platform }
  });
}

/**
 * Track save/favorite action
 */
export async function trackSave(listingId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'save',
    listing_id: listingId,
    user_id: userId || undefined
  });
}

/**
 * Track listing click (click on listing card)
 */
export async function trackListingClick(listingId: string, userId?: string | null): Promise<boolean> {
  return trackAnalyticsEvent({
    event_type: 'listing_click',
    listing_id: listingId,
    user_id: userId || undefined
  });
}

// Export all functions as a default object for easy importing
export default {
  trackAnalyticsEvent,
  trackListingView,
  trackProfileView,
  trackContactClick,
  trackWhatsAppClick,
  trackMapClick,
  trackBannerImpression,
  trackBannerClick,
  trackSearch,
  trackShare,
  trackSave,
  trackListingClick
};