'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/supabase-queries-client';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    // Only fetch profile data once when component mounts and user is available
    if (authLoading || hasFetchedRef.current) {
      return;
    }
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfileData(data);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  // Add event listener for profile image updates (only when user explicitly saves changes)
  useEffect(() => {
    const handleProfileImageUpdate = async () => {
      try {
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Error refetching profile after image update:', err);
      }
    };

    // Listen for profile image updates
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  if (authLoading || loading) {
    return <ProfilePageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-primary hover:underline"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't find your profile data.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-primary hover:underline"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileForm 
              initialData={profileData.user} 
              sellerProfile={profileData.sellerProfile}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}