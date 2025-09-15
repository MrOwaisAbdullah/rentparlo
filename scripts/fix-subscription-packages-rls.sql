-- Add RLS policies for subscription_packages table
-- These policies allow anyone to view active subscription packages
-- Only admins can manage (insert/update/delete) packages

-- Allow anyone to view active subscription packages
CREATE POLICY "Anyone can view active subscription packages" ON public.subscription_packages
  FOR SELECT TO authenticated, anon 
  USING (is_active = true);

-- Allow admins to manage subscription packages
CREATE POLICY "Admins can manage subscription packages" ON public.subscription_packages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

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

-- Ensure RLS is enabled for both tables
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;