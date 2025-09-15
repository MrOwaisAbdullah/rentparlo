-- Drop and recreate seller analytics view (safe for data; will affect dependent DB objects)
DROP VIEW IF EXISTS public.enhanced_seller_analytics CASCADE;

CREATE VIEW public.enhanced_seller_analytics WITH (security_invoker=on) AS
SELECT
  sp.id AS seller_id,
  sp.id AS user_id,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.created_at >= NOW() - INTERVAL '30 days') AS total_events,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'view' AND ae.created_at >= NOW() - INTERVAL '30 days') AS total_views,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'contact_click' AND ae.created_at >= NOW() - INTERVAL '30 days') AS total_contacts,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'WhatsApp_click' AND ae.created_at >= NOW() - INTERVAL '30 days') AS total_whatsapp_clicks,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'share' AND ae.created_at >= NOW() - INTERVAL '30 days') AS total_shares,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'save' AND ae.created_at >= NOW() - INTERVAL '30 days') AS total_saves,
  COUNT(DISTINCT es.session_id) FILTER (WHERE ae.created_at >= NOW() - INTERVAL '30 days') AS unique_sessions,
  COALESCE(
    ROUND(
      (COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'contact_click' AND ae.created_at >= NOW() - INTERVAL '30 days')::numeric
       / NULLIF(COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'view' AND ae.created_at >= NOW() - INTERVAL '30 days'), 0)) * 100,
      2
    ),
    0
  ) AS conversion_rate,
  AVG(es.session_duration) FILTER (WHERE ae.created_at >= NOW() - INTERVAL '30 days') AS avg_session_duration,
  sp.tier_points,
  sp.customer_rating AS avg_rating,
  sp.response_time_avg AS response_rate,
  sp.verification_status,
  sp.created_at AS seller_since
FROM public.seller_profiles sp
LEFT JOIN public.analytics_events ae
  ON ae.user_id = sp.id
LEFT JOIN public.event_sessions es
  ON es.session_id = ae.session_ref
GROUP BY
  sp.id,
  sp.tier_points,
  sp.customer_rating,
  sp.response_time_avg,
  sp.verification_status,
  sp.created_at;

-- Non-destructive listing analytics derived from analytics_events only.
-- Note: analytics_events.listing_id is text in your schema, so we keep it as text.
DROP VIEW IF EXISTS public.listing_analytics_v2 CASCADE;

CREATE VIEW public.listing_analytics_v2 WITH (security_invoker=on) AS
SELECT
  ae.listing_id,
  COUNT(*) FILTER (WHERE ae.event_type = 'view' AND ae.created_at >= NOW() - INTERVAL '30 days') AS views,
  COUNT(*) FILTER (WHERE ae.event_type = 'contact_click' AND ae.created_at >= NOW() - INTERVAL '30 days') AS contacts,
  COUNT(*) FILTER (WHERE ae.event_type = 'WhatsApp_click' AND ae.created_at >= NOW() - INTERVAL '30 days') AS whatsapp_clicks,
  COUNT(*) FILTER (WHERE ae.event_type = 'share' AND ae.created_at >= NOW() - INTERVAL '30 days') AS shares,
  COUNT(*) FILTER (WHERE ae.event_type = 'save' AND ae.created_at >= NOW() - INTERVAL '30 days') AS saves,
  COALESCE(
    ROUND(
      (COUNT(*) FILTER (WHERE ae.event_type = 'contact_click' AND ae.created_at >= NOW() - INTERVAL '30 days')::numeric
       / NULLIF(COUNT(*) FILTER (WHERE ae.event_type = 'view' AND ae.created_at >= NOW() - INTERVAL '30 days'), 0)) * 100,
      2
    ),
    0
  ) AS conversion_rate,
  MAX(ae.created_at) AS last_activity
FROM public.analytics_events ae
WHERE ae.listing_id IS NOT NULL
GROUP BY ae.listing_id;

-- Example helper: counts of listings for a seller using listings stored elsewhere.
-- If you later create a public.listings table, replace the FROM clause accordingly.
CREATE OR REPLACE FUNCTION public.get_seller_listing_counts(seller_id uuid)
RETURNS TABLE(
  total_listings bigint,
  active_listings bigint,
  inactive_listings bigint,
  draft_listings bigint
) AS $$
BEGIN
  -- If you don't have a public.listings table yet, return zeros to keep function safe.
  RETURN QUERY
  SELECT 0, 0, 0, 0;
END;
$$ LANGUAGE plpgsql;

-- Time-series analytics based on analytics_events (works with current tables)
CREATE OR REPLACE FUNCTION public.get_analytics_timeseries(
  p_seller_id uuid,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone,
  p_granularity text DEFAULT 'day'
)
RETURNS TABLE(
  period text,
  views bigint,
  contacts bigint,
  whatsapp_clicks bigint,
  shares bigint,
  saves bigint
) AS $$
DECLARE
  dt text;
  trunc_unit text;
BEGIN
  CASE p_granularity
    WHEN 'hour' THEN dt := 'YYYY-MM-DD HH24:00'; trunc_unit := 'hour';
    WHEN 'day'  THEN dt := 'YYYY-MM-DD'; trunc_unit := 'day';
    WHEN 'week' THEN dt := 'IYYY-"W"IW'; trunc_unit := 'week';
    WHEN 'month' THEN dt := 'YYYY-MM'; trunc_unit := 'month';
    ELSE dt := 'YYYY-MM-DD'; trunc_unit := 'day';
  END CASE;

  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC(trunc_unit, ae.created_at), dt) AS period,
    COUNT(*) FILTER (WHERE ae.event_type = 'view') AS views,
    COUNT(*) FILTER (WHERE ae.event_type = 'contact_click') AS contacts,
    COUNT(*) FILTER (WHERE ae.event_type = 'WhatsApp_click') AS whatsapp_clicks,
    COUNT(*) FILTER (WHERE ae.event_type = 'share') AS shares,
    COUNT(*) FILTER (WHERE ae.event_type = 'save') AS saves
  FROM public.analytics_events ae
  WHERE ae.user_id = p_seller_id
    AND ae.created_at >= p_start_date
    AND ae.created_at <= p_end_date
  GROUP BY DATE_TRUNC(trunc_unit, ae.created_at)
  ORDER BY DATE_TRUNC(trunc_unit, ae.created_at);
END;
$$ LANGUAGE plpgsql;

-- Geographic analytics using analytics_events.city (works with current schema)
CREATE OR REPLACE FUNCTION public.get_geographic_analytics(
  p_seller_id uuid,
  p_limit_results integer DEFAULT 20
)
RETURNS TABLE(
  city text,
  views bigint,
  contacts bigint,
  conversion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.city,
    COUNT(*) FILTER (WHERE ae.event_type = 'view') AS views,
    COUNT(*) FILTER (WHERE ae.event_type = 'contact_click') AS contacts,
    COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE ae.event_type = 'contact_click')::numeric
         / NULLIF(COUNT(*) FILTER (WHERE ae.event_type = 'view'), 0)) * 100,
        2
      ),
      0
    ) AS conversion_rate
  FROM public.analytics_events ae
  WHERE ae.user_id = p_seller_id
    AND ae.city IS NOT NULL
    AND ae.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY ae.city
  HAVING COUNT(*) FILTER (WHERE ae.event_type = 'view') > 0
  ORDER BY views DESC
  LIMIT p_limit_results;
END;
$$ LANGUAGE plpgsql;

-- Useful indexes to speed up these aggregated queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created_at_event
  ON public.analytics_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_listing_created_at
  ON public.analytics_events (listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_ref
  ON public.analytics_events (session_ref);

CREATE INDEX IF NOT EXISTS idx_event_sessions_user_id
  ON public.event_sessions (user_id);

-- Comments to document views/functions
COMMENT ON VIEW public.enhanced_seller_analytics IS 'Seller dashboard metrics (30-day window) using seller_profiles + analytics_events';
COMMENT ON VIEW public.listing_analytics_v2 IS 'Listing performance metrics derived from analytics_events.listing_id (no public.listings required)';