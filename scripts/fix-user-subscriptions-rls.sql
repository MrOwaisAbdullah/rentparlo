-- Add missing RLS policies for user_subscriptions table
-- These policies allow users to manage their own subscriptions

-- Allow users to view their own subscriptions (already exists)
-- CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
--   FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allow users to create their own subscriptions
CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions" ON public.user_subscriptions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));