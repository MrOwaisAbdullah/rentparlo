import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEnhancedListingBySlug, getSimilarListings, getListingReviews } from '@/lib/data-integration';
import { trackAnalyticsEvent } from '@/lib/supabase-queries';
import { ListingDetailContent } from '@/components/listing/listing-detail-content';
import { ListingDetailSkeleton } from '@/components/listing/listing-detail-skeleton';
import { ClientRetryButton } from '@/components/listing/client-retry-button';
import { headers } from 'next/headers';

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
    const listing = await getEnhancedListingBySlug(resolvedParams.slug);
    
    if (!listing) {
      return {
        title: 'Listing Not Found | RentParLo.pk',
        description: 'The requested listing could not be found.',
      };
    }

    // Extract text from Portable Text description
    let descriptionText = '';
    if (Array.isArray(listing.description)) {
      descriptionText = listing.description
        .filter((block: any) => block._type === 'block' && block.children)
        .map((block: any) => block.children.map((child: any) => child.text || '').join(''))
        .join(' ');
    } else if (typeof listing.description === 'string') {
      descriptionText = listing.description;
    }

    const priceText = `PKR ${listing.price.toLocaleString()}/${listing.priceType}`;
    const locationText = listing.location?.area 
      ? `${listing.location.area}, ${listing.location.city}`
      : listing.location?.city || 'Pakistan';

    return {
      title: `${listing.title} - ${priceText} | RentParLo.pk`,
      description: descriptionText 
        ? `${descriptionText.substring(0, 150)}...`
        : `Rent ${listing.title} in ${locationText}. Available for ${listing.priceType} rental.`,
      keywords: [
        listing.title,
        listing.category?.title,
        'rent',
        'rental',
        locationText,
        listing.condition,
        'Pakistan'
      ].filter(Boolean).join(', '),
      openGraph: {
        title: listing.title,
        description: descriptionText || `Rent ${listing.title} in ${locationText}`,
        images: listing.images?.[0]?.asset?.url ? [{
          url: listing.images[0].asset.url,
          width: 800,
          height: 600,
          alt: listing.title
        }] : []
      }
    };
  } catch (error) {
    return {
      title: 'Listing | RentParLo.pk',
      description: 'Browse rental listings on RentParlo.pk',
    };
  }
}

// Track page view with proper error handling
async function trackPageView(listingId: string, listingSlug: string) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    
    // Track the view
    await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: 'view',
      referrer: referer,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't fail the page load for analytics errors
  }
}

async function ListingContent({ slug }: { slug: string }) {
  try {
    // Get enhanced listing data
    const listing = await getEnhancedListingBySlug(slug);
    console.log('Listing data:', listing); // Debugging
    
    if (!listing) {
      notFound();
    }

    // Track page view (fire and forget)
    trackPageView(listing._id, slug);

    // Get similar listings and reviews in parallel
    const [similarListings, reviews] = await Promise.all([
      getSimilarListings(listing._id, listing.category?.title || '', 4),
      getListingReviews(listing._id)
    ]);

    return (
      <ListingDetailContent 
        listing={listing}
        similarListings={similarListings}
        reviews={reviews}
      />
    );
  } catch (error) {
    console.error('Error loading listing:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading this listing. Please try again later.
          </p>
          <ClientRetryButton />
        </div>
      </div>
    );
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  // Await the params in Next.js 15 if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  
  return (
    <Suspense fallback={<ListingDetailSkeleton />}>
      <ListingContent slug={resolvedParams.slug} />
    </Suspense>
  );
}