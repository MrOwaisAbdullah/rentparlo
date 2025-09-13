-- Fix banner analytics tracking issues
-- This script ensures all banner tracking columns are properly configured

-- Ensure placement and banner_size columns are nullable in banner_impressions
ALTER TABLE public.banner_impressions 
ALTER COLUMN placement DROP NOT NULL;

ALTER TABLE public.banner_impressions 
ALTER COLUMN banner_size DROP NOT NULL;

-- Ensure placement and banner_size columns are nullable in banner_clicks
ALTER TABLE public.banner_clicks 
ALTER COLUMN placement DROP NOT NULL;

ALTER TABLE public.banner_clicks 
ALTER COLUMN banner_size DROP NOT NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN public.banner_impressions.placement IS 'Placement location (homepage-top, category-sidebar, etc.) - can be null';
COMMENT ON COLUMN public.banner_impressions.banner_size IS 'Size of the banner (leaderboard, medium-rectangle, etc.) - can be null';
COMMENT ON COLUMN public.banner_clicks.placement IS 'Placement location - can be null';
COMMENT ON COLUMN public.banner_clicks.banner_size IS 'Size of the banner - can be null';

-- Fix the Sanity API mutation issue by updating the PUT route to use proper patch syntax
-- This is handled in the application code, not in the database

-- Ensure all guest_id columns are TEXT type (not UUID)
-- This was already fixed in a previous migration

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_id_placement 
ON public.banner_impressions(banner_id, placement);

CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id_placement 
ON public.banner_clicks(banner_id, placement);

-- Update comments for clarity
COMMENT ON TABLE public.banner_impressions IS 'Tracks impressions (displays) of advertisement banners with detailed context.';
COMMENT ON TABLE public.banner_clicks IS 'Tracks clicks on advertisement banners with detailed context.';