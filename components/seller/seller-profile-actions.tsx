'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/supabase-queries-client';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';

interface SellerProfileActionsProps {
  sellerId: string;
  username: string;
}

export function SellerProfileActions({ sellerId, username }: SellerProfileActionsProps) {
  const { user, loading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      if (loading || !user) {
        setLoadingProfile(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setIsOwner(profile?.user?.id === sellerId);
      } catch (error) {
        console.error('Error checking ownership:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkOwnership();
  }, [user, loading, sellerId]);

  if (loading || loadingProfile) {
    return null;
  }

  if (isOwner) {
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-10">
        <Button 
          asChild
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Link href="/dashboard/profile">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}