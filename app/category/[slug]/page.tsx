import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCategoryWithListings } from '@/lib/data-integration';
import { CategoryHeader } from '@/components/category/category-header';
import { CategoryListings } from '@/components/category/category-listings';
import { CategoryFilters } from '@/components/category/category-filters';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
  searchParams: Promise<{
    sort?: string;
    condition?: string;
    priceRange?: string;
    location?: string;
    availability?: string;
    page?: string;
  }> | {
    sort?: string;
    condition?: string;
    priceRange?: string;
    location?: string;
    availability?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    // Await the params in Next.js 15 if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const { category } = await getCategoryWithListings(resolvedParams.slug, {});
    
    if (!category) {
      return {
        title: 'Category Not Found | RentParLo.pk',
        description: 'The requested category could not be found.',
      };
    }

    return {
      title: `${category.title} for Rent | RentParLo.pk`,
      description: category.description || `Find and rent ${category.title.toLowerCase()} in Pakistan. Browse verified listings from trusted sellers.`,
      keywords: [
        category.title,
        'rent',
        'Pakistan',
        'rental',
        'marketplace',
        ...category.title.split(' ')
      ].join(', '),
    };
  } catch (error) {
    return {
      title: 'Category | RentParLo.pk',
      description: 'Browse rental categories on RentParLo.pk',
    };
  }
}

// Loading skeleton for listings
function CategoryListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

async function CategoryContent({ slug, searchParams }: { slug: string; searchParams: any }) {
  try {
    // Await the searchParams in Next.js 15 if it's a Promise
    const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const page = parseInt(resolvedSearchParams.page || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const filters = {
      sort: resolvedSearchParams.sort || 'newest',
      condition: resolvedSearchParams.condition,
      priceRange: resolvedSearchParams.priceRange,
      location: resolvedSearchParams.location,
      availability: resolvedSearchParams.availability || 'available',
      limit,
      offset
    };

    const { category, listings, totalCount, subcategories } = await getCategoryWithListings(slug, filters);

    if (!category) {
      notFound();
    }

    const totalPages = Math.ceil(totalCount / limit);

    return (
      <div className="min-h-screen bg-background">
        {/* Category Header */}
        <CategoryHeader 
          category={category} 
          totalCount={totalCount}
          subcategories={subcategories}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <CategoryFilters 
                slug={slug}
                currentFilters={filters}
                subcategories={subcategories}
              />
            </aside>

            {/* Listings Content */}
            <main className="flex-1">
              <CategoryListings 
                listings={listings}
                totalCount={totalCount}
                currentPage={page}
                totalPages={totalPages}
                categorySlug={slug}
                currentFilters={filters}
              />
            </main>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading this category. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Await the params in Next.js 15 if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          {/* Header skeleton */}
          <div className="bg-muted/20">
            <div className="container mx-auto px-4 py-12">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar skeleton */}
              <aside className="lg:w-80">
                <div className="space-y-6">
                  <Skeleton className="h-8 w-32" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                </div>
              </aside>
              
              {/* Listings skeleton */}
              <main className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <CategoryListingsSkeleton />
              </main>
            </div>
          </div>
        </div>
      }
    >
      <CategoryContent slug={resolvedParams.slug} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}