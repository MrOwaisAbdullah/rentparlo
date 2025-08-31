-- Fix RLS policies for analytics events to ensure proper counting

-- Drop duplicate policy
DROP POLICY IF EXISTS "Sellers can view own analytics" ON public.analytics_events;

-- Recreate the policy with proper conditions
CREATE POLICY "Sellers can view own analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure the policy for inserting analytics events is correct
DROP POLICY IF EXISTS "Anyone can track analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can track analytics events" ON public.analytics_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE public.analytics_events TO authenticated, anon;