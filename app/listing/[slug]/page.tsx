import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getEnhancedListingBySlug,
  getSimilarListings,
  getEnhancedListingReviews,
} from "@/lib/data-integration";
import { trackAnalyticsEvent } from "@/lib/supabase-queries";
import { ListingDetailContent } from "@/components/listing/listing-detail-content";
import { ListingDetailSkeleton } from "@/components/listing/listing-detail-skeleton";
import { ClientRetryButton } from "@/components/listing/client-retry-button";
import { ListingPageLoader } from "@/components/listing/listing-page-loader";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ErrorBoundary } from "@/components/error-boundary";

export const dynamic = "force-dynamic";

interface ListingPageProps {
  params:
    | Promise<{
        slug: string;
      }>
    | {
        slug: string;
      };
}

// Helper function to extract description text
function extractDescriptionText(description: any): string {
  if (typeof description === "string") {
    return description;
  }

  if (Array.isArray(description) && description.length > 0) {
    return description
      .map((block: any) => {
        if (block && block.children && Array.isArray(block.children)) {
          return block.children.map((child: any) => child.text || "").join("");
        }
        return "";
      })
      .join(" ");
  }

  return "No description available";
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  try {
    // Await the params in Next.js 15 if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const listing = await getEnhancedListingBySlug(
      resolvedParams.slug,
      user?.id
    );

    if (!listing) {
      return {
        title: "Listing Not Found | RentParLo.pk",
        description: "The requested listing could not be found.",
      };
    }

    return {
      title: `${listing.title} | RentParLo.pk`,
      description: extractDescriptionText(listing.description).substring(
        0,
        160
      ),
      openGraph: {
        title: `${listing.title} | RentParLo.pk`,
        description: extractDescriptionText(listing.description).substring(
          0,
          200
        ),
        images: listing.images?.[0]?.asset?.url
          ? [listing.images[0].asset.url]
          : [],
        type: "website",
        locale: "en_PK",
      },
      twitter: {
        card: "summary_large_image",
        title: `${listing.title} | RentParLo.pk`,
        description: extractDescriptionText(listing.description).substring(
          0,
          200
        ),
        images: listing.images?.[0]?.asset?.url
          ? [listing.images[0].asset.url]
          : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Listing | RentParLo.pk",
      description: "Find the best rental items in Pakistan",
    };
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  // Await the params in Next.js 15 if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get the listing with user context for owner preview
    const listing = await getEnhancedListingBySlug(
      resolvedParams.slug,
      user?.id
    );

    if (!listing) {
      return notFound();
    }

    // Track page view analytics with user context
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const referrer = headersList.get("referer") || "";
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";

    // Only track analytics if we have a valid listing ID
    if (listing && listing._id) {
      try {
        console.log("Tracking page view for listing:", {
          listing_id: listing._id,
          user_id: user?.id || undefined,
          guest_id: !user ? `guest_${Date.now()}` : undefined,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          device_type: userAgent.includes("Mobile") ? "mobile" : "desktop",
          os: userAgent.includes("Windows")
            ? "Windows"
            : userAgent.includes("Mac")
              ? "MacOS"
              : userAgent.includes("Linux")
                ? "Linux"
                : "Other",
          browser: userAgent.includes("Chrome")
            ? "Chrome"
            : userAgent.includes("Firefox")
              ? "Firefox"
              : userAgent.includes("Safari")
                ? "Safari"
                : "Other",
        });

        await trackAnalyticsEvent({
          event_type: "view",
          listing_id: listing._id,
          user_id: user?.id || undefined,
          guest_id: !user ? `guest_${Date.now()}` : undefined,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          city: "", // Would be determined from IP in real implementation
          device_type: userAgent.includes("Mobile") ? "mobile" : "desktop",
          os: userAgent.includes("Windows")
            ? "Windows"
            : userAgent.includes("Mac")
              ? "MacOS"
              : userAgent.includes("Linux")
                ? "Linux"
                : "Other",
          browser: userAgent.includes("Chrome")
            ? "Chrome"
            : userAgent.includes("Firefox")
              ? "Firefox"
              : userAgent.includes("Safari")
                ? "Safari"
                : "Other",
        });
      } catch (analyticsError) {
        console.error("Failed to track analytics event:", analyticsError);
        // Don't let analytics errors break the page
      }
    }

    // Get similar listings
    const similarListings = await getSimilarListings(
      listing._id,
      listing.category?.title || "",
      4
    );

    // Get reviews
    const reviews = await getEnhancedListingReviews(listing._id);

    // Format price for display
    const formatPrice = (price: number, priceType: string) => {
      const formatted = new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

      const typeMap: { [key: string]: string } = {
        hourly: "/hr",
        daily: "/day",
        weekly: "/week",
        monthly: "/month",
      };

      return `${formatted}${typeMap[priceType] || ""}`;
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <ListingPageLoader />
        <ErrorBoundary>
          <Suspense fallback={<ListingDetailSkeleton />}>
            <ListingDetailContent
              listing={listing}
              similarListings={similarListings}
              reviews={reviews}
              currentUser={user}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  } catch (error) {
    console.error("Error loading listing page:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Listing
          </h1>
          <p className="text-gray-600 mb-6">
            There was a problem loading this listing. Please try again.
          </p>
          <ClientRetryButton />
        </div>
      </div>
    );
  }
}
