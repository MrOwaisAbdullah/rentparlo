-- Dashboard Performance Optimization Migration
-- Creates optimized views, functions, and indexes for dashboard queries

-- Create enhanced seller analytics view
CREATE OR REPLACE VIEW enhanced_seller_analytics AS
SELECT 
  sp.id as seller_id,
  sp.user_id,
  COUNT(DISTINCT ae.id) as total_events,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'listing_view' THEN ae.id END) as total_views,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'contact_click' THEN ae.id END) as total_contacts,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'whatsapp_click' THEN ae.id END) as total_whatsapp_clicks,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'share' THEN ae.id END) as total_shares,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'save' THEN ae.id END) as total_saves,
  COUNT(DISTINCT ae.session_id) as unique_sessions,
  COALESCE(
    ROUND(
      (COUNT(DISTINCT CASE WHEN ae.event_type = 'contact_click' THEN ae.id END)::numeric / 
       NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'listing_view' THEN ae.id END), 0)) * 100, 
      2
    ), 
    0
  ) as conversion_rate,
  AVG(ae.session_duration) as avg_session_duration,
  sp.tier_points,
  sp.avg_rating,
  sp.response_rate,
  sp.verification_status,
  sp.created_at as seller_since
FROM seller_profiles sp
LEFT JOIN analytics_events ae ON ae.user_id = sp.id 
  AND ae.created_at >= NOW() - INTERVAL '30 days'
GROUP BY sp.id, sp.user_id, sp.tier_points, sp.avg_rating, sp.response_rate, 
         sp.verification_status, sp.created_at;

-- Create listing analytics view
CREATE OR REPLACE VIEW listing_analytics_view AS
SELECT 
  l.id as listing_id,
  l.title,
  l.price,
  l.status,
  l.created_at,
  l.supabase_id as seller_id,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'listing_view' THEN ae.id END) as views,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'contact_click' THEN ae.id END) as contacts,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'whatsapp_click' THEN ae.id END) as whatsapp_clicks,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'share' THEN ae.id END) as shares,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'save' THEN ae.id END) as saves,
  COALESCE(
    ROUND(
      (COUNT(DISTINCT CASE WHEN ae.event_type = 'contact_click' THEN ae.id END)::numeric / 
       NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'listing_view' THEN ae.id END), 0)) * 100, 
      2
    ), 
    0
  ) as conversion_rate,
  MAX(ae.created_at) as last_activity
FROM listings l
LEFT JOIN analytics_events ae ON ae.listing_id = l.id 
  AND ae.created_at >= NOW() - INTERVAL '30 days'
GROUP BY l.id, l.title, l.price, l.status, l.created_at, l.supabase_id;

-- Function to get seller listing counts
CREATE OR REPLACE FUNCTION get_seller_listing_counts(seller_id UUID)
RETURNS TABLE(
  total_listings BIGINT,
  active_listings BIGINT,
  inactive_listings BIGINT,
  draft_listings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_listings,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_listings,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_listings
  FROM listings 
  WHERE supabase_id = seller_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics time series data
CREATE OR REPLACE FUNCTION get_analytics_timeseries(
  seller_id UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  granularity TEXT DEFAULT 'day'
)
RETURNS TABLE(
  date TEXT,
  views BIGINT,
  contacts BIGINT,
  whatsapp_clicks BIGINT,
  shares BIGINT,
  saves BIGINT
) AS $$
DECLARE
  date_format TEXT;
  date_trunc_format TEXT;
BEGIN
  -- Set format based on granularity
  CASE granularity
    WHEN 'hour' THEN 
      date_format := 'YYYY-MM-DD HH24:00';
      date_trunc_format := 'hour';
    WHEN 'day' THEN 
      date_format := 'YYYY-MM-DD';
      date_trunc_format := 'day';
    WHEN 'week' THEN 
      date_format := 'YYYY-"W"WW';
      date_trunc_format := 'week';
    WHEN 'month' THEN 
      date_format := 'YYYY-MM';
      date_trunc_format := 'month';
    ELSE 
      date_format := 'YYYY-MM-DD';
      date_trunc_format := 'day';
  END CASE;

  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC(date_trunc_format, ae.created_at), date_format) as date,
    COUNT(CASE WHEN ae.event_type = 'listing_view' THEN 1 END) as views,
    COUNT(CASE WHEN ae.event_type = 'contact_click' THEN 1 END) as contacts,
    COUNT(CASE WHEN ae.event_type = 'whatsapp_click' THEN 1 END) as whatsapp_clicks,
    COUNT(CASE WHEN ae.event_type = 'share' THEN 1 END) as shares,
    COUNT(CASE WHEN ae.event_type = 'save' THEN 1 END) as saves
  FROM analytics_events ae
  WHERE ae.user_id = seller_id
    AND ae.created_at >= start_date
    AND ae.created_at <= end_date
  GROUP BY DATE_TRUNC(date_trunc_format, ae.created_at)
  ORDER BY DATE_TRUNC(date_trunc_format, ae.created_at);
END;
$$ LANGUAGE plpgsql;

-- Function to get geographic analytics
CREATE OR REPLACE FUNCTION get_geographic_analytics(
  seller_id UUID,
  limit_results INTEGER DEFAULT 20
)
RETURNS TABLE(
  city TEXT,
  views BIGINT,
  contacts BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.city,
    COUNT(CASE WHEN ae.event_type = 'listing_view' THEN 1 END) as views,
    COUNT(CASE WHEN ae.event_type = 'contact_click' THEN 1 END) as contacts,
    COALESCE(
      ROUND(
        (COUNT(CASE WHEN ae.event_type = 'contact_click' THEN 1 END)::numeric / 
         NULLIF(COUNT(CASE WHEN ae.event_type = 'listing_view' THEN 1 END), 0)) * 100, 
        2
      ), 
      0
    ) as conversion_rate
  FROM analytics_events ae
  WHERE ae.user_id = seller_id
    AND ae.city IS NOT NULL
    AND ae.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY ae.city
  HAVING COUNT(CASE WHEN ae.event_type = 'listing_view' THEN 1 END) > 0
  ORDER BY views DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  total_events BIGINT,
  total_views BIGINT,
  total_contacts BIGINT,
  unique_users BIGINT,
  unique_sessions BIGINT,
  avg_session_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type = 'listing_view' THEN 1 END) as total_views,
    COUNT(CASE WHEN event_type = 'contact_click' THEN 1 END) as total_contacts,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(session_duration) as avg_session_duration
  FROM analytics_events
  WHERE created_at >= start_date
    AND created_at <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get slow queries (placeholder for monitoring)
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
  query TEXT,
  avg_duration NUMERIC,
  call_count BIGINT
) AS $$
BEGIN
  -- This would typically query pg_stat_statements if available
  -- For now, return empty result
  RETURN QUERY
  SELECT 
    'No slow queries detected'::TEXT as query,
    0::NUMERIC as avg_duration,
    0::BIGINT as call_count
  WHERE FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id_created_at 
ON analytics_events (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_listing_id_event_type 
ON analytics_events (listing_id, event_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_session_id 
ON analytics_events (session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_city_created_at 
ON analytics_events (city, created_at) WHERE city IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_device_type 
ON analytics_events (device_type) WHERE device_type IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_supabase_id_status 
ON listings (supabase_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_profiles_tier_points 
ON seller_profiles (tier_points DESC);

-- Create partial indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_recent_views 
ON analytics_events (user_id, created_at) 
WHERE event_type = 'listing_view' AND created_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_recent_contacts 
ON analytics_events (user_id, created_at) 
WHERE event_type = 'contact_click' AND created_at >= NOW() - INTERVAL '30 days';

-- Add comments for documentation
COMMENT ON VIEW enhanced_seller_analytics IS 'Optimized view for seller dashboard metrics with 30-day analytics data';
COMMENT ON VIEW listing_analytics_view IS 'Optimized view for individual listing performance metrics';
COMMENT ON FUNCTION get_seller_listing_counts IS 'Returns listing counts by status for a seller';
COMMENT ON FUNCTION get_analytics_timeseries IS 'Returns time-series analytics data with configurable granularity';
COMMENT ON FUNCTION get_geographic_analytics IS 'Returns geographic performance breakdown for a seller';
COMMENT ON FUNCTION get_analytics_summary IS 'Returns overall analytics summary for a date range';