-- =============================================
-- BANNER ANALYTICS SCHEMA - COMPATIBLE VERSION
-- Works with existing functions in your database
-- =============================================

-- =============================================
-- BANNER IMPRESSION TRACKING
-- Tracks when banners are displayed to users
-- =============================================
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

-- =============================================
-- BANNER CLICK TRACKING
-- Tracks when users click on banners
-- =============================================
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

-- =============================================
-- BANNER PERFORMANCE SUMMARY
-- Aggregated daily statistics for banner performance
-- =============================================
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
-- INDEXES FOR BANNER ANALYTICS
-- =============================================

-- Banner impressions indexes
CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_id ON public.banner_impressions(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_placement ON public.banner_impressions(placement);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_size ON public.banner_impressions(banner_size);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_user_id ON public.banner_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_guest_id ON public.banner_impressions(guest_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_session_ref ON public.banner_impressions(session_ref);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_device_type ON public.banner_impressions(device_type);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_city ON public.banner_impressions(city);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_created_at ON public.banner_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_page_url ON public.banner_impressions(page_url);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_category_context ON public.banner_impressions(category_context);

-- Banner clicks indexes
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id ON public.banner_clicks(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_user_id ON public.banner_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_session_ref ON public.banner_clicks(session_ref);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_created_at ON public.banner_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_placement ON public.banner_clicks(placement);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_size ON public.banner_clicks(banner_size);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_city ON public.banner_clicks(city);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_device_type ON public.banner_clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_page_url ON public.banner_clicks(page_url);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_target_url ON public.banner_clicks(target_url);

-- Daily performance indexes
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_banner_id ON public.banner_performance_daily(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_placement ON public.banner_performance_daily(placement);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_date ON public.banner_performance_daily(date);
CREATE INDEX IF NOT EXISTS idx_banner_performance_daily_ctr ON public.banner_performance_daily(ctr);

-- =============================================
-- ROW LEVEL SECURITY FOR BANNER ANALYTICS
-- =============================================

-- Enable RLS
ALTER TABLE IF EXISTS public.banner_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banner_performance_daily ENABLE ROW LEVEL SECURITY;

-- Banner impressions policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage banner impressions') THEN
    CREATE POLICY "Admins can manage banner impressions" ON public.banner_impressions
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- Banner clicks policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can track banner clicks') THEN
    CREATE POLICY "Anyone can track banner clicks" ON public.banner_clicks
      FOR INSERT TO authenticated, anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can view banner clicks') THEN
    CREATE POLICY "Admins can view banner clicks" ON public.banner_clicks
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- Daily performance policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage banner performance daily') THEN
    CREATE POLICY "Admins can manage banner performance daily" ON public.banner_performance_daily
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- =============================================
-- FUNCTIONS FOR BANNER ANALYTICS
-- =============================================

-- Function to calculate banner CTR (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_proc   p
    JOIN   pg_namespace n ON p.pronamespace = n.oid
    WHERE  n.nspname = 'public'
    AND    p.proname = 'calculate_banner_ctr'
  ) THEN
    CREATE FUNCTION public.calculate_banner_ctr(
        impressions INTEGER,
        clicks      INTEGER
    )
    RETURNS DECIMAL(5,4)
    AS $func$                -- <<< use a different tag
    BEGIN
      IF impressions = 0 THEN
        RETURN 0.0000;
      ELSE
        RETURN ROUND((clicks::DECIMAL / impressions::DECIMAL) * 100, 4);
      END IF;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END;
$$;   -- end of the outer DO block

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_banner_ctr TO authenticated, anon;
GRANT ALL ON TABLE public.banner_impressions TO authenticated;
GRANT ALL ON TABLE public.banner_clicks TO authenticated, anon;
GRANT ALL ON TABLE public.banner_performance_daily TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.calculate_banner_ctr IS 'Calculates click-through rate for banners.';
COMMENT ON TABLE public.banner_impressions IS 'Tracks impressions (displays) of advertisement banners with detailed context.';
COMMENT ON TABLE public.banner_clicks IS 'Tracks clicks on advertisement banners with detailed context.';
COMMENT ON TABLE public.banner_performance_daily IS 'Daily aggregated statistics for banner performance.';