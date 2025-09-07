// Banner Analytics Tracking System
// Integrates with existing Supabase schema and Sanity CMS

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface BannerImpressionData {
  banner_id: string;
  placement: string;
  banner_size: string;
  user_id?: string;
  guest_id?: string;
  session_ref?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  viewport_size?: string;
  page_url?: string;
  page_title?: string;
  category_context?: string;
  search_query?: string;
}

interface BannerClickData extends BannerImpressionData {
  target_url?: string;
  time_on_page?: number;
  scroll_depth?: number;
}

/**
 * Track banner impression (when banner is displayed)
 */
export async function trackBannerImpression(data: BannerImpressionData): Promise<void> {
  try {
    const supabase = createClient();
    
    // Insert impression data
    const { error } = await supabase
      .from('banner_impressions')
      .insert([data]);
    
    if (error) {
      console.error('Error tracking banner impression:', error);
    }
  } catch (error) {
    console.error('Error tracking banner impression:', error);
  }
}

/**
 * Track banner click (when user clicks on banner)
 */
export async function trackBannerClick(data: BannerClickData): Promise<void> {
  try {
    const supabase = createClient();
    
    // Insert click data
    const { error } = await supabase
      .from('banner_clicks')
      .insert([data]);
    
    if (error) {
      console.error('Error tracking banner click:', error);
    }
  } catch (error) {
    console.error('Error tracking banner click:', error);
  }
}

/**
 * Get banner analytics summary
 */
export async function getBannerAnalyticsSummary(
  bannerId?: string,
  placement?: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  try {
    const supabase = createClient();
    
    // Call the analytics summary function
    const { data, error } = await supabase.rpc('get_banner_analytics_summary', {
      p_banner_id: bannerId,
      p_placement: placement,
      p_start_date: startDate,
      p_end_date: endDate
    });
    
    if (error) {
      console.error('Error getting banner analytics summary:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting banner analytics summary:', error);
    return null;
  }
}

/**
 * Get detailed banner performance data
 */
export async function getBannerPerformanceData(
  bannerId?: string,
  placement?: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('banner_performance_daily')
      .select('*');
    
    if (bannerId) {
      query = query.eq('banner_id', bannerId);
    }
    
    if (placement) {
      query = query.eq('placement', placement);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error getting banner performance data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting banner performance data:', error);
    return null;
  }
}

/**
 * Calculate CTR (Click-Through Rate)
 */
export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return parseFloat(((clicks / impressions) * 100).toFixed(4));
}

/**
 * Get user device information for tracking
 */
export function getUserDeviceInfo(): {
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  viewport_size: string;
} {
  if (typeof window === 'undefined') {
    return {
      device_type: 'unknown',
      browser: 'unknown',
      os: 'unknown',
      screen_resolution: 'unknown',
      viewport_size: 'unknown'
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
  
  // Screen resolution
  const screen_resolution = `${window.screen.width}x${window.screen.height}`;
  
  // Viewport size
  const viewport_size = `${window.innerWidth}x${window.innerHeight}`;
  
  return {
    device_type,
    browser,
    os,
    screen_resolution,
    viewport_size
  };
}

/**
 * Get page context information for tracking
 */
export function getPageContext(): {
  page_url: string;
  page_title: string;
  referrer: string;
  category_context?: string;
  search_query?: string;
} {
  if (typeof window === 'undefined') {
    return {
      page_url: 'unknown',
      page_title: 'unknown',
      referrer: 'unknown'
    };
  }
  
  // Extract category context from URL if on category page
  let category_context: string | undefined;
  const categoryMatch = window.location.pathname.match(/\/category\/([^\/]+)/);
  if (categoryMatch) {
    category_context = categoryMatch[1];
  }
  
  // Extract search query from URL if on search page
  let search_query: string | undefined;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('q')) {
    search_query = urlParams.get('q') || undefined;
  }
  
  return {
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
    category_context,
    search_query
  };
}

/**
 * Initialize banner tracking data
 */
export function initializeBannerTrackingData(
  bannerId: string,
  placement: string,
  bannerSize: string,
  userId?: string,
  sessionId?: string
): BannerImpressionData {
  const deviceInfo = getUserDeviceInfo();
  const pageContext = getPageContext();
  
  return {
    banner_id: bannerId,
    placement: placement,
    banner_size: bannerSize,
    user_id: userId,
    session_ref: sessionId,
    ip_address: undefined, // Server-side only
    ...deviceInfo,
    ...pageContext,
    created_at: new Date().toISOString()
  };
}