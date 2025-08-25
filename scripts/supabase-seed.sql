-- =====================================================
-- RentParlo.pk Supabase Database Seeding Script
-- =====================================================
-- This script populates the database with sample data for development and testing
-- 
-- ⚠️  IMPORTANT NOTE ABOUT FOREIGN KEY CONSTRAINTS  ⚠️
-- This script assumes that the UUIDs used for user IDs already exist in the 
-- auth.users table. If you get foreign key constraint errors like:
-- "ERROR: insert or update on table "users" violates foreign key constraint "users_id_fkey""
-- It means you need to first create these users in auth.users.
--
-- For a complete solution that handles this automatically, use the JavaScript-based
-- seeding script: scripts/supabase-seed-fixed.js
--
-- Run this after deploying the main schema.sql file

-- Insert Subscription Packages
INSERT INTO public.subscription_packages (id, name, price, currency, max_listings, max_featured_listings, analytics_days, features, billing_cycle, is_active, display_order) VALUES
(gen_random_uuid(), 'Basic', 0, 'PKR', 3, 0, 30, '{
  "location_boost": false,
  "priority_support": false,
  "advanced_analytics": false,
  "featured_listing": false,
  "listing_priority": 1
}'::jsonb, 'monthly', true, 1),

(gen_random_uuid(), 'Pro', 799, 'PKR', 10, 2, 90, '{
  "location_boost": true,
  "priority_support": false,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 2
}'::jsonb, 'monthly', true, 2),

(gen_random_uuid(), 'Premium', 1799, 'PKR', 20, 5, 180, '{
  "location_boost": true,
  "priority_support": true,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 3
}'::jsonb, 'monthly', true, 3),

(gen_random_uuid(), 'Business', 2799, 'PKR', 60, 10, 365, '{
  "location_boost": true,
  "priority_support": true,
  "advanced_analytics": true,
  "featured_listing": true,
  "listing_priority": 4
}'::jsonb, 'monthly', true, 4)
ON CONFLICT DO NOTHING;

-- Insert Sample Users
-- Note: In production, these would be created through Supabase Auth
-- For development, we're creating them directly

-- Insert sample users (assuming auth.users records exist)
INSERT INTO public.users (id, email, name, phone, role, created_at, is_verified, city, state, country, active, email_verified, notification_preferences, preferred_language) VALUES
-- Admin User
('11111111-1111-1111-1111-111111111111', 'admin@rentparlo.pk', 'Admin User', '+923001234567', 'admin', NOW(), true, 'Karachi', 'Sindh', 'Pakistan', true, true, '{"email": true, "sms": true, "push": true}'::jsonb, 'en'),

-- Sample Sellers
('22222222-2222-2222-2222-222222222222', 'ahmed@photography.com', 'Ahmed Khan', '+923001234568', 'seller', NOW(), true, 'Karachi', 'Sindh', 'Pakistan', true, true, '{"email": true, "sms": true, "push": true}'::jsonb, 'en'),

('33333333-3333-3333-3333-333333333333', 'sara@electronics.com', 'Sara Ahmed', '+923001234569', 'seller', NOW(), true, 'Lahore', 'Punjab', 'Pakistan', true, true, '{"email": true, "sms": false, "push": true}'::jsonb, 'en'),

('44444444-4444-4444-4444-444444444444', 'ali@cars.com', 'Ali Hassan', '+923001234570', 'seller', NOW(), true, 'Islamabad', 'ICT', 'Pakistan', true, true, '{"email": true, "sms": true, "push": false}'::jsonb, 'en'),

('55555555-5555-5555-5555-555555555555', 'fatima@medical.com', 'Fatima Sheikh', '+923001234571', 'seller', NOW(), true, 'Karachi', 'Sindh', 'Pakistan', true, true, '{"email": true, "sms": true, "push": true}'::jsonb, 'ur'),

('66666666-6666-6666-6666-666666666666', 'hassan@tools.com', 'Hassan Malik', '+923001234572', 'seller', NOW(), true, 'Lahore', 'Punjab', 'Pakistan', true, true, '{"email": true, "sms": true, "push": true}'::jsonb, 'en'),

-- Sample Regular Users
('77777777-7777-7777-7777-777777777777', 'user1@example.com', 'Muhammad Raza', '+923001234573', 'user', NOW(), true, 'Karachi', 'Sindh', 'Pakistan', true, true, '{"email": true, "sms": false, "push": true}'::jsonb, 'en'),

('88888888-8888-8888-8888-888888888888', 'user2@example.com', 'Ayesha Khan', '+923001234574', 'user', NOW(), true, 'Lahore', 'Punjab', 'Pakistan', true, true, '{"email": false, "sms": true, "push": true}'::jsonb, 'ur'),

('99999999-9999-9999-9999-999999999999', 'user3@example.com', 'Omar Sheikh', '+923001234575', 'user', NOW(), true, 'Islamabad', 'ICT', 'Pakistan', true, true, '{"email": true, "sms": true, "push": false}'::jsonb, 'en')

ON CONFLICT (id) DO NOTHING;

-- Insert Seller Profiles
INSERT INTO public.seller_profiles (id, username, business_name, owner_name, owner_cnic, address_line1, city, state, country, phone, email, is_verified, is_top_seller, tier, tier_points, verification_status, business_type, created_at, updated_at) VALUES

('22222222-2222-2222-2222-222222222222', 'ahmed_photography', 'Ahmed Photography Studio', 'Ahmed Khan', '42101-1234567-1', 'Plot 123, Block A, DHA Phase 2', 'Karachi', 'Sindh', 'Pakistan', '+923001234568', 'ahmed@photography.com', true, true, 'gold', 1250, 'approved', 'Photography Services', NOW(), NOW()),

('33333333-3333-3333-3333-333333333333', 'sara_electronics', 'Sara Electronics Store', 'Sara Ahmed', '35202-2345678-2', 'Shop 45, Main Market, Gulberg', 'Lahore', 'Punjab', 'Pakistan', '+923001234569', 'sara@electronics.com', true, false, 'silver', 850, 'approved', 'Electronics Retail', NOW(), NOW()),

('44444444-4444-4444-4444-444444444444', 'ali_luxury_cars', 'Ali Luxury Car Rentals', 'Ali Hassan', '37405-3456789-3', 'Office 12, Blue Area', 'Islamabad', 'ICT', 'Pakistan', '+923001234570', 'ali@cars.com', true, true, 'platinum', 2100, 'approved', 'Car Rental Services', NOW(), NOW()),

('55555555-5555-5555-5555-555555555555', 'fatima_medical', 'HealthFirst Medical Equipment', 'Fatima Sheikh', '42101-4567890-4', 'Clinic 78, Gulshan-e-Iqbal', 'Karachi', 'Sindh', 'Pakistan', '+923001234571', 'fatima@medical.com', true, false, 'bronze', 450, 'approved', 'Medical Equipment', NOW(), NOW()),

('66666666-6666-6666-6666-666666666666', 'hassan_tools', 'Hassan Construction Tools', 'Hassan Malik', '35202-5678901-5', 'Warehouse 15, Industrial Area', 'Lahore', 'Punjab', 'Pakistan', '+923001234572', 'hassan@tools.com', true, false, 'silver', 720, 'approved', 'Construction Equipment', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Insert Sample Affiliate Programs
INSERT INTO public.affiliate_programs (id, name, description, is_active, start_date, end_date, max_uses, current_uses) VALUES
(gen_random_uuid(), 'New Seller Program', 'Special program for new sellers to get started', true, NOW(), NOW() + INTERVAL '6 months', 100, 15),
(gen_random_uuid(), 'Photography Equipment Boost', 'Boost for photography equipment listings', true, NOW(), NOW() + INTERVAL '3 months', 50, 8),
(gen_random_uuid(), 'Summer Car Rental Special', 'Special rates for car rentals during summer', true, NOW(), NOW() + INTERVAL '4 months', 200, 45)
ON CONFLICT DO NOTHING;

-- Insert Sample Affiliate Codes
INSERT INTO public.affiliate_codes (id, code, seller_id, discount_type, discount_value, max_uses, current_uses, valid_from, valid_to, status) VALUES
(gen_random_uuid(), 'PHOTO10', '22222222-2222-2222-2222-222222222222', 'percentage', 10, 50, 5, NOW(), NOW() + INTERVAL '3 months', 'active'),
(gen_random_uuid(), 'CARS15', '44444444-4444-4444-4444-444444444444', 'percentage', 15, 100, 12, NOW(), NOW() + INTERVAL '6 months', 'active'),
(gen_random_uuid(), 'HEALTH500', '55555555-5555-5555-5555-555555555555', 'fixed', 500, 25, 3, NOW(), NOW() + INTERVAL '2 months', 'active')
ON CONFLICT DO NOTHING;

-- Insert Sample Analytics Events
-- These simulate user interactions with listings
INSERT INTO public.analytics_events (id, listing_id, event_type, user_id, guest_id, ip_address, city, device_type, created_at) VALUES
-- Camera listings analytics
(gen_random_uuid(), '1', 'view', '77777777-7777-7777-7777-777777777777', NULL, '192.168.1.100', 'Karachi', 'mobile', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), '1', 'contact_click', '77777777-7777-7777-7777-777777777777', NULL, '192.168.1.100', 'Karachi', 'mobile', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), '1', 'view', '88888888-8888-8888-8888-888888888888', NULL, '192.168.1.101', 'Lahore', 'desktop', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), '1', 'WhatsApp_click', '88888888-8888-8888-8888-888888888888', NULL, '192.168.1.101', 'Lahore', 'desktop', NOW() - INTERVAL '2 days'),

-- Car rental analytics
(gen_random_uuid(), '3', 'view', '99999999-9999-9999-9999-999999999999', NULL, '192.168.1.102', 'Islamabad', 'tablet', NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), '3', 'contact_click', '99999999-9999-9999-9999-999999999999', NULL, '192.168.1.102', 'Islamabad', 'tablet', NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), '3', 'view', NULL, gen_random_uuid(), '192.168.1.103', 'Karachi', 'mobile', NOW() - INTERVAL '5 hours'),

-- Medical equipment analytics
(gen_random_uuid(), '5', 'view', '77777777-7777-7777-7777-777777777777', NULL, '192.168.1.100', 'Karachi', 'mobile', NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), '5', 'view', '88888888-8888-8888-8888-888888888888', NULL, '192.168.1.101', 'Lahore', 'desktop', NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), '5', 'contact_click', '88888888-8888-8888-8888-888888888888', NULL, '192.168.1.101', 'Lahore', 'desktop', NOW() - INTERVAL '2 hours')

ON CONFLICT DO NOTHING;

-- Insert Sample Support Tickets
INSERT INTO public.support_tickets (id, user_id, subject, message, category, priority, status, created_at, updated_at) VALUES
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'Account Verification Issue', 'I am having trouble verifying my seller account. Please help.', 'verification', 'medium', 'open', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Listing Not Appearing in Search', 'My electronics listings are not showing up in search results.', 'listing', 'high', 'in_progress', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours'),

(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Payment Processing Problem', 'Having issues with subscription payment processing.', 'billing', 'urgent', 'resolved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),

(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', 'Website Loading Slowly', 'The website is loading very slowly on my mobile device.', 'technical', 'low', 'closed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days')

ON CONFLICT DO NOTHING;

-- Insert Sample User Subscriptions
WITH package_ids AS (
  SELECT id, name FROM public.subscription_packages WHERE name IN ('Pro', 'Premium', 'Basic')
)
INSERT INTO public.user_subscriptions (id, user_id, package_id, start_date, end_date, status, created_at, updated_at) VALUES
-- Ahmed Photography - Pro subscription
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', (SELECT id FROM package_ids WHERE name = 'Pro'), NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'active', NOW() - INTERVAL '15 days', NOW()),

-- Ali Cars - Premium subscription  
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', (SELECT id FROM package_ids WHERE name = 'Premium'), NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 'active', NOW() - INTERVAL '10 days', NOW()),

-- Sara Electronics - Basic subscription
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM package_ids WHERE name = 'Basic'), NOW() - INTERVAL '30 days', NOW() + INTERVAL '330 days', 'active', NOW() - INTERVAL '30 days', NOW())

ON CONFLICT DO NOTHING;

-- Insert Authentication Logs (sample login activities)
INSERT INTO public.auth_logs (id, user_id, action, ip_address, success, created_at) VALUES
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'login', '192.168.1.100', true, NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'login', '192.168.1.101', true, NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'login', '192.168.1.102', true, NOW() - INTERVAL '30 minutes'),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'failed_login', '192.168.1.103', false, NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'login', '192.168.1.103', true, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Update seller tier points based on analytics (simulate tier calculation)
UPDATE public.seller_profiles 
SET tier_points = 1250, tier = 'gold', tier_last_updated = NOW()
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.seller_profiles 
SET tier_points = 2100, tier = 'platinum', tier_last_updated = NOW()
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE public.seller_profiles 
SET tier_points = 850, tier = 'silver', tier_last_updated = NOW()
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Insert Seller Tier History
INSERT INTO public.seller_tier_history (id, seller_id, old_tier, new_tier, points_change, reason, created_at) VALUES
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'silver', 'gold', 200, 'Increased customer engagement and positive reviews', NOW() - INTERVAL '7 days'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'gold', 'platinum', 350, 'Premium subscription and high performance metrics', NOW() - INTERVAL '14 days'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'bronze', 'silver', 150, 'Consistent listing activity and customer satisfaction', NOW() - INTERVAL '21 days')
ON CONFLICT DO NOTHING;

-- Verify data insertion
SELECT 'Users created:' as summary, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Seller profiles created:', COUNT(*) FROM public.seller_profiles  
UNION ALL
SELECT 'Subscription packages created:', COUNT(*) FROM public.subscription_packages
UNION ALL  
SELECT 'Analytics events created:', COUNT(*) FROM public.analytics_events
UNION ALL
SELECT 'Support tickets created:', COUNT(*) FROM public.support_tickets
UNION ALL
SELECT 'User subscriptions created:', COUNT(*) FROM public.user_subscriptions;

-- Display seller information for verification
SELECT 
    u.name as seller_name,
    sp.username,
    sp.business_name,
    sp.tier,
    sp.tier_points,
    sp.is_verified,
    sp.is_top_seller,
    sp.verification_status
FROM public.users u
JOIN public.seller_profiles sp ON u.id = sp.id
WHERE u.role = 'seller'
ORDER BY sp.tier_points DESC;