import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSellerByUsername, getSellerListings, getSellerListingsCount } from '@/lib/data-integration';
import { getSellerAnalytics, trackAnalyticsEvent } from '@/lib/supabase-queries';
import { SellerProfileContent } from '@/components/seller/seller-profile-content';
import { SellerProfileSkeleton } from '@/components/seller/seller-profile-skeleton';

export const dynamic = 'force-dynamic';

interface SellerPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  try {
    // Await params before accessing properties
    const { username } = await params;
    
    const seller = await getSellerByUsername(username);
    
    if (!seller) {
      return {
        title: 'Seller Not Found | RentParLo.pk',
        description: 'The requested seller profile could not be found.',
      };
    }

    // Handle both cases: seller with profile nested and seller with direct profile properties
    const profile = seller.profile || seller;
    const sellerName = profile.business_name || profile.username || 'Seller';
    const tier = profile.tier || 'basic';
    const isVerified = profile.is_verified || false;
    const avatarUrl = profile.avatar_url || null;
    const city = seller.city || profile.city || 'Pakistan';

    const description = `View ${sellerName}'s rental listings and profile on RentParLo.pk. ${tier} tier seller.`;

    return {
      title: `${sellerName} - ${tier} Seller | RentParLo.pk`,
      description,
      keywords: [
        sellerName,
        'seller profile',
        'rental items',
        city,
        tier,
        'verified seller'
      ].filter(Boolean).join(', '),
      openGraph: {
        title: `${sellerName} - Seller Profile`,
        description,
        type: 'profile',
        url: `/seller/${username}`,
        images: avatarUrl ? [
          {
            url: avatarUrl,
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
        images: avatarUrl ? [avatarUrl] : [],
      },
      robots: {
        index: isVerified,
        follow: isVerified,
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
async function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  try {
    // Await params before accessing properties
    const { username } = await params;
    
    // Fetch seller data
    const seller = await getSellerByUsername(username);
    
    if (!seller) {
      notFound();
    }

    console.log(`Tracking profile view for seller ${seller.id} (${username})`);
    
    // Track profile view on server side to ensure it works for all users
    try {
      // Only track if we have a valid seller ID
      if (seller && seller.id) {
        const trackResult = await trackAnalyticsEvent({
          event_type: 'view',
          user_id: seller.id,
          listing_id: null, // No listing ID for profile views
          metadata: { page: 'seller_profile', username: username }
        });
        
        console.log(`Profile view tracking result for ${username}:`, trackResult);
      }
    } catch (trackingError) {
      console.error('Error tracking profile view:', trackingError);
    }

    // Handle both cases: seller with profile nested and seller with direct profile properties
    const profile = seller.profile || seller;
    
    // Fetch seller's listings, analytics, and listing count in parallel
    const [listings, analytics, listingCount] = await Promise.all([
      getSellerListings(seller.id, { limit: 20, status: 'active' }),
      getSellerAnalytics(seller.id),
      getSellerListingsCount(seller.id)
    ]);

    console.log(`Raw analytics for seller ${seller.id} (${username}):`, analytics);

    // Ensure we have valid numbers for all analytics values
    const validatedAnalytics = {
      totalViews: typeof analytics.totalViews === 'number' ? analytics.totalViews : 0,
      totalContactClicks: typeof analytics.totalContactClicks === 'number' ? analytics.totalContactClicks : 0,
      totalWhatsAppClicks: typeof analytics.totalWhatsAppClicks === 'number' ? analytics.totalWhatsAppClicks : 0,
      totalListings: typeof listingCount === 'number' ? listingCount : 0,
      activeListings: Array.isArray(listings) ? listings.length : 0,
      uniqueUsers: 0, // Default value, will be updated if available
      avgSessionDuration: 0 // Default value, will be updated if available
    };

    console.log(`Validated analytics for seller ${seller.id} (${username}):`, validatedAnalytics);

    // Ensure we're passing only serializable data
    const serializableSeller = JSON.parse(JSON.stringify({
      id: seller.id,
      username: profile.username,
      business_name: profile.business_name,
      owner_name: profile.owner_name,
      email: seller.email,
      phone: seller.phone || profile.phone,
      city: seller.city || profile.city,
      state: seller.state || profile.state,
      website: profile.website,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      is_verified: seller.is_verified || profile.is_verified,
      is_top_seller: profile.is_top_seller,
      tier: profile.tier,
      tier_points: profile.tier_points,
      verification_status: profile.verification_status,
      business_hours: profile.business_hours,
      response_time_avg: profile.response_time_avg || 0,
      customer_rating: profile.customer_rating || 0,
      total_reviews: profile.total_reviews || 0,
      total_sales: profile.total_sales || 0,
      created_at: seller.created_at || profile.created_at || new Date().toISOString(),
      social_media_links: profile.social_media_links,
      business_type: profile.business_type,
      last_login: seller.last_login,
      active: seller.active,
      email_verified: seller.email_verified,
      country: seller.country || profile.country,
      notification_preferences: seller.notification_preferences,
      preferred_language: seller.preferred_language,
      listing_count: listingCount // Add the calculated listing count
    }));

    // Ensure listings are serializable and remove circular references
    const serializableListings = JSON.parse(JSON.stringify(listings.map(listing => ({
      ...listing,
      seller: undefined // Remove seller reference to avoid circular references
    }))));

    // Ensure analytics are serializable
    const serializableAnalytics = JSON.parse(JSON.stringify(validatedAnalytics));

    return (
      <SellerProfileContent 
        seller={serializableSeller}
        listings={serializableListings}
        analytics={serializableAnalytics}
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
          <p className="text-muted-foreground text-sm">
            If the problem persists, please refresh the page or contact support.
          </p>
        </div>
      </div>
    );
  }
}

export default async function SellerPage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SellerProfileSkeleton />}>
        <SellerProfilePage params={params} />
      </Suspense>
    </div>
  );
}