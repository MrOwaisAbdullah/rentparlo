import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SellerProfileHeader } from '@/components/seller/seller-profile-header';
import { SellerProfileTabs, SellerProfileTabContent } from '@/components/seller/seller-profile-tabs';
import { SellerStats } from '@/components/seller/seller-stats';
import { AdBanner } from '@/components/ads/ad-banner';
import { mockSeller, mockHotRentalListings, mockHotRentalProductsListings, mockRentalProductsListings, mockSellerAnalytics } from '@/app/sellerProfileMockData';
import { ClientProductListingSection } from '@/components/seller/client-product-listing-section';

interface SellerPageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  // In a real app, you would fetch seller data here
  const seller = mockSeller;
  
  if (!seller) {
    return {
      title: 'Seller Not Found | RentParlo.pk',
      description: 'The requested seller profile could not be found.',
    };
  }

  const displayName = seller.profile.business_name || seller.profile.username;
  
  return {
    title: `${displayName} - Seller Profile | RentParlo.pk`,
    description: `Browse rental items from ${displayName} on RentParlo.pk. Verified seller with ${seller.listingCount} listings in ${seller.city}, ${seller.state}.`,
    keywords: [
      displayName,
      'rental items',
      'seller profile',
      seller.city || '',
      seller.state || '',
      'Pakistan rentals'
    ].filter(Boolean),
  };
}

export default async function SellerPage({ params }: SellerPageProps) {
  // In the Server Component, we can access params directly
  const { username } = params;
  
  // In a real app, you would fetch seller data based on username
  // For now, we'll use mock data
  const seller = mockSeller;
  
  if (!seller || seller.profile.username !== username) {
    notFound();
  }

  // Mock analytics data for the seller stats component
  const sellerStatsData = {
    customer_rating: 4.8,
    total_reviews: 156,
    total_sales: 89,
    response_time_avg: 120, // 2 hours in minutes
    created_at: seller.profile.created_at
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Seller Profile Header */}
        <SellerProfileHeader seller={seller} />

        {/* Profile Tabs */}
        <SellerProfileTabs defaultTab="products">
          {/* Products Tab */}
          <SellerProfileTabContent value="products">
            <div className="space-y-8">
              {/* Hot Rental Section - Client Component Wrapper */}
              <ClientProductListingSection
                title="Hot Rental"
                listings={mockHotRentalListings}
              />

              {/* Hot Rental Products Section - Client Component Wrapper */}
              <ClientProductListingSection
                title="Hot Rental Products"
                listings={mockHotRentalProductsListings}
              />

              {/* Rental Products Section - Client Component Wrapper */}
              <ClientProductListingSection
                title="Rental Products"
                listings={mockRentalProductsListings}
              />

              {/* Advertisement Banner */}
              <AdBanner placement="seller-profile" size="large-banner" />  
            </div>
          </SellerProfileTabContent>

          {/* About Us Tab */}
          <SellerProfileTabContent value="about">
            <div className="space-y-8">

              {/* Additional seller information */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">About {seller.profile.business_name || seller.profile.username}</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Welcome to our rental service! We specialize in providing high-quality electronics 
                    and equipment for rent in Lahore and surrounding areas.
                  </p>
                  <p>
                    With over {Math.floor((Date.now() - new Date(seller.profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months 
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
      </div>
    </div>
  );
}