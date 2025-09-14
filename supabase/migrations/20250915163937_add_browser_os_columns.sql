-- Add browser and os columns to analytics_events table
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT;