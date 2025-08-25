import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSellerByUsername, getSellerListings } from '@/lib/data-integration';
import { getSellerAnalytics } from '@/lib/supabase-queries';
import { SellerProfileContent } from '@/components/seller/seller-profile-content';
import { SellerProfileSkeleton } from '@/components/seller/seller-profile-skeleton';

interface SellerPageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  try {
    const seller = await getSellerByUsername(params.username);
    
    if (!seller) {
      return {
        title: 'Seller Not Found | RentParLo.pk',
        description: 'The requested seller profile could not be found.',
      };
    }

    const sellerName = seller.profile.business_name || seller.profile.username;
    const description = `View ${sellerName}'s rental listings and profile on RentParLo.pk. ${seller.profile.tier} tier seller.`;

    return {
      title: `${sellerName} - ${seller.profile.tier} Seller | RentParLo.pk`,
      description,
      keywords: [
        sellerName,
        'seller profile',
        'rental items',
        seller.city || 'Pakistan',
        seller.profile.tier,
        'verified seller'
      ].filter(Boolean).join(', '),
      openGraph: {
        title: `${sellerName} - Seller Profile`,
        description,
        type: 'profile',
        url: `/seller/${params.username}`,
        images: seller.profile.avatar_url ? [
          {
            url: seller.profile.avatar_url,
            width: 400,
            height: 400,
            alt: `${sellerName} profile picture`,
          }
        ] : [],
      },
      twitter: {
        card: 'summary',
        title: `${sellerName} - Seller Profile`,
        description,
        images: seller.profile.avatar_url ? [seller.profile.avatar_url] : [],
      },
      robots: {
        index: seller.profile.is_verified,
        follow: seller.profile.is_verified,
      },
    };
  } catch (error) {
    console.error('Error generating seller metadata:', error);
    return {
      title: 'Seller Profile | RentParLo.pk',
      description: 'View seller profile and listings on RentParLo.pk',
    };
  }
}

// Server component for data fetching
async function SellerProfilePage({ username }: { username: string }) {
  try {
    // Fetch seller data
    const seller = await getSellerByUsername(username);
    
    if (!seller) {
      notFound();
    }

    // Fetch seller's listings and analytics in parallel
    const [listings, analytics] = await Promise.all([
      getSellerListings(seller.id, { limit: 20, status: 'active' }),
      getSellerAnalytics(seller.id)
    ]);

    return (
      <SellerProfileContent 
        seller={{
          ...seller.profile,
          id: seller.id,
          email: seller.email,
          phone: seller.phone,
          city: seller.city,
          state: seller.state,
          country: seller.country || 'Pakistan',
          is_verified: seller.is_verified,
          created_at: seller.created_at,
          last_login: seller.last_login,
          active: seller.active
        }}
        listings={listings}
        analytics={analytics}
      />
    );
  } catch (error) {
    console.error('Error loading seller profile:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading this seller's profile. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default async function SellerPage({ params }: SellerPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SellerProfileSkeleton />}>
        <SellerProfilePage username={params.username} />
      </Suspense>
    </div>
  );
}