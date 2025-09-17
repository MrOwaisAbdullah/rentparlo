-- =============================================
-- RENTPARLO.PK COMPLETE SUPABASE SCHEMA
-- Consolidated for a clean start
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLE CREATIONS
-- =============================================

-- USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  city TEXT,
  area TEXT,
  state TEXT,
  country TEXT DEFAULT 'Pakistan',
  last_location GEOGRAPHY(POINT, 4326),
  active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  bio TEXT,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending', 'deactivated')),
  onboarding_completed BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visible": true, "contact_info_visible": false}'::jsonb,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ur')),
  timezone TEXT DEFAULT 'Asia/Karachi',
  guest_id TEXT -- Add guest_id column that was missing
);

-- SESSION MANAGEMENT
CREATE TABLE public.event_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  session_duration INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 1,
  is_bounce BOOLEAN DEFAULT false,
  ended_at TIMESTAMPTZ
);

-- GUEST TRACKING
CREATE TABLE public.user_guest_tracking (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (user_id, guest_id)
);

-- SELLER PROFILES
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  business_name TEXT,
  owner_name TEXT,
  verification_documents JSONB DEFAULT '{"cnic_front": null, "cnic_back": null}'::jsonb,
  owner_cnic TEXT UNIQUE,
  address_line1 TEXT,
  city TEXT,
  area TEXT,
  state TEXT,
  country TEXT DEFAULT 'Pakistan',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  whatsapp TEXT,
  map_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_top_seller BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'bronze', 'silver', 'gold', 'platinum')),
  tier_points INTEGER DEFAULT 0,
  tier_last_updated TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  business_type TEXT,
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}}'::jsonb,
  response_time_avg INTEGER DEFAULT 0,
  customer_rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  referral_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SELLER TIER HISTORY
CREATE TABLE public.seller_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  old_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  reason TEXT,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTION PACKAGES
CREATE TABLE public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'PKR',
  max_listings INTEGER NOT NULL,
  max_featured_listings INTEGER DEFAULT 0,
  analytics_days INTEGER DEFAULT 90,
  features JSONB DEFAULT '{"priority_support": false, "advanced_analytics": false, "location_boost": false, "featured_listing": false, "listing_priority": 1, "category_priority_placement": false, "search_top_placement": false, "guaranteed_top_placement": false, "custom_analytics_reports": false}'::jsonb,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SUBSCRIPTIONS
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.subscription_packages(id),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  transaction_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, package_id)
);

-- ANALYTICS EVENTS
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT, -- Made nullable to allow profile view tracking
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'profile_view', 'contact_click', 'WhatsApp_click', 'map_click', 'banner_impression', 'banner_click', 'search', 'share', 'save', 'listing_click')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id TEXT,
  session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  metadata JSONB, -- Add metadata column for storing additional event data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNER IMPRESSION TRACKING
CREATE TABLE public.banner_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  placement TEXT, -- Placement location (homepage-top, category-sidebar, etc.)
  banner_size TEXT, -- Size of the banner (leaderboard, medium-rectangle, etc.)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id TEXT, -- For anonymous users
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
CREATE TABLE public.banner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL, -- Sanity document ID
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id TEXT,
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
CREATE TABLE public.banner_performance_daily (
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

-- Cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  province TEXT
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTHENTICATION LOGS
CREATE TABLE public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'register', 'failed_login', 'password_reset', 'email_verified', 'google_oauth_initiated', 'google_oauth_failed', 'google_oauth_exception')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CONSTRAINTS
-- =============================================

-- CNIC validation for seller_profiles
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic CHECK (owner_cnic ~ '^[0-9+]{5}-[0-9+]{7}-[0-9]{1}');

-- =============================================
-- 3. INDEXES
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_users_location ON public.users USING GIST (last_location);

-- Session indexes
CREATE INDEX idx_event_sessions_user ON public.event_sessions(user_id);
CREATE INDEX idx_event_sessions_guest ON public.event_sessions(guest_id);
CREATE INDEX idx_event_sessions_created ON public.event_sessions(created_at);
CREATE INDEX idx_event_sessions_active ON public.event_sessions(last_active) WHERE ended_at IS NULL;

-- Guest tracking indexes
CREATE INDEX idx_user_guest_tracking_user ON public.user_guest_tracking(user_id);
CREATE INDEX idx_user_guest_tracking_guest ON public.user_guest_tracking(guest_id);
CREATE INDEX idx_user_guest_tracking_active ON public.user_guest_tracking(user_id) WHERE is_active = true;

-- Seller indexes
CREATE INDEX idx_seller_profiles_verification ON public.seller_profiles(verification_status);
CREATE INDEX idx_seller_profiles_tier ON public.seller_profiles(tier);
CREATE INDEX idx_seller_profiles_points ON public.seller_profiles(tier_points);
CREATE INDEX idx_tier_history_seller ON public.seller_tier_history(seller_id);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_subscriptions_active ON public.user_subscriptions(user_id) WHERE status = 'active';
CREATE UNIQUE INDEX idx_subscription_packages_name ON public.subscription_packages(name);
CREATE UNIQUE INDEX idx_user_subscriptions_user_package ON public.user_subscriptions(user_id, package_id);

-- Analytics indexes
CREATE INDEX idx_analytics_listing ON public.analytics_events(listing_id);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_session_ref ON public.analytics_events(session_ref);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_time ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_listing_type ON public.analytics_events(listing_id, event_type);

-- Banner impressions indexes
CREATE INDEX idx_banner_impressions_banner_id ON public.banner_impressions(banner_id);
CREATE INDEX idx_banner_impressions_placement ON public.banner_impressions(placement);
CREATE INDEX idx_banner_impressions_banner_size ON public.banner_impressions(banner_size);
CREATE INDEX idx_banner_impressions_user_id ON public.banner_impressions(user_id);
CREATE INDEX idx_banner_impressions_guest_id ON public.banner_impressions(guest_id);
CREATE INDEX idx_banner_impressions_session_ref ON public.banner_impressions(session_ref);
CREATE INDEX idx_banner_impressions_device_type ON public.banner_impressions(device_type);
CREATE INDEX idx_banner_impressions_city ON public.banner_impressions(city);
CREATE INDEX idx_banner_impressions_created_at ON public.banner_impressions(created_at);
CREATE INDEX idx_banner_impressions_page_url ON public.banner_impressions(page_url);
CREATE INDEX idx_banner_impressions_category_context ON public.banner_impressions(category_context);

-- Banner clicks indexes
CREATE INDEX idx_banner_clicks_banner_id ON public.banner_clicks(banner_id);
CREATE INDEX idx_banner_clicks_user_id ON public.banner_clicks(user_id);
CREATE INDEX idx_banner_clicks_session_ref ON public.banner_clicks(session_ref);
CREATE INDEX idx_banner_clicks_created_at ON public.banner_clicks(created_at);
CREATE INDEX idx_banner_clicks_placement ON public.banner_clicks(placement);
CREATE INDEX idx_banner_clicks_banner_size ON public.banner_clicks(banner_size);
CREATE INDEX idx_banner_clicks_city ON public.banner_clicks(city);
CREATE INDEX idx_banner_clicks_device_type ON public.banner_clicks(device_type);
CREATE INDEX idx_banner_clicks_page_url ON public.banner_clicks(page_url);
CREATE INDEX idx_banner_clicks_target_url ON public.banner_clicks(target_url);

-- Daily performance indexes
CREATE INDEX idx_banner_performance_daily_banner_id ON public.banner_performance_daily(banner_id);
CREATE INDEX idx_banner_performance_daily_placement ON public.banner_performance_daily(placement);
CREATE INDEX idx_banner_performance_daily_date ON public.banner_performance_daily(date);
CREATE INDEX idx_banner_performance_daily_ctr ON public.banner_performance_daily(ctr);

-- Support indexes
CREATE INDEX idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);

-- Cities indexes
CREATE INDEX idx_cities_name ON public.cities(name);
CREATE INDEX idx_cities_province ON public.cities(province);

-- Auth logs indexes
CREATE INDEX idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX idx_auth_logs_success ON public.auth_logs(success);
CREATE INDEX idx_auth_logs_created_at ON public.auth_logs(created_at);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_guest_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can view basic user info" ON public.users
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert their own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Session policies
CREATE POLICY "Admins can manage sessions" ON public.event_sessions
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Anyone can create sessions" ON public.event_sessions
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.event_sessions
  FOR UPDATE TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Guest tracking policies
CREATE POLICY "Users can view own guest tracking" ON public.user_guest_tracking
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can create guest tracking" ON public.user_guest_tracking
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);
CREATE POLICY "Anyone can update guest tracking" ON public.user_guest_tracking
  FOR UPDATE TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Seller policies
CREATE POLICY "Anyone can view seller profiles" ON public.seller_profiles
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Sellers can manage own profile" ON public.seller_profiles
  FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can manage seller profiles" ON public.seller_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Authenticated users can insert their own seller profile" ON public.seller_profiles
  FOR INSERT TO public
  WITH CHECK (id = auth.uid());

-- Subscription policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Analytics policies
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Sellers can view own analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Anyone can track analytics events" ON public.analytics_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);
CREATE POLICY "Anyone can update analytics events" ON public.analytics_events
  FOR UPDATE TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Banner Click policies
CREATE POLICY "Anyone can track banner clicks" ON public.banner_clicks
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);
CREATE POLICY "Admins can view banner clicks" ON public.banner_clicks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Banner impressions policies
CREATE POLICY "Admins can manage banner impressions" ON public.banner_impressions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can track banner impressions" ON public.banner_impressions
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Daily performance policies
CREATE POLICY "Admins can manage banner performance daily" ON public.banner_performance_daily
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Support policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Cities policies
CREATE POLICY "Anyone can view cities" ON public.cities
  FOR SELECT TO authenticated, anon USING (true);

-- =============================================
-- 5. FUNCTIONS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Session management function
CREATE OR REPLACE FUNCTION public.get_or_create_session(
  p_user_id UUID DEFAULT NULL,
  p_guest_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
  v_session_id UUID;
  v_existing_session UUID;
BEGIN
  -- Find existing session
  SELECT session_id INTO v_existing_session
  FROM public.event_sessions
  WHERE
    (p_user_id IS NOT NULL AND user_id = p_user_id OR p_guest_id IS NOT NULL AND guest_id = p_guest_id)
    AND last_active > NOW() - INTERVAL '30 minutes'
    AND ended_at IS NULL
  ORDER BY last_active DESC
  LIMIT 1;

  IF v_existing_session IS NOT NULL THEN
    UPDATE public.event_sessions
    SET last_active = NOW(), page_views = page_views + 1
    WHERE session_id = v_existing_session;
    RETURN v_existing_session;
  ELSE
    v_session_id := gen_random_uuid();
    INSERT INTO public.event_sessions (session_id, user_id, guest_id, ip_address, user_agent, referrer)
    VALUES (v_session_id, p_user_id, p_guest_id, p_ip_address, p_user_agent, p_referrer);
    RETURN v_session_id;
  END IF;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- End session function
CREATE OR REPLACE FUNCTION public.end_session(p_session_id UUID)
RETURNS VOID AS $
BEGIN
  UPDATE public.event_sessions
  SET
    ended_at = NOW(),
    session_duration = EXTRACT(EPOCH FROM (NOW() - created_at))::INTEGER,
    is_bounce = (page_views <= 1)
  WHERE session_id = p_session_id AND ended_at IS NULL;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link guest to user
CREATE OR REPLACE FUNCTION public.link_guest_to_user(
  p_user_id UUID,
  p_guest_id TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $
BEGIN
  INSERT INTO public.user_guest_tracking (user_id, guest_id, ip_address, user_agent, last_seen)
  VALUES (p_user_id, p_guest_id, p_ip_address, p_user_agent, NOW())
  ON CONFLICT (user_id, guest_id)
  DO UPDATE SET
    last_seen = NOW(),
    session_count = user_guest_tracking.session_count + 1,
    is_active = true;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get seller analytics function
CREATE OR REPLACE FUNCTION public.get_seller_analytics(seller_id UUID)
RETURNS TABLE(
  total_views BIGINT,
  total_contact_clicks BIGINT,
  total_whatsapp_clicks BIGINT,
  top_listings JSONB,
  views_by_day JSONB
)
LANGUAGE plpgsql
AS $
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN ae.event_type = 'view' THEN 1 ELSE 0 END), 0)::BIGINT as total_views,
    COALESCE(SUM(CASE WHEN ae.event_type = 'contact_click' THEN 1 ELSE 0 END), 0)::BIGINT as total_contact_clicks,
    COALESCE(SUM(CASE WHEN ae.event_type = 'WhatsApp_click' THEN 1 ELSE 0 END), 0)::BIGINT as total_whatsapp_clicks,
    '[]'::JSONB as top_listings,  -- Simplified, can be enhanced later
    '[]'::JSONB as views_by_day    -- Simplified, can be enhanced later
  FROM analytics_events ae
  WHERE ae.user_id = seller_id;
END;
$;

-- Function to calculate banner CTR
CREATE OR REPLACE FUNCTION public.calculate_banner_ctr(impressions INTEGER, clicks INTEGER)
RETURNS DECIMAL(5,4) AS $
BEGIN
  IF impressions = 0 THEN
    RETURN 0.0000;
  ELSE
    RETURN ROUND((clicks::DECIMAL / impressions::DECIMAL) * 100, 4);
  END IF;
END;
$ LANGUAGE plpgsql;

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
AS $
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
$;

-- SECURITY DEFINER function for user profile creation
CREATE OR REPLACE FUNCTION public.create_user_profile_after_signup(
    p_id                     UUID,
    p_email                  TEXT,
    p_name                   TEXT DEFAULT NULL, -- Added
    p_profile_image_url      TEXT DEFAULT NULL, -- Added
    p_phone                  TEXT DEFAULT NULL,
    p_role                   TEXT DEFAULT 'user',
    p_city                   TEXT DEFAULT NULL,
    p_country                TEXT DEFAULT 'Pakistan',
    p_is_verified            BOOLEAN DEFAULT FALSE,
    p_email_verified         BOOLEAN DEFAULT FALSE,
    p_active                 BOOLEAN DEFAULT TRUE,
    p_guest_id               TEXT DEFAULT NULL,
    p_notification_preferences JSONB DEFAULT '{"email":true,"sms":false,"push":true}'::jsonb,
    p_preferred_language     TEXT DEFAULT 'en'
) RETURNS VOID
AS $func$
BEGIN
    RAISE NOTICE 'create_user_profile_after_signup called for %', p_id;

    -- Ensure guest_id is set, generate one if not provided
    IF p_guest_id IS NULL THEN
        p_guest_id := 'guest-' || gen_random_uuid()::text;
    END IF;

    -- Insert user profile, bypassing RLS by using SECURITY DEFINER
    INSERT INTO public.users (
        id, email, name, profile_image_url, phone, role, city, country,
        is_verified, email_verified, active,
        guest_id, notification_preferences, preferred_language
    ) VALUES (
        p_id, p_email, p_name, p_profile_image_url, p_phone, p_role, p_city, p_country,
        p_is_verified, p_email_verified, p_active,
        p_guest_id, p_notification_preferences, p_preferred_language
    );

    RAISE NOTICE 'User % inserted successfully', p_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in create_user_profile_after_signup: %', SQLERRM;
        RAISE;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER function for seller profile creation
CREATE OR REPLACE FUNCTION public.create_seller_profile_after_signup(
    p_id                     UUID,
    p_username               TEXT,
    p_business_name          TEXT DEFAULT NULL,
    p_owner_cnic             TEXT DEFAULT NULL,
    p_address_line1          TEXT DEFAULT NULL,
    p_is_verified            BOOLEAN DEFAULT FALSE,
    p_is_top_seller          BOOLEAN DEFAULT FALSE,
    p_tier                   TEXT DEFAULT 'basic',
    p_tier_points            INTEGER DEFAULT 0,
    p_verification_status   TEXT DEFAULT 'pending',
    p_verification_documents JSONB DEFAULT '{"cnic_front": null, "cnic_back": null}'::jsonb,
    p_city                   TEXT DEFAULT NULL,
    p_phone                  TEXT DEFAULT NULL,
    p_email                  TEXT DEFAULT NULL
) RETURNS VOID
AS $func$
BEGIN
    RAISE NOTICE 'create_seller_profile_after_signup called for seller %', p_id;

    -- Insert seller profile, bypassing RLS by using SECURITY DEFINER
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_cnic, address_line1,
        is_verified, is_top_seller, tier, tier_points, verification_status,
        verification_documents, city, phone, email
    ) VALUES (
        p_id, p_username, p_business_name, p_owner_cnic, p_address_line1,
        p_is_verified, p_is_top_seller, p_tier, p_tier_points, p_verification_status,
        p_verification_documents, p_city, p_phone, p_email
    );

    RAISE NOTICE 'Seller % inserted successfully within function', p_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in create_seller_profile_after_signup: %', SQLERRM;
        RAISE;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. GRANTS FOR FUNCTIONS
-- =============================================

-- Grants for existing functions
GRANT EXECUTE ON FUNCTION public.update_modified_column TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.end_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.link_guest_to_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_seller_analytics TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.calculate_banner_ctr TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_banner_analytics_summary TO authenticated;

-- Grants for SECURITY DEFINER functions
GRANT EXECUTE ON FUNCTION public.create_user_profile_after_signup TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_seller_profile_after_signup TO authenticated, anon;

-- Set ownership for SECURITY DEFINER functions
-- ALTER FUNCTION public.create_user_profile_after_signup OWNER TO supabase_admin;
-- ALTER FUNCTION public.create_seller_profile_after_signup OWNER TO supabase_admin;

-- =============================================
-- 7. TRIGGERS
-- =============================================

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_seller_profiles_modtime
BEFORE UPDATE ON public.seller_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- =============================================
-- 8. VIEWS
-- =============================================

CREATE OR REPLACE VIEW public.enhanced_seller_analytics
WITH (security_invoker=true) AS
SELECT
  a.listing_id,
  sp.id as seller_id,
  sp.username,
  COUNT(*) FILTER (WHERE a.event_type = 'view') AS total_views,
  COUNT(*) FILTER (WHERE a.event_type = 'contact_click') AS contact_clicks,
  COUNT(*) FILTER (WHERE a.event_type = 'WhatsApp_click') AS whatsapp_clicks,
  COUNT(*) FILTER (WHERE a.event_type = 'share') AS shares,
  COUNT(DISTINCT a.session_ref) AS unique_sessions,
  COUNT(DISTINCT a.user_id) AS unique_users,
  DATE_TRUNC('day', a.created_at) AS event_date
FROM analytics_events a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN seller_profiles sp ON u.id = sp.id
WHERE sp.id IS NOT NULL
GROUP BY a.listing_id, sp.id, sp.username, event_date;

-- =============================================
-- 9. INITIAL DATA INSERTS
-- =============================================

-- Insert Pakistani cities (without duplicates)
INSERT INTO public.cities (name, province) VALUES
('Karachi', 'Sindh'), ('Lahore', 'Punjab'), ('Islamabad', 'ICT'), ('Rawalpindi', 'Punjab'),
('Faisalabad', 'Punjab'), ('Multan', 'Punjab'), ('Peshawar', 'KPK'), ('Quetta', 'Balochistan'),
('Sialkot', 'Punjab'), ('Gujranwala', 'Punjab'), ('Hyderabad', 'Sindh'), ('Bahawalpur', 'Punjab'),
('Sargodha', 'Punjab'), ('Sukkur', 'Sindh'), ('Larkana', 'Sindh'), ('Rahim Yar Khan', 'Punjab'),
('Kasur', 'Punjab'), ('Sheikhupura', 'Punjab'), ('Jhang', 'Punjab'), ('Dera Ghazi Khan', 'Punjab'),
('Gujrat', 'Punjab'), ('Sahiwal', 'Punjab'), ('Okara', 'Punjab'), ('Muzaffargarh', 'Punjab'),
('Nawabshah', 'Sindh'), ('Mirpur Khas', 'Sindh'), ('Jacobabad', 'Sindh'), ('Mardan', 'KPK'),
('Kohat', 'KPK'), ('Abbottabad', 'KPK'), ('Dera Ismail Khan', 'KPK'), ('Bannu', 'KPK'),
('Swabi', 'KPK'), ('Nowshera', 'KPK'), ('Charsadda', 'KPK'), ('Tank', 'KPK'),
('Hangu', 'KPK'), ('Buner', 'KPK'), ('Malakand', 'KPK'), ('Swat', 'KPK'),
('Chitral', 'KPK'), ('Haripur', 'KPK'), ('Mansehra', 'KPK'), ('Karak', 'KPK'),
('Kurram', 'KPK'), ('North Waziristan', 'KPK'), ('South Waziristan', 'KPK'), ('Khyber', 'KPK'),
('Orakzai', 'KPK'), ('Harnai', 'Balochistan'), ('Ziarat', 'Balochistan'), ('Khuzdar', 'Balochistan'),
('Turbat', 'Balochistan'), ('Panjgur', 'Balochistan'), ('Kech', 'Balochistan'), ('Dera Bugti', 'Balochistan'),
('Nasirabad', 'Balochistan'), ('Jaffarabad', 'Balochistan'), ('Sibi', 'Balochistan'), ('Bolan', 'Balochistan'),
('Qilla Abdullah', 'Balochistan'), ('Pishin', 'Balochistan'), ('Chagai', 'Balochistan'), ('Kharan', 'Balochistan'),
('Washuk', 'Balochistan'), ('Awaran', 'Balochistan'), ('Gwadar', 'Balochistan'), ('Lasbela', 'Balochistan'),
('Kalat', 'Balochistan'), ('Mastung', 'Balochistan'), ('Duki', 'Balochistan'), ('Loralai', 'Balochistan'),
('Musakhel', 'Balochistan'), ('Barkhan', 'Balochistan'), ('Dera Murad Jamali', 'Balochistan'), ('Jhal Magsi', 'Balochistan'),
('Sohbatpur', 'Balochistan'), ('Kachhi', 'Balochistan'), ('Jafarabad', 'Balochistan'), ('Umerkot', 'Sindh'),
('Tharparkar', 'Sindh'), ('Badin', 'Sindh'), ('Thatta', 'Sindh'), ('Jamshoro', 'Sindh'),
('Tando Allahyar', 'Sindh'), ('Tando Muhammad Khan', 'Sindh'), ('Sanghar', 'Sindh'), ('Dadu', 'Sindh'),
('Kambar Shahdadkot', 'Sindh'), ('Qambar Shahdadkot', 'Sindh'), ('Shikarpur', 'Sindh'), ('Naushahro Firoz', 'Sindh'),
('Khairpur', 'Sindh'), ('Kashmore', 'Sindh'), ('Sujawal', 'Sindh'), ('Gilgit', 'GB'),
('Skardu', 'GB'), ('Muzaffarabad', 'AJK'), ('Mirpur', 'AJK'), ('Rawalakot', 'AJK'),
('Kotli', 'AJK'), ('Attock', 'Punjab'), ('Chiniot', 'Punjab'), ('Daska', 'Punjab'),
('Hafizabad', 'Punjab'), ('Jaranwala', 'Punjab'), ('Kamoke', 'Punjab'), ('Khanewal', 'Punjab'),
('Khanpur', 'Punjab'), ('Khushab', 'Punjab'), ('Mandi Bahauddin', 'Punjab'), ('Muridke', 'Punjab'),
('Pakpattan', 'Punjab'), ('Sadiqabad', 'Punjab'), ('Samundri', 'Punjab'), ('Wah Cantonment', 'Punjab'),
('Upper Dir', 'KPK'), ('Kohlu', 'Balochistan'), ('Zhob', 'Balochistan'), ('Matiari', 'Sindh'),
('Ghotki', 'Sindh');

-- Sample subscription packages
INSERT INTO public.subscription_packages (name, price, max_listings, features) VALUES
('Free', 0, 5, '{"analytics_days": 30}'),
('Basic', 999, 20, '{"analytics_days": 90, "priority_support": true}'),
('Premium', 2999, 100, '{"analytics_days": 365, "priority_support": true, "advanced_analytics": true}');

-- =============================================
-- 10. AUTHENTICATION ENHANCEMENTS
-- =============================================

-- Add unique constraints to users table
-- Note: We need to be careful about NULL values with unique constraints
-- For PostgreSQL, UNIQUE constraints allow multiple NULL values

-- Add unique constraint for email (excluding NULLs)
CREATE UNIQUE INDEX idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;

-- Add unique constraint for phone (excluding NULLs)
CREATE UNIQUE INDEX idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;

-- Add validation constraints for phone format (Pakistani format)
ALTER TABLE public.users 
ADD CONSTRAINT valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Enhanced trigger function to sync avatar URLs in both directions
CREATE OR REPLACE FUNCTION public.sync_avatar_to_seller_profile()
RETURNS TRIGGER AS $
BEGIN
  -- Sync from users to seller_profiles when users.profile_image_url is updated
  IF TG_TABLE_NAME = 'users' AND (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update seller profile avatar_url if it exists
    UPDATE public.seller_profiles 
    SET avatar_url = NEW.profile_image_url
    WHERE id = NEW.id 
    AND (avatar_url IS NULL OR avatar_url != NEW.profile_image_url);
    
    RETURN NEW;
  END IF;
  
  -- Sync from seller_profiles to users when seller_profiles.avatar_url is updated
  IF TG_TABLE_NAME = 'seller_profiles' AND (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update user profile_image_url if it exists
    UPDATE public.users 
    SET profile_image_url = NEW.avatar_url
    WHERE id = NEW.id 
    AND (profile_image_url IS NULL OR profile_image_url != NEW.avatar_url);
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Trigger to sync avatar when user profile is updated
DROP TRIGGER IF EXISTS sync_user_avatar_to_seller_profile ON public.users;
CREATE TRIGGER sync_user_avatar_to_seller_profile
  AFTER INSERT OR UPDATE OF profile_image_url ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_avatar_to_seller_profile();

-- Trigger to sync avatar when seller profile is updated
CREATE TRIGGER sync_seller_avatar_to_user_profile
  AFTER INSERT OR UPDATE OF avatar_url ON public.seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_avatar_to_seller_profile();

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).
- Trigger to automatically sync avatar URLs from users.profile_image_url to seller_profiles.avatar_url

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add validation constraints for email format
ALTER TABLE public.users 
ADD CONSTRAINT valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add unique constraint for guest_id (excluding NULLs)
CREATE UNIQUE INDEX idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraint for seller phone (excluding NULLs)
CREATE UNIQUE INDEX idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;

-- Add unique constraint for seller email (excluding NULLs)
CREATE UNIQUE INDEX idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add validation constraints for seller phone format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add validation constraints for seller email format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Update the CNIC validation to be more specific for Pakistani format
ALTER TABLE public.seller_profiles 
DROP CONSTRAINT IF EXISTS valid_cnic;

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Create helper function for checking uniqueness with better error messages
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- =============================================
-- 11. AUTHENTICATION ENHANCEMENTS
-- =============================================

-- Ensure UUID generator extension (install into extensions schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- 1. Add unique indexes to users table (NULLs excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- 2. Add unique indexes for seller_profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- 3. Add validation constraints for users phone format (Pakistani format)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE public.users ADD CONSTRAINT valid_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 4. Add validation constraints for users email format
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_email_format;
ALTER TABLE public.users ADD CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 5. Add validation constraints for seller_profiles phone format
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_seller_phone_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_phone_format CHECK (phone IS NULL OR phone ~ '^(\+92|0)?3[0-9]{9}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 6. Add validation constraints for seller_profiles email format
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_seller_email_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 7. Add validation constraints for seller_profiles CNIC format
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic;
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic_format CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 8. Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Add validation constraints for seller_profiles WhatsApp format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_seller_whatsapp_format 
CHECK (whatsapp IS NULL OR whatsapp ~ '^03[0-9]{2}[0-9]{7}
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add validation constraints for seller_profiles map URL format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_map_url_format 
CHECK (map_url IS NULL OR map_url ~* '^https?://(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}.*
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_seller_whatsapp_format ON public.seller_profiles IS 'Validates Pakistani WhatsApp number format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_map_url_format ON public.seller_profiles IS 'Validates map URL format';

-- 9. Create helper function for checking user uniqueness with better error messages
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 6. Add validation constraints for seller_profiles email format
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_seller_email_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 7. Add validation constraints for seller_profiles CNIC format
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic;
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic_format CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- 8. Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Add validation constraints for seller_profiles WhatsApp format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_seller_whatsapp_format 
CHECK (whatsapp IS NULL OR whatsapp ~ '^03[0-9]{2}[0-9]{7}
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add validation constraints for seller_profiles map URL format
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_map_url_format 
CHECK (map_url IS NULL OR map_url ~* '^https?://(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}.*
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_seller_whatsapp_format ON public.seller_profiles IS 'Validates Pakistani WhatsApp number format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_map_url_format ON public.seller_profiles IS 'Validates map URL format';

-- 9. Create helper function for checking user uniqueness with better error messages
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if email is already taken by another user
    IF p_email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = p_email 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if phone is already taken by another user
    IF p_phone IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE phone = p_phone 
            AND (p_existing_user_id IS NULL OR id != p_existing_user_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;
    
    -- Check if CNIC is already taken by another seller
    -- This would be called separately for seller registration
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 10. Create helper function for checking seller uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $
BEGIN
    -- Check if username is already taken
    IF EXISTS (
        SELECT 1 FROM public.seller_profiles 
        WHERE username = p_username 
        AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
    ) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;
    
    -- Check if CNIC is already registered
    IF p_cnic IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.seller_profiles 
            WHERE owner_cnic = p_cnic 
            AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)
        ) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$;

-- 11. Enhanced registration function with better error handling
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
AS $
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
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, p_role,
        FALSE, FALSE, FALSE
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
$ SECURITY DEFINER;

-- 12. Enhanced seller registration function with better error handling
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
AS $
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
    
    -- Insert user
    INSERT INTO public.users (
        id, email, phone, name, city, role, 
        email_verified, phone_verified, is_verified
    ) VALUES (
        v_user_id, p_email, p_phone, p_name, p_city, 'seller',
        FALSE, FALSE, FALSE
    );
    
    -- Insert seller profile
    INSERT INTO public.seller_profiles (
        id, username, business_name, owner_name, owner_cnic, 
        city, phone, email, is_verified, verification_status
    ) VALUES (
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
$ SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';

-- =============================================
-- 12. AUTHENTICATION CONSTRAINTS UPDATE
-- Adding missing unique constraints and improving validation
-- =============================================

-- Add unique constraints to users table (excluding NULLs)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Add unique constraints to seller_profiles table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_username_unique ON public.seller_profiles (username);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- Add format validation constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_phone_format 
CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_seller_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT IF NOT EXISTS valid_cnic_format 
CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user management with authentication';
COMMENT ON TABLE public.event_sessions IS 'Session management without volatile indexes';
COMMENT ON TABLE public.user_guest_tracking IS 'Tracks guest-to-user relationships';
COMMENT ON TABLE public.analytics_events IS 'Event tracking with session references';
COMMENT ON FUNCTION public.get_or_create_session IS 'Creates or retrieves session for analytics';
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON FUNCTION public.get_banner_analytics_summary IS 'Returns summary analytics for banners with filtering options.';
COMMENT ON FUNCTION public.create_user_profile_after_signup IS 'Creates user profile bypassing RLS for initial signup.';
COMMENT ON FUNCTION public.create_seller_profile_after_signup IS 'Creates seller profile bypassing RLS for initial signup.';

-- Summary of fixes and improvements
/*
This schema is consolidated to provide a clean and robust starting point.
It includes:
- All necessary table definitions for users, sellers, analytics, banners, etc.
- Proper constraints and indexes for data integrity and performance.
- Comprehensive RLS policies for secure data access.
- All required Postgres functions, including SECURITY DEFINER functions for initial user/seller profile creation, which explicitly bypass RLS.
- Grants and ownership settings for functions.
- Triggers for automatic timestamp updates.
- Views for aggregated data.
- Initial data inserts for essential lookup tables (cities) and default configurations (subscription packages).

This setup addresses previous RLS challenges by using SECURITY DEFINER functions for initial profile creation, ensuring a reliable signup flow.
*/
