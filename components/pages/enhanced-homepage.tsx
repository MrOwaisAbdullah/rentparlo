/**
 * Enhanced Homepage Component
 * Uses the new data integration layer to fetch real data from Sanity and Supabase
 */

import { Suspense } from 'react'
import { getHomepageData } from '@/lib/data-integration'
import { FeaturedListings } from '@/components/sections/featured-listings'
import { CategoryCards } from '@/components/sections/category-cards'
import { HeroSection } from '@/components/sections/hero-section'
import { BlogSection } from '@/components/sections/blog-section'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { Skeleton } from '@/components/ui/skeleton'

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
  )
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
  )
}

// Server Component for data fetching
async function HomepageContent() {
  try {
    const {
      featuredListings,
      categories,
      banners,
      recentBlogs,
      topSellers
    } = await getHomepageData()

    return (
      <div className="min-h-screen">
        {/* Hero Section with banners */}
        <HeroSection banners={banners} />

        {/* Categories Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Browse by Category
            </h2>
            <CategoryCards categories={categories} />
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Listings</h2>
              <a 
                href="/search" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </a>
            </div>
            <FeaturedListings listings={featuredListings} />
          </div>
        </section>

        {/* Top Sellers Section */}
        {topSellers.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">
                Top Sellers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {topSellers.map((seller) => (
                  <div 
                    key={seller.id} 
                    className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
                    <h3 className="font-medium text-sm">{seller.username}</h3>
                    <p className="text-xs text-gray-600 capitalize">{seller.tier}</p>
                    <div className="flex items-center justify-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {seller.tier_points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
              <BlogSection posts={recentBlogs} />
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <TestimonialsSection />
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading homepage data:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the page. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
}

// Main component with loading states
export function EnhancedHomepage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen">
            {/* Hero skeleton */}
            <div className="h-96 bg-gray-200 animate-pulse" />
            
            {/* Categories skeleton */}
            <section className="py-12 bg-gray-50">
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
  )
}

export default EnhancedHomepage