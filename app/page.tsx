import { Suspense } from "react";
import { getHomepageData } from "@/lib/data-integration";
import { getHomepageListings } from "@/lib/fetch/listings"; // Import the function to fetch listings

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { CategoryCards } from "@/components/sections/category-cards";
import { HeroSection } from "@/components/sections/hero-section";
import { BlogSection } from "@/components/sections/blog-section";
import { Testimonials } from "@/components/testimonials";
import { TopSellers } from "@/components/sections/top-sellers";
import { AdBanner } from "@/components/ads/ad-banner";
import ProductSwiper from "@/components/sections/product-swiper";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LocationLinks from "@/components/sections/location-links"; // Import LocationLinks component
import {
  Seller,
  SellerProfile,
  BlogPost,
  BlogPostSummary,
  Category,
  Listing,
} from "@/types";

// Loading components
function FeaturedListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Server Component for data fetching
async function HomepageContent() {
  try {
    // Fetch homepage data with explicit type
    const homepageData = await getHomepageData();
    // Fetch all listings once for the product swipers
    const allListings = await getHomepageListings();

    const { featuredListings, categories, banners, recentBlogs, topSellers } =
      homepageData;

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section with banners */}
        <HeroSection banners={banners} />

        {/* Categories Section */}
        <CategoryCards categories={categories} />

        {/* Featured Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Listings</h2>
              <Link
                href="/search"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <FeaturedListings listings={featuredListings} />
          </div>
        </section>

        {/* Trending Products Swiper */}
        <ProductSwiper
          title="🔥 Trending Now"
          category="all"
          limit={12}
          trending={true}
          listings={allListings} // Pass the listings prop
        />

        {/* Camera & Electronics Swiper */}
        <ProductSwiper
          title="📷 Camera & Electronics"
          category="camera"
          limit={10}
          listings={allListings} // Pass the listings prop
        />

        {/* Automobiles Swiper */}
        <ProductSwiper
          title="🚗 Automobiles"
          category="automobiles"
          limit={10}
          listings={allListings} // Pass the listings prop
        />

        {/* Home & Living Swiper */}
        <ProductSwiper
          title="🏠 Home & Living"
          category="construction-equipment"
          limit={10}
          listings={allListings} // Pass the listings prop
        />

        {/* Sports & Recreation Swiper */}
        <ProductSwiper
          title="⚽ Sports & Recreation"
          category="events"
          limit={8}
          listings={allListings} // Pass the listings prop
        />

        {/* Ad Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4 flex justify-center">
            <AdBanner placement="homepage-middle" />
          </div>
        </section>

        {/* Medical Equipment Swiper */}
        <ProductSwiper
          title="🏥 Medical Equipment"
          category="medical-equipment"
          limit={8}
          listings={allListings} // Pass the listings prop
        />

        {/* Top Sellers Section */}
        {topSellers.length > 0 && (
          <section className="py-12 bg-muted/20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">
                Top Sellers
              </h2>
              <TopSellersList sellers={topSellers} />
            </div>
          </section>
        )}

        {/* Blog Section */}
        {recentBlogs.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">
                Latest from Blog
              </h2>
              <HomepageBlogSection posts={recentBlogs} />
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <Testimonials />
          </div>
        </section>

        {/* Location Links */}
        <LocationLinks />
      </div>
    );
  } catch (error) {
    console.error("Error loading homepage data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading the page. Please try again later.
          </p>
          <a
            href="/"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors inline-block"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }
}

// Wrapper component to handle SellerProfile[] to Seller[] conversion
function TopSellersList({ sellers }: { sellers: SellerProfile[] }) {
  // Convert SellerProfile[] to Seller[] by creating mock User data
  const convertedSellers: Seller[] = sellers.map((profile) => ({
    id: profile.id,
    email: "", // Not needed for display
    role: "seller" as const,
    guest_id: "",
    created_at: profile.created_at,
    is_verified: profile.is_verified,
    city: "", // Will be fetched from profile
    country: "PK", // Default to Pakistan
    active: true,
    email_verified: profile.is_verified,
    notification_preferences: {
      email: true,
      sms: true,
      push: true,
    },
    preferred_language: "en" as const,
    updated_at: profile.updated_at,
    profile: profile,
  }));

  return <TopSellers sellers={convertedSellers} />;
}

// Wrapper component for blog section with posts prop
function HomepageBlogSection({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) {
    return null;
  }

  // Convert BlogPost[] to BlogPostSummary[] for the BlogCard component
  const blogSummaries: BlogPostSummary[] = posts.map((post) => ({
    _id: post._id,
    title: post.title,
    titleUrdu: post.titleUrdu,
    slug: post.slug,
    excerpt: post.excerpt,
    excerptUrdu: post.excerptUrdu,
    mainImage: post.mainImage,
    categories: undefined, // BlogCategoryRef doesn't have title/slug, so we'll skip categories
    tags: post.tags,
    author: post.author,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt,
    featured: post.featured,
    language: post.language,
  }));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">From Our Blog</h2>
          <Button asChild variant="ghost">
            <Link href="/blog">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogSummaries.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background">
            {/* Hero skeleton */}
            <div className="h-96 bg-muted animate-pulse" />

            {/* Categories skeleton */}
            <section className="py-12 bg-muted/20">
              <div className="container mx-auto px-4">
                <Skeleton className="h-8 w-64 mx-auto mb-8" />
                <CategoriesSkeleton />
              </div>
            </section>

            {/* Featured listings skeleton */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <Skeleton className="h-8 w-48 mb-8" />
                <FeaturedListingsSkeleton />
              </div>
            </section>
          </div>
        }
      >
        <HomepageContent />
      </Suspense>
    </main>
  );
}
