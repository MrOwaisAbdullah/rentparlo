'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/supabase-queries-client';
import { Loader2 } from 'lucide-react';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
