-- Insert Subscription Packages with ON CONFLICT handling
INSERT INTO public.subscription_packages (id, name, price, currency, max_listings, max_featured_listings, analytics_days, features, billing_cycle, is_active, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Basic', 0, 'PKR', 3, 0, 30, '{
  "location_boost": false,
  "priority_support": false,
  "advanced_analytics": false,
  "featured_listing": false,
  "listing_priority": 1,
  "category_priority_placement": false,
  "search_top_placement": false,
  "guaranteed_top_placement": false,
  "custom_analytics_reports": false
}'::jsonb, 'monthly', true, 1),

('22222222-2222-2222-2222-222222222222', 'Pro', 799, 'PKR', 10, 2, 90, '{
  "location_boost": true,
  "priority_support": false,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 2,
  "category_priority_placement": true,
  "search_top_placement": false,
  "guaranteed_top_placement": false,
  "custom_analytics_reports": false
}'::jsonb, 'monthly', true, 2),

('33333333-3333-3333-3333-333333333333', 'Premium', 1799, 'PKR', 20, 5, 180, '{
  "location_boost": true,
  "priority_support": true,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 3,
  "category_priority_placement": true,
  "search_top_placement": true,
  "guaranteed_top_placement": true,
  "custom_analytics_reports": true
}'::jsonb, 'monthly', true, 3),

('44444444-4444-4444-4444-444444444444', 'Business', 2799, 'PKR', 60, 10, 365, '{
  "location_boost": true,
  "priority_support": true,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 4,
  "category_priority_placement": true,
  "search_top_placement": true,
  "guaranteed_top_placement": true,
  "custom_analytics_reports": true
}'::jsonb, 'monthly', true, 4)

ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  max_listings = EXCLUDED.max_listings,
  max_featured_listings = EXCLUDED.max_featured_listings,
  analytics_days = EXCLUDED.analytics_days,
  features = EXCLUDED.features,
  billing_cycle = EXCLUDED.billing_cycle,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;