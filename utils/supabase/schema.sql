-- Enable PostGIS extension (critical for location functionality)
CREATE EXTENSION IF NOT EXISTS postgis;

-- USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT, -- Added for full name
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(), -- Added for tracking updates
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0, -- Track login frequency
  is_verified BOOLEAN DEFAULT false,
  guest_id UUID DEFAULT gen_random_uuid(),
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Pakistan',
  last_location GEOGRAPHY(POINT, 4326),
  active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false, -- Added for phone verification
  whatsapp_consent BOOLEAN DEFAULT false,
  
  -- Enhanced profile fields
  profile_image_url TEXT, -- For Sanity image URLs
  bio TEXT, -- User biography
  date_of_birth DATE, -- Optional date of birth
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Account status and security
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending', 'deactivated')),
  onboarding_completed BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_password_change TIMESTAMPTZ DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Enhanced notification preferences
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "push": true,
    "marketing": false,
    "security_alerts": true
  }'::jsonb,
  
  -- Privacy settings
  privacy_settings JSONB DEFAULT '{
    "profile_visible": true,
    "contact_info_visible": false,
    "activity_visible": true,
    "location_sharing": false
  }'::jsonb,
  
  -- Preferences
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ur')),
  timezone TEXT DEFAULT 'Asia/Karachi',
  currency_preference TEXT DEFAULT 'PKR',
  
  -- Social links
  social_links JSONB DEFAULT '{}'::jsonb
);

-- Create RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_guest_id ON public.users(guest_id);
CREATE INDEX idx_users_location ON public.users USING GIST (last_location);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_users_pak_cities ON public.users(city) 
WHERE city IN ('Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta');

-- SELLER PROFILES
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  business_name TEXT,
  owner_name TEXT, -- Added for owner full name
  verification_documents JSONB DEFAULT '{
    "cnic_front": null,
    "cnic_back": null,
    "business_license": null,
    "tax_certificate": null
  }'::jsonb,
  owner_cnic TEXT UNIQUE,
  
  -- Enhanced address fields
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Pakistan',
  postal_code TEXT,
  
  -- Contact information
  phone TEXT,
  email TEXT,
  website TEXT,
  
  avatar_url TEXT,
  map_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_top_seller BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'bronze', 'silver', 'gold', 'platinum', 'diamond')),
  tier_points INTEGER DEFAULT 0,
  tier_last_updated TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')),
  verification_notes TEXT,
  
  -- Business details
  business_type TEXT,
  registration_number TEXT,
  tax_number TEXT,
  
  -- Enhanced features
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "18:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": false}
  }'::jsonb,
  
  social_media_links JSONB DEFAULT '{}'::jsonb,
  
  -- Performance metrics
  response_time_avg INTEGER DEFAULT 0, -- in minutes
  customer_rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add CNIC validation constraint for Pakistan
ALTER TABLE seller_profiles 
ADD CONSTRAINT valid_cnic CHECK (
  owner_cnic ~ '^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$'
);

-- Create RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers can view own profile" ON public.seller_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Sellers can update own profile" ON public.seller_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all seller profiles" ON public.seller_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_seller_profiles_verification ON public.seller_profiles(verification_status);
CREATE INDEX idx_seller_profiles_top_seller ON public.seller_profiles(is_top_seller);
CREATE INDEX idx_seller_profiles_tier ON public.seller_profiles(tier);
CREATE INDEX idx_seller_profiles_tier_points ON public.seller_profiles(tier_points);

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

-- RLS for tier history
ALTER TABLE public.seller_tier_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tier history" ON public.seller_tier_history
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_tier_history_seller ON public.seller_tier_history(seller_id);
CREATE INDEX idx_tier_history_admin ON public.seller_tier_history(admin_id);

-- SUBSCRIPTION PACKAGES
CREATE TABLE public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'PKR',
  max_listings INTEGER NOT NULL,
  max_featured_listings INTEGER DEFAULT 0,
  analytics_days INTEGER DEFAULT 90,
  features JSONB NOT NULL DEFAULT '{
    "location_boost": false,
    "priority_support": false,
    "advanced_analytics": false,
    "featured_listing": false,
    "listing_priority": 1
  }'::jsonb,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (admin only access)
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage packages" ON public.subscription_packages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_packages_active ON public.subscription_packages(is_active);
CREATE INDEX idx_packages_order ON public.subscription_packages(display_order);

-- USER SUBSCRIPTIONS
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.subscription_packages(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  transaction_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ
);

-- Create RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON public.user_subscriptions(end_date);
CREATE INDEX idx_subscriptions_active ON public.user_subscriptions((status = 'active' AND end_date > NOW()));
CREATE INDEX idx_active_subscriptions ON public.user_subscriptions(user_id) 
WHERE status = 'active' AND end_date > NOW();

-- AFFILIATE PROGRAMS
CREATE TABLE public.affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins manage all affiliate programs" ON public.affiliate_programs
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_affiliate_programs_active ON public.affiliate_programs(is_active);

-- AFFILIATE CODES
CREATE TABLE public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.affiliate_programs(id),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers manage own codes" ON public.affiliate_codes
  FOR ALL TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Admins manage all codes" ON public.affiliate_codes
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_affiliate_codes_seller ON public.affiliate_codes(seller_id);
CREATE INDEX idx_affiliate_codes_status ON public.affiliate_codes(status);

-- AFFILIATE REFERRALS
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.affiliate_codes(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.users(id),
  referred_id UUID NOT NULL REFERENCES public.users(id),
  listing_id TEXT,  -- Sanity listing ID
  purchase_amount NUMERIC(10,2),
  commission_amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers view own referrals" ON public.affiliate_referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Admins view all referrals" ON public.affiliate_referrals
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_affiliate_referrals_status ON public.affiliate_referrals(status);
CREATE INDEX idx_affiliate_referrals_code ON public.affiliate_referrals(code_id);
CREATE INDEX idx_affiliate_referrals_referrer ON public.affiliate_referrals(referrer_id);

-- ANALYTICS EVENTS
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,  -- This will store the Sanity document ID
  event_type TEXT NOT NULL CHECK (event_type IN ('impressions', 'listing_click', 'view', 'contact_click', 'WhatsApp_click', 'share', 'save', 'search')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  os TEXT,
  browser TEXT,
  session_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admins can access)
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes for performance (critical for analytics)
CREATE INDEX idx_analytics_listing ON public.analytics_events(listing_id);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_guest ON public.analytics_events(guest_id);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_time ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_listing_type ON public.analytics_events(listing_id, event_type);
CREATE INDEX idx_analytics_time_listing ON public.analytics_events(created_at, listing_id);
CREATE INDEX idx_analytics_brin ON public.analytics_events USING BRIN (created_at);

-- BANNER CLICKS
CREATE TABLE public.banner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL,  -- Sanity document ID
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id UUID,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view banner analytics" ON public.banner_clicks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_banner_clicks_banner ON public.banner_clicks(banner_id);
CREATE INDEX idx_banner_clicks_time ON public.banner_clicks(created_at);

-- SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'verification', 'listing', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_tickets_assigned ON public.support_tickets(assigned_to);

-- SELLER LISTINGS ANALYTICS VIEW
CREATE OR REPLACE VIEW public.seller_listings_analytics AS
SELECT 
  a.listing_id,
  a.user_id,
  COUNT(*) FILTER (WHERE a.event_type = 'impressions') AS impressions,
  COUNT(*) FILTER (WHERE a.event_type = 'listing_click') AS listing_clicks,
  COUNT(*) FILTER (WHERE a.event_type = 'contact_click') AS contact_clicks,
  COUNT(*) FILTER (WHERE a.event_type = 'WhatsApp_click') AS whatsapp_clicks,
  COUNT(*) FILTER (WHERE a.event_type = 'view') AS views,
  DATE_TRUNC('day', a.created_at) AS event_date
FROM analytics_events a
WHERE a.user_id IS NOT NULL
GROUP BY a.listing_id, a.user_id, event_date;

-- RLS Policy for seller analytics view
CREATE POLICY "Sellers can view their listing analytics" ON public.seller_listings_analytics
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable RLS on the view
ALTER VIEW public.seller_listings_analytics ENABLE ROW LEVEL SECURITY;

-- CRITICAL FUNCTIONS & TRIGGERS
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for users table
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_seller_profiles_modtime
BEFORE UPDATE ON public.seller_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_subscriptions_modtime
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_affiliate_codes_modtime
BEFORE UPDATE ON public.affiliate_codes
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Check active subscription function
CREATE OR REPLACE FUNCTION public.is_seller_active(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE 
      user_subscriptions.user_id = is_seller_active.user_id
      AND status = 'active'
      AND end_date > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create cities table for Pakistani cities
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate major Pakistani cities
INSERT INTO public.cities (name, province) VALUES
('Karachi', 'Sindh'),
('Lahore', 'Punjab'),
('Islamabad', 'ICT'),
('Rawalpindi', 'Punjab'),
('Faisalabad', 'Punjab'),
('Multan', 'Punjab'),
('Peshawar', 'KPK'),
('Quetta', 'Balochistan'),
('Sialkot', 'Punjab'),
('Gujranwala', 'Punjab'),
('Hyderabad', 'Sindh'),
('Bahawalpur', 'Punjab'),
('Sargodha', 'Punjab'),
('Sukkur', 'Sindh'),
('Larkana', 'Sindh');

-- AUTHENTICATION LOGS TABLE
CREATE TABLE public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'register', 'password_reset', 'email_verify', 'failed_login', 'account_locked')),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for auth logs (admin only)
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auth logs" ON public.auth_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes for auth logs
CREATE INDEX idx_auth_logs_user ON public.auth_logs(user_id);
CREATE INDEX idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX idx_auth_logs_time ON public.auth_logs(created_at);
CREATE INDEX idx_auth_logs_ip ON public.auth_logs(ip_address);
CREATE INDEX idx_auth_logs_success ON public.auth_logs(success);

-- USER SESSIONS TABLE
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  os TEXT,
  browser TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.user_sessions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Indexes for user sessions
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

-- PASSWORD RESET TOKENS TABLE
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- RLS for password reset tokens (no direct access)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Indexes for password reset tokens
CREATE INDEX idx_password_reset_user ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON public.password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_used ON public.password_reset_tokens(used);




-- Function: calculate_seller_tier(seller_uuid UUID)
-- Purpose: Assign a tier based on subscription & analytics (no Sanity dependency)

CREATE OR REPLACE FUNCTION calculate_seller_tier(seller_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    seller_record RECORD;
    package_record RECORD;
    activity_score INT;
    tier TEXT := 'Basic';
BEGIN
    -- Fetch seller and subscription info
    SELECT sp.*, p.*
    INTO seller_record, package_record
    FROM seller_profiles sp
    JOIN subscription_packages p
      ON sp.package_id = p.id
    WHERE sp.id = seller_uuid;

    IF NOT FOUND THEN
        RETURN 'Unknown';
    END IF;

    -- Calculate activity score based on analytics
    SELECT COUNT(*) 
    INTO activity_score
    FROM analytics a
    WHERE a.seller_id = seller_uuid
      AND a.created_at > NOW() - INTERVAL '30 days';

    -- Tier logic
    IF package_record.price >= 10000 OR seller_record.is_topseller THEN
        tier := 'Premium';
    ELSIF activity_score > 500 THEN
        tier := 'Gold';
    ELSIF activity_score > 100 THEN
        tier := 'Silver';
    ELSE
        tier := 'Basic';
    END IF;

    RETURN tier;
END;
$$ LANGUAGE plpgsql;