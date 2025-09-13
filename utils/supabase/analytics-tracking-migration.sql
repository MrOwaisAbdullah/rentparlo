-- =============================================
-- RENTPARLO.PK ANALYTICS TRACKING MIGRATION SCRIPT
-- This script applies all necessary schema changes to implement
-- the comprehensive analytics tracking system on an existing database
-- =============================================

-- Start transaction
BEGIN;

-- =============================================
-- 1. COLUMN MODIFICATIONS
-- =============================================

-- Add guest_id column to users table (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'guest_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN guest_id TEXT;
        RAISE NOTICE 'Added guest_id column to users table';
    ELSE
        RAISE NOTICE 'guest_id column already exists in users table';
    END IF;
END $$;

-- Make listing_id nullable in analytics_events table to allow profile view tracking
DO $$
BEGIN
    -- First check if the column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analytics_events' 
        AND column_name = 'listing_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.analytics_events ALTER COLUMN listing_id DROP NOT NULL;
        RAISE NOTICE 'Made listing_id column nullable in analytics_events table';
    ELSE
        RAISE NOTICE 'listing_id column is already nullable or does not exist in analytics_events table';
    END IF;
END $$;

-- Add metadata column to analytics_events table for storing additional event data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analytics_events' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.analytics_events ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to analytics_events table';
    ELSE
        RAISE NOTICE 'metadata column already exists in analytics_events table';
    END IF;
END $$;

-- Add unique constraint for guest_id (excluding NULLs)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_users_guest_id_unique' 
        AND n.nspname = 'public'
    ) THEN
        CREATE UNIQUE INDEX idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;
        RAISE NOTICE 'Created unique index for guest_id in users table';
    ELSE
        RAISE NOTICE 'Unique index for guest_id already exists in users table';
    END IF;
END $$;

-- =============================================
-- 2. NEW TABLES CREATION
-- =============================================

-- BANNER IMPRESSION TRACKING
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'banner_impressions'
    ) THEN
        CREATE TABLE public.banner_impressions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          banner_id TEXT NOT NULL,
          placement TEXT NOT NULL,
          banner_size TEXT NOT NULL,
          user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          guest_id UUID,
          session_ref UUID REFERENCES public.event_sessions(session_id) ON DELETE SET NULL,
          ip_address INET,
          user_agent TEXT,
          referrer TEXT,
          city TEXT,
          device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
          browser TEXT,
          os TEXT,
          screen_resolution TEXT,
          viewport_size TEXT,
          page_url TEXT,
          page_title TEXT,
          category_context TEXT,
          search_query TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created banner_impressions table';
    ELSE
        RAISE NOTICE 'banner_impressions table already exists';
    END IF;
END $$;

-- BANNER CLICK TRACKING
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'banner_clicks'
    ) THEN
        CREATE TABLE public.banner_clicks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          banner_id TEXT NOT NULL,
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
          target_url TEXT,
          time_on_page INTEGER,
          scroll_depth INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created banner_clicks table';
    ELSE
        RAISE NOTICE 'banner_clicks table already exists';
    END IF;
END $$;

-- BANNER PERFORMANCE SUMMARY
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'banner_performance_daily'
    ) THEN
        CREATE TABLE public.banner_performance_daily (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          banner_id TEXT NOT NULL,
          placement TEXT NOT NULL,
          banner_size TEXT NOT NULL,
          date DATE NOT NULL,
          impressions INTEGER DEFAULT 0,
          clicks INTEGER DEFAULT 0,
          unique_impressions INTEGER DEFAULT 0,
          unique_clicks INTEGER DEFAULT 0,
          ctr DECIMAL(5,4),
          avg_time_on_page INTEGER,
          avg_scroll_depth INTEGER,
          top_cities JSONB,
          top_devices JSONB,
          top_browsers JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(banner_id, placement, date)
        );
        RAISE NOTICE 'Created banner_performance_daily table';
    ELSE
        RAISE NOTICE 'banner_performance_daily table already exists';
    END IF;
END $$;

-- =============================================
-- 3. INDEXES CREATION
-- =============================================

-- Banner impressions indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_banner_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_banner_id ON public.banner_impressions(banner_id);
        RAISE NOTICE 'Created idx_banner_impressions_banner_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_placement' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_placement ON public.banner_impressions(placement);
        RAISE NOTICE 'Created idx_banner_impressions_placement index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_banner_size' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_banner_size ON public.banner_impressions(banner_size);
        RAISE NOTICE 'Created idx_banner_impressions_banner_size index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_user_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_user_id ON public.banner_impressions(user_id);
        RAISE NOTICE 'Created idx_banner_impressions_user_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_guest_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_guest_id ON public.banner_impressions(guest_id);
        RAISE NOTICE 'Created idx_banner_impressions_guest_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_session_ref' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_session_ref ON public.banner_impressions(session_ref);
        RAISE NOTICE 'Created idx_banner_impressions_session_ref index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_device_type' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_device_type ON public.banner_impressions(device_type);
        RAISE NOTICE 'Created idx_banner_impressions_device_type index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_city' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_city ON public.banner_impressions(city);
        RAISE NOTICE 'Created idx_banner_impressions_city index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_created_at' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_created_at ON public.banner_impressions(created_at);
        RAISE NOTICE 'Created idx_banner_impressions_created_at index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_page_url' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_page_url ON public.banner_impressions(page_url);
        RAISE NOTICE 'Created idx_banner_impressions_page_url index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_impressions_category_context' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_impressions_category_context ON public.banner_impressions(category_context);
        RAISE NOTICE 'Created idx_banner_impressions_category_context index';
    END IF;
END $$;

-- Banner clicks indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_banner_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_banner_id ON public.banner_clicks(banner_id);
        RAISE NOTICE 'Created idx_banner_clicks_banner_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_user_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_user_id ON public.banner_clicks(user_id);
        RAISE NOTICE 'Created idx_banner_clicks_user_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_session_ref' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_session_ref ON public.banner_clicks(session_ref);
        RAISE NOTICE 'Created idx_banner_clicks_session_ref index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_created_at' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_created_at ON public.banner_clicks(created_at);
        RAISE NOTICE 'Created idx_banner_clicks_created_at index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_placement' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_placement ON public.banner_clicks(placement);
        RAISE NOTICE 'Created idx_banner_clicks_placement index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_banner_size' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_banner_size ON public.banner_clicks(banner_size);
        RAISE NOTICE 'Created idx_banner_clicks_banner_size index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_city' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_city ON public.banner_clicks(city);
        RAISE NOTICE 'Created idx_banner_clicks_city index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_device_type' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_device_type ON public.banner_clicks(device_type);
        RAISE NOTICE 'Created idx_banner_clicks_device_type index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_page_url' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_page_url ON public.banner_clicks(page_url);
        RAISE NOTICE 'Created idx_banner_clicks_page_url index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_clicks_target_url' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_clicks_target_url ON public.banner_clicks(target_url);
        RAISE NOTICE 'Created idx_banner_clicks_target_url index';
    END IF;
END $$;

-- Daily performance indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_performance_daily_banner_id' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_performance_daily_banner_id ON public.banner_performance_daily(banner_id);
        RAISE NOTICE 'Created idx_banner_performance_daily_banner_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_performance_daily_placement' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_performance_daily_placement ON public.banner_performance_daily(placement);
        RAISE NOTICE 'Created idx_banner_performance_daily_placement index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_performance_daily_date' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_performance_daily_date ON public.banner_performance_daily(date);
        RAISE NOTICE 'Created idx_banner_performance_daily_date index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_banner_performance_daily_ctr' 
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_banner_performance_daily_ctr ON public.banner_performance_daily(ctr);
        RAISE NOTICE 'Created idx_banner_performance_daily_ctr index';
    END IF;
END $$;

-- =============================================
-- 4. FUNCTIONS CREATION/MODIFICATION
-- =============================================

-- Function to calculate banner CTR (Click-Through Rate)
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION public.calculate_banner_ctr(impressions INTEGER, clicks INTEGER)
    RETURNS DECIMAL(5,4) AS $func$
    BEGIN
      IF impressions = 0 THEN
        RETURN 0.0000;
      ELSE
        RETURN ROUND((clicks::DECIMAL / impressions::DECIMAL) * 100, 4);
      END IF;
    END;
    $func$ LANGUAGE plpgsql;
    RAISE NOTICE 'Created/updated calculate_banner_ctr function';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating/updating calculate_banner_ctr function: %', SQLERRM;
END $$;

-- Function to get banner analytics summary
DO $$
BEGIN
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
    AS $func$
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
        '[]'::JSONB as top_cities,
        '[]'::JSONB as top_devices,
        '[]'::JSONB as top_browsers
      FROM public.banner_performance_daily bp
      WHERE
        (p_banner_id IS NULL OR bp.banner_id = p_banner_id)
        AND (p_placement IS NULL OR bp.placement = p_placement)
        AND (p_start_date IS NULL OR bp.date >= p_start_date)
        AND (p_end_date IS NULL OR bp.date <= p_end_date)
      GROUP BY bp.banner_id, bp.placement;
    END;
    $func$;
    RAISE NOTICE 'Created/updated get_banner_analytics_summary function';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating/updating get_banner_analytics_summary function: %', SQLERRM;
END $$;

-- =============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =============================================

DO $$
BEGIN
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
    RAISE NOTICE 'Added comments for documentation';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding comments: %', SQLERRM;
END $$;

-- =============================================
-- 6. GRANTS FOR FUNCTIONS
-- =============================================

DO $$
BEGIN
    GRANT EXECUTE ON FUNCTION public.calculate_banner_ctr TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION public.get_banner_analytics_summary TO authenticated;
    RAISE NOTICE 'Granted execute permissions on functions';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting function permissions: %', SQLERRM;
END $$;

-- =============================================
-- 7. FINALIZE MIGRATION
-- =============================================

-- Commit transaction
COMMIT;

-- Print completion message
RAISE NOTICE '=============================================';
RAISE NOTICE 'RENTPARLO.PK ANALYTICS TRACKING MIGRATION COMPLETE';
RAISE NOTICE '=============================================';
RAISE NOTICE 'The following changes have been applied:';
RAISE NOTICE '1. Added guest_id column to users table';
RAISE NOTICE '2. Made listing_id nullable in analytics_events table';
RAISE NOTICE '3. Added metadata column to analytics_events table';
RAISE NOTICE '4. Created unique index for guest_id in users table';
RAISE NOTICE '5. Created banner_impressions table';
RAISE NOTICE '6. Created banner_clicks table';
RAISE NOTICE '7. Created banner_performance_daily table';
RAISE NOTICE '8. Created all necessary indexes';
RAISE NOTICE '9. Created/updated tracking functions';
RAISE NOTICE '10. Added documentation comments';
RAISE NOTICE '11. Granted function permissions';
RAISE NOTICE '';
RAISE NOTICE 'The analytics tracking system is now ready for use!';
RAISE NOTICE '=============================================';