import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogCategoryContent } from "@/components/blog/blog-category-content";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCategory, BlogPostSummary } from "@/types";

interface BlogCategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
    tag?: string;
    q?: string;
    language?: string;
    featured?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

// Mock function to fetch category data
async function getCategoryData(
  categorySlug: string
): Promise<BlogCategory | null> {
  const mockCategories: Record<string, BlogCategory> = {
    electronics: {
      _id: "1",
      _type: "category",
      title: "Electronics",
      slug: { current: "electronics" },
      description: "Everything about renting electronic devices in Pakistan",
      postCount: 15,
    },
    furniture: {
      _id: "2",
      _type: "category",
      title: "Furniture",
      slug: { current: "furniture" },
      description: "Furniture rental guides and tips",
      postCount: 12,
    },
    "market-insights": {
      _id: "3",
      _type: "category",
      title: "Market Insights",
      slug: { current: "market-insights" },
      description:
        "Latest trends and insights from the Pakistani rental market",
      postCount: 8,
    },
  };

  return mockCategories[categorySlug] || null;
}

// Mock function to fetch posts by category
async function getPostsByCategory(
  categorySlug: string
): Promise<BlogPostSummary[]> {
  const mockPosts: BlogPostSummary[] = [
    {
      _id: "1",
      title: "Complete Guide to Renting Electronics in Pakistan",
      slug: { current: "complete-guide-renting-electronics-pakistan" },
      excerpt:
        "Everything you need to know about renting electronics in Pakistan.",
      mainImage: {
        asset: { url: "/api/placeholder/600/400" },
        alt: "Electronics rental guide",
      },
      categories: [{ _id: "1", title: "Electronics", slug: { current: "electronics" } }],
      tags: ["electronics", "rental tips", "technology"],
      author: "RentParLo Team",
      readingTime: 8,
      publishedAt: "2024-01-15T10:00:00Z",
      featured: true,
      language: "en",
    },
    {
      _id: "4",
      title: "Best Smartphones to Rent in 2024",
      slug: { current: "best-smartphones-rent-2024" },
      excerpt:
        "Discover the top smartphone models available for rent this year.",
      mainImage: {
        asset: { url: "/api/placeholder/600/400" },
        alt: "Smartphone rental 2024",
      },
      categories: [{ _id: "1", title: "Electronics", slug: { current: "electronics" } }],
      tags: ["smartphones", "mobile", "technology"],
      author: "Tech Team",
      readingTime: 6,
      publishedAt: "2024-01-12T09:00:00Z",
      featured: false,
      language: "en",
    },
  ];

  // Filter posts by category (in real implementation, this would be done in the query)
  return categorySlug === "electronics" ? mockPosts : [];
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const category = await getCategoryData(params.category);

  if (!category) {
    return {
      title: "Category Not Found | RentParLo.pk",
      description: "The requested blog category could not be found.",
    };
  }

  return {
    title: `${category.title} Articles | RentParLo.pk Blog`,
    description:
      category.description ||
      `Read the latest articles about ${category.title.toLowerCase()} on RentParLo.pk blog.`,
    openGraph: {
      title: `${category.title} Articles | RentParLo.pk`,
      description: category.description,
      type: "website",
    },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const category = await getCategoryData(params.category);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(params.category);

  // Mock data for sidebar
  const mockCategories: BlogCategory[] = [
    {
      _id: "1",
      _type: "category",
      title: "Electronics",
      slug: { current: "electronics" },
      postCount: 15,
    },
    {
      _id: "2",
      _type: "category",
      title: "Furniture",
      slug: { current: "furniture" },
      postCount: 12,
    },
    {
      _id: "3",
      _type: "category",
      title: "Market Insights",
      slug: { current: "market-insights" },
      postCount: 8,
    },
  ];

  const mockPopularPosts = [
    {
      _id: "1",
      title: "How to Choose the Right Camera for Events",
      slug: { current: "choose-right-camera-events" },
      mainImage: {
        asset: { url: "/api/placeholder/400/300" },
        alt: "Camera rental",
      },
      publishedAt: "2024-01-05T09:00:00Z",
      readingTime: 6,
    },
  ];

  const mockTags = [
    "electronics",
    "smartphones",
    "laptops",
    "cameras",
    "audio equipment",
  ];

  const filters = {
    category: params.category,
    tag: searchParams.tag,
    query: searchParams.q,
    language: searchParams.language as "en" | "ur" | undefined,
    featured: searchParams.featured === "true" ? true : undefined,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
  };

  const pagination = {
    page: parseInt(searchParams.page || "1"),
    limit: 12,
    total: posts.length,
    totalPages: Math.ceil(posts.length / 12),
    hasMore: false,
  };

  return (
    <UniversalPageLayout
      pageType="blog"
      pageContext={{
        categoryId: category._id,
        categorySlug: params.category,
        categoryTitle: category.title,
        categoryDescription: category.description,
        totalPosts: posts.length,
        categories: mockCategories,
        tags: mockTags,
      }}
      showSidebar={true}
    >
      {/* Category Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {category.title}
        </h1>
        {category.description && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            {category.postCount}{" "}
            {category.postCount === 1 ? "article" : "articles"} in this category
          </span>
        </div>
      </div>

      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogCategoryContent
          posts={posts}
          categories={mockCategories}
          tags={mockTags}
          filters={filters}
          pagination={pagination}
          categorySlug={params.category}
        />
      </Suspense>
    </UniversalPageLayout>
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

function BlogSidebarSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Generate static params for known categories
export async function generateStaticParams() {
  const categories = [
    "electronics",
    "furniture",
    "market-insights",
    "rental-tips",
  ];

  return categories.map((category) => ({
    category,
  }));
}