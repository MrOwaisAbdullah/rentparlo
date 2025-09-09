'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingDirect } from '@/components/auth/onboarding-direct';
import { Loader2 } from 'lucide-react';
import { getUserByIdClient } from '@/lib/supabase-queries-client';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Wait for auth to finish loading
      if (loading) {
        return;
      }
      
      // If no user after loading, redirect to login
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        // Fetch actual user profile from database
        const profile = await getUserByIdClient(user.id);
        
        if (!profile) {
          router.push('/auth/login');
          return;
        }
        
        // If onboarding is already completed, redirect to dashboard
        if (profile.onboarding_completed) {
          router.push('/dashboard');
          return;
        }
        
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [user, loading, router]);

  // Show loading state while auth is loading
  if (loading || isUpdating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">{error}</div>
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-primary hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while user profile is being fetched
  if (!userProfile && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If no user profile and no user, redirect to login (this should not happen if loading is false)
  if (!userProfile && !user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <OnboardingDirect
        user={{
          id: userProfile.id,
          email: userProfile.email!,
          name: userProfile.name,
          profileImage: userProfile.profile_image_url,
          phone: userProfile.phone,
          city: userProfile.city,
          role: userProfile.role
        }}
        onComplete={async () => {
          // Set updating state to show loading spinner
          setIsUpdating(true);
          
          // Small delay to allow for UI update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Refresh the page to get updated user data
          window.location.reload();
        }}
      />
    </div>
  );
}