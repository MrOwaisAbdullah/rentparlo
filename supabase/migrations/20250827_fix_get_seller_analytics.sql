-- Fix get_seller_analytics RPC function to properly count analytics events
CREATE OR REPLACE FUNCTION public.get_seller_analytics(seller_id UUID)
RETURNS TABLE(
  total_views BIGINT,
  total_contact_clicks BIGINT,
  total_whatsapp_clicks BIGINT,
  top_listings JSONB,
  views_by_day JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN ae.event_type = 'view' THEN 1 ELSE 0 END), 0)::BIGINT as total_views,
    COALESCE(SUM(CASE WHEN ae.event_type = 'contact_click' THEN 1 ELSE 0 END), 0)::BIGINT as total_contact_clicks,
    COALESCE(SUM(CASE WHEN ae.event_type = 'WhatsApp_click' THEN 1 ELSE 0 END), 0)::BIGINT as total_whatsapp_clicks,
    '[]'::JSONB as top_listings,
    '[]'::JSONB as views_by_day
  FROM analytics_events ae
  WHERE ae.user_id = seller_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_seller_analytics TO authenticated, anon;