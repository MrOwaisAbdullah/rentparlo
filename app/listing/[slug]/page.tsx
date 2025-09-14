import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEnhancedListingBySlug, getSimilarListings, getListingReviews } from '@/lib/data-integration';
import { trackAnalyticsEvent } from '@/lib/supabase-queries';
import { ListingDetailContent } from '@/components/listing/listing-detail-content';
import { ListingDetailSkeleton } from '@/components/listing/listing-detail-skeleton';
import { ClientRetryButton } from '@/components/listing/client-retry-button';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  try {
    // Await the params in Next.js 15 if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const listing = await getEnhancedListingBySlug(resolvedParams.slug, user?.id);
    
    if (!listing) {
      return {
        title: 'Listing Not Found | RentParLo.pk',
        description: 'The requested listing could not be found.',
      };
    }

    return {
      title: `${listing.title} | RentParLo.pk`,
      description: listing.description ? (typeof listing.description === 'string' 
        ? listing.description 
        : Array.isArray(listing.description) 
          ? listing.description.map(block => 
              block.children?.map((child: any) => child.text || '').join('') || ''
            ).join(' ')
          : 'No description available'
      ).substring(0, 160) : 'No description available',
      openGraph: {
        title: `${listing.title} | RentParLo.pk`,
        description: listing.description ? (typeof listing.description === 'string' 
          ? listing.description 
          : Array.isArray(listing.description) 
            ? listing.description.map(block => 
                block.children?.map((child: any) => child.text || '').join('') || ''
              ).join(' ')
            : 'No description available'
        ).substring(0, 200) : 'No description available',
        images: listing.images?.[0]?.asset?.url ? [listing.images[0].asset.url] : [],
        type: 'website',
        locale: 'en_PK',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${listing.title} | RentParLo.pk`,
        description: listing.description ? (typeof listing.description === 'string' 
          ? listing.description 
          : Array.isArray(listing.description) 
            ? listing.description.map(block => 
                block.children?.map((child: any) => child.text || '').join('') || ''
              ).join(' ')
            : 'No description available'
        ).substring(0, 200) : 'No description available',
        images: listing.images?.[0]?.asset?.url ? [listing.images[0].asset.url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Listing | RentParLo.pk',
      description: 'Find the best rental items in Pakistan',
    };
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  // Await the params in Next.js 15 if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get the listing with user context for owner preview
    const listing = await getEnhancedListingBySlug(resolvedParams.slug, user?.id);

    if (!listing) {
      return notFound();
    }

    // Track page view analytics with user context
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
    
    // Track analytics event with actual listing ID
    await trackAnalyticsEvent({
      event_type: 'page_view',
      listing_id: listing._id,
      user_id: user?.id || undefined,
      guest_id: !user ? `guest_${Date.now()}` : undefined,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      city: '', // Would be determined from IP in real implementation
      device_type: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
      os: userAgent.includes('Windows') ? 'Windows' : 
          userAgent.includes('Mac') ? 'MacOS' : 
          userAgent.includes('Linux') ? 'Linux' : 'Other',
      browser: userAgent.includes('Chrome') ? 'Chrome' : 
               userAgent.includes('Firefox') ? 'Firefox' : 
               userAgent.includes('Safari') ? 'Safari' : 'Other',
      session_id: `session_${Date.now()}`,
    });

    // Get similar listings
    const similarListings = await getSimilarListings(listing._id, listing.category?.title || '', 4);
    
    // Get reviews
    const reviews = await getListingReviews(listing._id);
    
    // Format price for display
    const formatPrice = (price: number, priceType: string) => {
      const formatted = new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

      const typeMap: { [key: string]: string } = {
        hourly: '/hr',
        daily: '/day',
        weekly: '/week',
        monthly: '/month',
      };

      return `${formatted}${typeMap[priceType] || ''}`;
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<ListingDetailSkeleton />}>
          <ListingDetailContent 
            listing={listing} 
            similarListings={similarListings} 
            reviews={reviews}
            currentUser={user}
          />
        </Suspense>
        <ClientRetryButton />
      </div>
    );
  } catch (error) {
    console.error('Error loading listing page:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Listing</h1>
          <p className="text-gray-600 mb-6">There was a problem loading this listing. Please try again.</p>
          <ClientRetryButton />
        </div>
      </div>
    );
  }
}