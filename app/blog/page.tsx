import { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogClientWrapper } from '@/components/blog/blog-client-wrapper';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Blog | RentParLo.pk - Rental Tips & Market Insights',
  description: 'Discover expert tips, market insights, and helpful guides for renting and listing items on RentParLo.pk. Your go-to resource for the Pakistani rental market.',
  keywords: 'rental tips, Pakistan rentals, marketplace guides, RentParLo blog',
  openGraph: {
    title: 'Blog | RentParLo.pk',
    description: 'Expert rental tips and market insights for Pakistan',
    type: 'website',
  }
};

// Mock data - Replace with actual data fetching
const mockPosts = [
  {
    _id: '1',
    title: 'Complete Guide to Renting Electronics in Pakistan',
    slug: { current: 'complete-guide-renting-electronics-pakistan' },
    excerpt: 'Everything you need to know about renting electronics in Pakistan, from smartphones to laptops and gaming equipment.',
    mainImage: {
      asset: { url: '/placeholder-blog-new.svg' },
      alt: 'Electronics rental guide'
    },
    categories: [{ _id: '1', title: 'Electronics', slug: 'electronics' }],
    tags: ['electronics', 'rental tips', 'technology'],
    author: 'RentParLo Team',
    readingTime: 8,
    publishedAt: '2024-01-15T10:00:00Z',
    featured: true,
    language: 'en' as const
  },
  {
    _id: '2',
    title: 'Top 10 Most Rented Items in Karachi',
    slug: { current: 'top-10-most-rented-items-karachi' },
    excerpt: 'Discover which items are in highest demand in Karachi\'s rental market and what makes them so popular.',
    mainImage: {
      asset: { url: '/placeholder-blog-new.svg' },
      alt: 'Popular rental items in Karachi'
    },
    categories: [{ _id: '2', title: 'Market Insights', slug: 'market-insights' }],
    tags: ['karachi', 'trends', 'popular items'],
    author: 'Sarah Ahmed',
    readingTime: 5,
    publishedAt: '2024-01-10T14:30:00Z',
    featured: false,
    language: 'en' as const
  }
];

const mockCategories = [
  { _id: '1', _type: 'category' as const, title: 'Electronics', slug: { current: 'electronics' }, postCount: 15 },
  { _id: '2', _type: 'category' as const, title: 'Furniture', slug: { current: 'furniture' }, postCount: 12 },
  { _id: '3', _type: 'category' as const, title: 'Market Insights', slug: { current: 'market-insights' }, postCount: 8 },
  { _id: '4', _type: 'category' as const, title: 'Rental Tips', slug: { current: 'rental-tips' }, postCount: 10 }
];

const mockPopularPosts = [
  {
    _id: '1',
    title: 'How to Choose the Right Camera for Events',
    slug: { current: 'choose-right-camera-events' },
    mainImage: { asset: { url: '/placeholder-blog-new.svg' }, alt: 'Camera rental' },
    publishedAt: '2024-01-05T09:00:00Z',
    readingTime: 6
  },
  {
    _id: '2',
    title: 'Wedding Decor Rental: Complete Checklist',
    slug: { current: 'wedding-decor-rental-checklist' },
    mainImage: { asset: { url: '/placeholder-blog-new.svg' }, alt: 'Wedding decor' },
    publishedAt: '2024-01-01T11:00:00Z',
    readingTime: 10
  }
];

const mockTags = ['electronics', 'furniture', 'wedding', 'events', 'photography', 'decor', 'tips', 'karachi', 'lahore', 'islamabad'];

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
    query?: string;
    language?: string;
    featured?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Await searchParams before accessing properties
  const params = await searchParams;
  
  const filters = {
    query: params.query,
    category: params.category,
    tag: params.tag,
    language: params.language as 'en' | 'ur' | undefined,
    featured: params.featured === 'true' ? true : undefined
  };

  const pagination = {
    page: parseInt(params.page || '1'),
    limit: 12,
    total: mockPosts.length,
    totalPages: Math.ceil(mockPosts.length / 12),
    hasMore: false
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          RentParLo Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your ultimate guide to renting and listing in Pakistan. Discover tips, 
          trends, and insights from the rental marketplace experts.
        </p>
      </div>

      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogClientWrapper
          posts={mockPosts}
          categories={mockCategories}
          popularPosts={mockPopularPosts}
          tags={mockTags}
          initialFilters={filters}
          initialPagination={pagination}
        />
      </Suspense>
    </div>
  );
}

// Loading Components
function BlogGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}