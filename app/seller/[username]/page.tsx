import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SellerProfileHeader } from '@/components/seller/seller-profile-header';
import { SellerProfileTabs, SellerProfileTabContent } from '@/components/seller/seller-profile-tabs';
import { SellerBasicInfo } from '@/components/seller/seller-basic-info';
import { AdBanner } from '@/components/ads/ad-banner';
import { SellerProfileActions } from '@/components/seller/seller-profile-actions';
import { ListingCard } from '@/components/cards/listing-card';
import { getCompleteSellerProfile } from '@/lib/data-integration';
import { trackAnalyticsEvent } from '@/lib/supabase-queries';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import { STATIC_CATEGORIES } from '@/lib/static-categories';
import { calculateResponseTime } from '@/lib/seller-utils';

interface SellerPageProps {
  params: Promise<{
    username: string;
  }>;
}

// Define the type for the complete seller profile
interface CompleteSellerProfile {
  seller: any; // You might want to import and use the actual Seller type
  listings: Listing[];
  analytics: any;
  subscription: any;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  // Await params before using
  const { username } = await params;
  
  // Fetch actual seller data
  const seller = await getCompleteSellerProfile(username);
  
  if (!seller) {
    return {
      title: 'Seller Not Found | RentParLo.pk',
      description: 'The requested seller profile could not be found.',
    };
  }

  const displayName = seller.seller.profile.business_name || seller.seller.profile.username;
  
  return {
    title: `${displayName} - Seller Profile | RentParLo.pk`,
    description: `Browse rental items from ${displayName} on RentParLo.pk. Verified seller with listings in ${seller.seller.city}, ${seller.seller.state}.`,
    keywords: [
      displayName,
      'rental items',
      'seller profile',
      seller.seller.city || '',
      seller.seller.state || '',
      'Pakistan rentals'
    ].filter(Boolean),
  };
}

// Track seller profile view
async function trackProfileView(sellerId: string) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    
    // Track the profile view only if we have a valid seller ID
    if (sellerId) {
      await trackAnalyticsEvent({
        event_type: 'profile_view',
        metadata: { seller_id: sellerId },
        referrer: referer,
        user_agent: userAgent
      });
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
    // Don't fail the page load for analytics errors
  }
}

export default async function SellerPage({ params }: SellerPageProps) {
  // Await params before using
  const { username } = await params;
  
  // Fetch actual seller data based on username
  const seller: CompleteSellerProfile | null = await getCompleteSellerProfile(username);
  
  if (!seller) {
    notFound();
  }

  // Track profile view (fire and forget)
  trackProfileView(seller.seller.id);

  // Calculate response time using our unified function
  const responseTimeInfo = calculateResponseTime(seller.seller);
  
  const sellerData = {
    customer_rating: seller.seller.profile.customer_rating || 0,
    total_reviews: seller.seller.profile.total_reviews || 0,
    response_time_avg: responseTimeInfo.hours * 60, // Convert hours to minutes for compatibility
    response_time_display: responseTimeInfo.displayText,
    response_time_description: responseTimeInfo.description,
    total_listings: seller.listings.length || 0,
    active_listings: seller.listings.filter((l: Listing) => l.status === 'active').length || 0
  };

  const featuredListings = seller.listings.filter((l: Listing) => l.isFeatured);
  const listingsByCategory = seller.listings.reduce((acc: Record<string, Listing[]>, listing: Listing) => {
    // Use category slug instead of title for better URL compatibility
    const category = typeof listing.category?.slug === 'object' && 'current' in listing.category?.slug
      ? listing.category?.slug.current
      : listing.category?.slug || listing.category?.title || 'Uncategorized';
                     
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(listing);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Seller Profile Header */}
        <SellerProfileHeader seller={seller.seller} listingCount={seller.listings.length} />

        {/* Profile Tabs */}
        <SellerProfileTabs defaultTab="products">
          {/* Products Tab */}
          <SellerProfileTabContent value="products">
            <div className="space-y-8">
              {/* Improved Listing Organization - All listings in one responsive grid */}
              <div className="space-y-8">
                {/* Featured Listings Section */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Featured Listings</h2>
                  {featuredListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {featuredListings.map((listing: Listing) => (
                        <ListingCard
                          key={listing._id}
                          listing={listing}
                          variant="category"
                          showSellerInfo={false}
                          className="h-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No featured listings available.</p>
                    </div>
                  )}
                </div>

                {/* Listings by Category Section */}
                {Object.entries(listingsByCategory).map(([categorySlug, listings]) => (
                  <div key={categorySlug} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        {STATIC_CATEGORIES.find(cat => 
                          (typeof cat.slug === 'string' ? cat.slug : cat.slug.current) === categorySlug
                        )?.title || 
                        categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ')}
                      </h2>
                      <Link href={`/search?category=${encodeURIComponent(categorySlug)}&seller=${encodeURIComponent(seller.seller.id)}`}>
                        <Button variant="outline">View All</Button>
                      </Link>
                    </div>
                    {listings.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {listings.map((listing: Listing) => (
                          <ListingCard
                            key={listing._id}
                            listing={listing}
                            variant="category"
                            showSellerInfo={false}
                            className="h-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No listings in this category.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Advertisement Banner */}
              <AdBanner placement="seller-profile" size="large-banner" />  
            </div>
          </SellerProfileTabContent>

          {/* About Us Tab */}
          <SellerProfileTabContent value="about">
            <div className="space-y-8">
              {/* Seller Basic Info */}
              <SellerBasicInfo 
                seller={sellerData}
              />

              {/* Additional seller information */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">About {seller.seller.profile.business_name || seller.seller.profile.username}</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Welcome to our rental service! We specialize in providing high-quality electronics 
                    and equipment for rent in {seller.seller.city} and surrounding areas.
                  </p>
                  <p>
                    With over {Math.floor((Date.now() - new Date(seller.seller.profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months 
                    of experience on RentParlo, we pride ourselves on excellent customer service 
                    and well-maintained equipment.
                  </p>
                  <p>
                    All our items are thoroughly tested and sanitized before each rental. 
                    We offer flexible rental periods and competitive pricing.
                  </p>
                </div>
              </div>
            </div>
          </SellerProfileTabContent>
        </SellerProfileTabs>
        
        {/* Edit Profile Button for Owner */}
        <SellerProfileActions 
          sellerId={seller.seller.id} 
          username={seller.seller.profile.username} 
        />
      </div>
    </div>
  );
}