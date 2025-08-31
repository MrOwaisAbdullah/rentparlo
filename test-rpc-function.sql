-- Test the get_seller_analytics RPC function

-- First, let's check if there are any analytics events for a specific seller
SELECT * FROM analytics_events 
WHERE user_id = '66666666-6666-6666-6666-666666666666' 
LIMIT 10;

-- Now let's test the RPC function directly
SELECT * FROM get_seller_analytics('66666666-6666-6666-6666-666666666666');

-- Let's also check the count of events directly
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE event_type = 'contact_click') as total_contact_clicks,
  COUNT(*) FILTER (WHERE event_type = 'WhatsApp_click') as total_whatsapp_clicks
FROM analytics_events 
WHERE user_id = '66666666-6666-6666-6666-666666666666';