-- Fix guest_id columns to be TEXT instead of UUID
-- This is needed because we're using string-based guest IDs, not UUIDs

-- Fix analytics_events table
ALTER TABLE public.analytics_events 
ALTER COLUMN guest_id TYPE TEXT USING guest_id::TEXT;

-- Fix event_sessions table
ALTER TABLE public.event_sessions 
ALTER COLUMN guest_id TYPE TEXT USING guest_id::TEXT;

-- Fix user_guest_tracking table
ALTER TABLE public.user_guest_tracking 
ALTER COLUMN guest_id TYPE TEXT USING guest_id::TEXT;

-- Fix banner_impressions table
ALTER TABLE public.banner_impressions 
ALTER COLUMN guest_id TYPE TEXT USING guest_id::TEXT;

-- Fix banner_clicks table
ALTER TABLE public.banner_clicks 
ALTER COLUMN guest_id TYPE TEXT USING guest_id::TEXT;

-- Add comment to explain the guest_id column
COMMENT ON COLUMN public.analytics_events.guest_id IS 'Guest identifier for anonymous users (string format, not UUID)';
COMMENT ON COLUMN public.event_sessions.guest_id IS 'Guest identifier for anonymous users (string format, not UUID)';
COMMENT ON COLUMN public.user_guest_tracking.guest_id IS 'Guest identifier for anonymous users (string format, not UUID)';
COMMENT ON COLUMN public.banner_impressions.guest_id IS 'Guest identifier for anonymous users (string format, not UUID)';
COMMENT ON COLUMN public.banner_clicks.guest_id IS 'Guest identifier for anonymous users (string format, not UUID)';