import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { WelcomeFlow } from '@/components/auth/welcome-flow';

export const metadata: Metadata = {
  title: 'Welcome to RentParLo.pk',
  description: 'Complete your profile setup and start using RentParLo.pk',
};

export default async function WelcomePage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect('/auth/login');
  }

  // If onboarding is already completed, redirect to dashboard
  if (userProfile.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <WelcomeFlow 
            user={{
              id: user.id,
              email: user.email!,
              name: userProfile.name || user.user_metadata?.full_name || user.user_metadata?.name,
              profileImage: userProfile.profile_image_url || user.user_metadata?.avatar_url,
              phone: userProfile.phone,
              city: userProfile.city,
              role: userProfile.role
            }}
          />
        </div>
      </div>
    </div>
  );
}