'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/supabase-queries-client';
import { Loader2 } from 'lucide-react';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-1/2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            {profileData.user.role === 'seller' && (
              <TabsTrigger value="seller">Seller Profile</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
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
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your notification and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Preferences settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {profileData.user.role === 'seller' && (
            <TabsContent value="seller" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Profile</CardTitle>
                  <CardDescription>
                    Manage your seller profile and business information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p>{profileData.sellerProfile?.business_name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p>{profileData.sellerProfile?.username || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verification Status</p>
                        <p className="capitalize">
                          {profileData.sellerProfile?.verification_status || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tier</p>
                        <p className="capitalize">
                          {profileData.sellerProfile?.tier || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (profileData.sellerProfile?.username) {
                          window.open(`/seller/${profileData.sellerProfile.username}`, '_blank');
                        }
                      }}
                      disabled={!profileData.sellerProfile?.username}
                    >
                      View Public Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
