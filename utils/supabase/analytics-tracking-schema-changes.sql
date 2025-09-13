-- =============================================
-- RENTPARLO.PK ANALYTICS TRACKING SCHEMA CHANGES
-- This file contains all the schema modifications needed
-- to implement the comprehensive analytics tracking system
-- =============================================

-- =============================================
-- 1. COLUMN MODIFICATIONS
-- =============================================

-- Add guest_id column to users table (if not already present)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS guest_id TEXT;

-- Make listing_id nullable in analytics_events table to allow profile view tracking
ALTER TABLE public.analytics_events 
ALTER COLUMN listing_id DROP NOT NULL;

-- Add metadata column to analytics_events table for storing additional event data
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add unique constraint for guest_id (excluding NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_id_unique 
ON public.users (guest_id) 
WHERE guest_id IS NOT NULL;

-- =============================================
-- 2. NEW TABLES
-- =============================================

-- BANNER IMPRESSION TRACKING
-- Tracks impressions (displays) of advertisement banners with detailed context
CREATE TABLE IF NOT EXISTS public.banner_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  placement TEXT NOT NULL, -- Placement location (homepage-top, category-sidebar, etc.)
  banner_size TEXT NOT NULL, -- Size of the banner (leaderboard, medium-rectangle, etc.)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID, -- For anonymous users
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT, -- e.g., "1920x1080"
  viewport_size TEXT, -- e.g., "1200x800"
  page_url TEXT, -- The page where the banner was displayed
  page_title TEXT, -- Title of the page
  category_context TEXT, -- Category context if applicable
  search_query TEXT, -- Search query if on search results page
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.banner_impressions IS 'Tracks impressions (displays) of advertisement banners with detailed context.';

-- BANNER CLICK TRACKING
-- Tracks clicks on advertisement banners with detailed context
CREATE TABLE IF NOT EXISTS public.banner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID,
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  placement TEXT,
  banner_size TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  browser TEXT,
  os TEXT,
  page_url TEXT,
  page_title TEXT,
  category_context TEXT,
  search_query TEXT,
  target_url TEXT, -- The URL the user was directed to
  time_on_page INTEGER, -- Seconds user spent on page before clicking
  scroll_depth INTEGER, -- Percentage of page scrolled before clicking
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.banner_clicks IS 'Tracks clicks on advertisement banners with detailed context.';

-- BANNER PERFORMANCE SUMMARY
-- Daily aggregated statistics for banner performance
CREATE TABLE IF NOT EXISTS public.banner_performance_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  placement TEXT NOT NULL,
  banner_size TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_impressions INTEGER DEFAULT 0, -- Unique users who saw the banner
  unique_clicks INTEGER DEFAULT 0, -- Unique users who clicked the banner
  ctr DECIMAL(5,4), -- Click-through rate
  avg_time_on_page INTEGER, -- Average time users spent on page
  avg_scroll_depth INTEGER, -- Average scroll depth percentage
  top_cities JSONB, -- Top cities by impressions
  top_devices JSONB, -- Top devices by impressions
  top_browsers JSONB, -- Top browsers by impressions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(banner_id, placement, date)
);
COMMENT ON TABLE public.banner_performance_daily IS 'Daily aggregated statistics for banner performance.';

-- =============================================
-- 3. INDEXES
-- =============================================

-- Banner impressions indexes
CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_id 
ON public.banner_impressions(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_placement 
ON public.banner_impressions(placement);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_size 
ON public.banner_impressions(banner_size);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_user_id 
ON public.banner_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_guest_id 
ON public.banner_impressions(guest_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_session_ref 
ON public.banner_impressions(session_ref);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_device_type 
ON public.banner_impressions(device_type);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_city 
ON public.banner_impressions(city);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_created_at 
ON public.banner_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_page_url 
ON public.banner_impressions(page_url);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_category_context 
ON public.banner_impressions(category_context);

-- Banner clicks indexes
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id 
ON public.banner_clicks(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_user_id 
ON public.banner_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_session_ref 
ON public.banner_clicks(session_ref);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_created_at 
ON public.banner_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_placement 
ON public.banner_clicks(placement);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_size 
ON public.banner_clicks(banner_size);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_city 
ON public.banner_clicks(city);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_device_type 
ON public.banner_clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_page_url 
ON public.banner_clicks(page_url);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_target_url 
ON public.banner_clicks(target_url);

-- Daily performance indexes
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_banner_id 
ON public.banner_performance_daily(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_placement 
ON public.banner_performance_daily(placement);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_date 
ON public.banner_performance_daily(date);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_ctr 
ON public.banner_performance_daily(ctr);

-- =============================================
-- 4. FUNCTIONS
-- =============================================

-- Function to calculate banner CTR (Click-Through Rate)
CREATE OR REPLACE FUNCTION public.calculate_banner_ctr(impressions INTEGER, clicks INTEGER)
RETURNS DECIMAL(5,4) AS $$
BEGIN
  IF impressions = 0 THEN
    RETURN 0.0000;
  ELSE
    RETURN ROUND((clicks::DECIMAL / impressions::DECIMAL) * 100, 4);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get banner analytics summary
CREATE OR REPLACE FUNCTION public.get_banner_analytics_summary(
  p_banner_id TEXT DEFAULT NULL,
  p_placement TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  banner_id TEXT,
  placement TEXT,
  total_impressions BIGINT,
  total_clicks BIGINT,
  unique_impressions BIGINT,
  unique_clicks BIGINT,
  ctr DECIMAL(5,4),
  avg_ctr DECIMAL(5,4),
  top_cities JSONB,
  top_devices JSONB,
  top_browsers JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.banner_id,
    bp.placement,
    SUM(bp.impressions)::BIGINT as total_impressions,
    SUM(bp.clicks)::BIGINT as total_clicks,
    SUM(bp.unique_impressions)::BIGINT as unique_impressions,
    SUM(bp.unique_clicks)::BIGINT as unique_clicks,
    public.calculate_banner_ctr(
      SUM(bp.impressions)::INTEGER,
      SUM(bp.clicks)::INTEGER
    ) as ctr,
    AVG(bp.ctr)::DECIMAL(5,4) as avg_ctr,
    '[]'::JSONB as top_cities,  -- Could be enhanced with actual aggregation
    '[]'::JSONB as top_devices, -- Could be enhanced with actual aggregation
    '[]'::JSONB as top_browsers -- Could be enhanced with actual aggregation
  FROM public.banner_performance_daily bp
  WHERE
    (p_banner_id IS NULL OR bp.banner_id = p_banner_id)
    AND (p_placement IS NULL OR bp.placement = p_placement)
    AND (p_start_date IS NULL OR bp.date >= p_start_date)
    AND (p_end_date IS NULL OR bp.date <= p_end_date)
  GROUP BY bp.banner_id, bp.placement;
END;
$$;

-- Enhanced registration function with better error handling
-- Updated to ensure guest_id is properly generated and stored
CREATE OR REPLACE FUNCTION public.register_user_with_validation(
    p_email TEXT,
    p_phone TEXT,
    p_name TEXT,
    p_city TEXT,
    p_role TEXT DEFAULT 'user'
)
RETURNS TABLE(
    success BOOLEAN,
    user_id UUID,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validate input
    IF p_email IS NULL OR p_email = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Email is required';
        RETURN;
    END IF;
    
    IF p_phone IS NULL OR p_phone = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Phone number is required';
        RETURN;
    END IF;
    
    IF p_name IS NULL OR p_name = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Name is required';
        RETURN;
    END IF;
    
    -- Check uniqueness
    DECLARE
        v_is_valid BOOLEAN;
        v_error_message TEXT;
    BEGIN
        SELECT is_valid, error_message 
        INTO v_is_valid, v_error_message
        FROM public.check_user_uniqueness(p_email, p_phone);
        
        IF NOT v_is_valid THEN
            RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
            RETURN;
        END IF;
    END;
    
    -- If we get here, create the user
    -- In a real implementation, this would also create the auth.user
    -- For now, we'll just insert into public.users
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified,
        guest_id -- Add guest_id to the insert
    )
    VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE,
        'guest-' || v_user_id::TEXT -- Generate guest_id based on user ID
    );
    
    RETURN QUERY SELECT TRUE, v_user_id, NULL;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Handle any unique constraint violations that might slip through
        RETURN QUERY SELECT FALSE, NULL::UUID, 'User with this email or phone already exists';
    WHEN check_violation THEN
        -- Handle validation constraint violations
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid email or phone format';
    WHEN OTHERS THEN
        -- Handle any other errors
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Registration failed: ' || SQLERRM;
END;
$$ SECURITY DEFINER;

-- Enhanced seller registration function with better error handling
-- Updated to ensure guest_id is properly handled
CREATE OR REPLACE FUNCTION public.register_seller_with_validation(
    p_email TEXT,
    p_phone TEXT,
    p_name TEXT,
    p_city TEXT,
    p_username TEXT,
    p_cnic TEXT,
    p_business_name TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    user_id UUID,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validate input
    IF p_email IS NULL OR p_email = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Email is required';
        RETURN;
    END IF;
    
    IF p_phone IS NULL OR p_phone = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Phone number is required';
        RETURN;
    END IF;
    
    IF p_name IS NULL OR p_name = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Name is required';
        RETURN;
    END IF;
    
    IF p_username IS NULL OR p_username = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Username is required';
        RETURN;
    END IF;
    
    IF p_cnic IS NULL OR p_cnic = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'CNIC number is required';
        RETURN;
    END IF;
    
    -- Check user uniqueness (email, phone)
    DECLARE
        v_is_valid BOOLEAN;
        v_error_message TEXT;
    BEGIN
        SELECT is_valid, error_message 
        INTO v_is_valid, v_error_message
        FROM public.check_user_uniqueness(p_email, p_phone);
        
        IF NOT v_is_valid THEN
            RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
            RETURN;
        END IF;
    END;
    
    -- Check seller uniqueness (username, CNIC)
    DECLARE
        v_is_valid BOOLEAN;
        v_error_message TEXT;
    BEGIN
        SELECT is_valid, error_message 
        INTO v_is_valid, v_error_message
        FROM public.check_seller_uniqueness(p_username, p_cnic);
        
        IF NOT v_is_valid THEN
            RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
            RETURN;
        END IF;
    END;
    
    -- If we get here, create the user and seller profile
    -- In a real implementation, this would also create the auth.user
    -- For now, we'll just insert into public.users and public.seller_profiles
    v_user_id := gen_random_uuid();
    
    -- Insert user with guest_id
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified,
        guest_id -- Add guest_id to the insert
    )
    VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE,
        'guest-' || v_user_id::TEXT -- Generate guest_id based on user ID
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    )
    VALUES (
        v_user_id, p_username, p_business_name, p_name, p_cnic,
        p_city, p_phone, p_email, FALSE, 'pending'
    );
    
    RETURN QUERY SELECT TRUE, v_user_id, NULL;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Handle any unique constraint violations that might slip through
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Seller with this email, phone, username, or CNIC already exists';
    WHEN check_violation THEN
        -- Handle validation constraint violations
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid data format provided';
    WHEN OTHERS THEN
        -- Handle any other errors
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Seller registration failed: ' || SQLERRM;
END;
$$ SECURITY DEFINER;

-- =============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN public.users.guest_id IS 'Unique identifier for anonymous users, persisted across sessions';
COMMENT ON COLUMN public.analytics_events.metadata IS 'Additional metadata about the event for flexible tracking';
COMMENT ON COLUMN public.banner_impressions.banner_id IS 'Sanity document ID of the banner';
COMMENT ON COLUMN public.banner_impressions.placement IS 'Placement location (homepage-top, category-sidebar, etc.)';
COMMENT ON COLUMN public.banner_impressions.banner_size IS 'Size of the banner (leaderboard, medium-rectangle, etc.)';
COMMENT ON COLUMN public.banner_impressions.guest_id IS 'Guest ID for anonymous users';
COMMENT ON COLUMN public.banner_impressions.session_ref IS 'Reference to user session';
COMMENT ON COLUMN public.banner_impressions.screen_resolution IS 'Screen resolution (e.g., "1920x1080")';
COMMENT ON COLUMN public.banner_impressions.viewport_size IS 'Viewport size (e.g., "1200x800")';
COMMENT ON COLUMN public.banner_impressions.page_url IS 'The page where the banner was displayed';
COMMENT ON COLUMN public.banner_impressions.page_title IS 'Title of the page';
COMMENT ON COLUMN public.banner_impressions.category_context IS 'Category context if applicable';
COMMENT ON COLUMN public.banner_impressions.search_query IS 'Search query if on search results page';
COMMENT ON COLUMN public.banner_clicks.banner_id IS 'Sanity document ID of the banner';
COMMENT ON COLUMN public.banner_clicks.guest_id IS 'Guest ID for anonymous users';
COMMENT ON COLUMN public.banner_clicks.session_ref IS 'Reference to user session';
COMMENT ON COLUMN public.banner_clicks.target_url IS 'The URL the user was directed to';
COMMENT ON COLUMN public.banner_clicks.time_on_page IS 'Seconds user spent on page before clicking';
COMMENT ON COLUMN public.banner_clicks.scroll_depth IS 'Percentage of page scrolled before clicking';
COMMENT ON COLUMN public.banner_performance_daily.banner_id IS 'Sanity document ID of the banner';
COMMENT ON COLUMN public.banner_performance_daily.placement IS 'Placement location';
COMMENT ON COLUMN public.banner_performance_daily.banner_size IS 'Size of the banner';
COMMENT ON COLUMN public.banner_performance_daily.impressions IS 'Total impressions';
COMMENT ON COLUMN public.banner_performance_daily.clicks IS 'Total clicks';
COMMENT ON COLUMN public.banner_performance_daily.unique_impressions IS 'Unique users who saw the banner';
COMMENT ON COLUMN public.banner_performance_daily.unique_clicks IS 'Unique users who clicked the banner';
COMMENT ON COLUMN public.banner_performance_daily.ctr IS 'Click-through rate';
COMMENT ON COLUMN public.banner_performance_daily.avg_time_on_page IS 'Average time users spent on page';
COMMENT ON COLUMN public.banner_performance_daily.avg_scroll_depth IS 'Average scroll depth percentage';
COMMENT ON COLUMN public.banner_performance_daily.top_cities IS 'Top cities by impressions';
COMMENT ON COLUMN public.banner_performance_daily.top_devices IS 'Top devices by impressions';
COMMENT ON COLUMN public.banner_performance_daily.top_browsers IS 'Top browsers by impressions';

-- =============================================
-- 6. GRANTS FOR FUNCTIONS
-- =============================================

-- Grants for new functions
GRANT EXECUTE ON FUNCTION public.calculate_banner_ctr TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_banner_analytics_summary TO authenticated;

-- =============================================
-- 7. MIGRATION NOTES
-- =============================================

/*
SUMMARY OF CHANGES:

1. COLUMN MODIFICATIONS:
   - Added guest_id column to users table for persistent anonymous user tracking
   - Made listing_id nullable in analytics_events to allow profile view tracking
   - Added metadata column to analytics_events for flexible event data storage

2. NEW TABLES:
   - banner_impressions: Tracks banner/advertisement displays with detailed context
   - banner_clicks: Tracks banner/advertisement clicks with detailed context
   - banner_performance_daily: Daily aggregated statistics for banner performance

3. INDEXES:
   - Added comprehensive indexes for all new tables to optimize query performance
   - Added indexes for guest_id, session_ref, and other frequently queried columns

4. FUNCTIONS:
   - calculate_banner_ctr: Calculates click-through rate for banners
   - get_banner_analytics_summary: Returns summary analytics for banners with filtering options
   - Enhanced registration functions to properly handle guest_id generation

5. COMMENTS:
   - Added detailed comments for all new columns and tables for documentation purposes

These changes enable comprehensive analytics tracking for:
- Listing views
- Seller profile views
- Contact interactions (calls, WhatsApp, email)
- Map clicks
- Banner impressions
- Banner clicks
- Search queries
- Share actions
- Save/favorite actions
- And more...

The system properly handles both authenticated users and anonymous visitors using persistent guest IDs.
*/