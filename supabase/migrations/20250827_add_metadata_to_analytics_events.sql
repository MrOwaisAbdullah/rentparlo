-- Add metadata column to analytics_events table
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS metadata JSONB;