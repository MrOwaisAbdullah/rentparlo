import { Metadata } from "next";
import { Suspense } from "react";
import { BlogPageContent } from "@/components/blog/blog-page-content";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostSummary, BlogCategory, BlogFilters } from "@/types";
import { getFilteredPosts, getAllCategories, getAllTags } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | RentParLo.pk - Rental Tips & Market Insights",
  description:
    "Discover expert tips, market insights, and helpful guides for renting and listing items on RentParLo.pk. Your go-to resource for the Pakistani rental market.",
  keywords: "rental tips, Pakistan rentals, marketplace guides, RentParLo blog",
  openGraph: {
    title: "Blog | RentParLo.pk",
    description: "Expert rental tips and market insights for Pakistan",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    q?: string;
    language?: string;
    featured?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const filters: BlogFilters = {
    query: searchParams.q || "",
    category: searchParams.category,
    tag: searchParams.tag,
    language: searchParams.language as "en" | "ur" | undefined,
    featured: searchParams.featured === "true" ? true : undefined,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
  };

  const page = parseInt(searchParams.page || "1");
  const limit = 12;

  // Fetch real data from Sanity
  const [postsData, categories, tags] = await Promise.all([
    getFilteredPosts(filters, page, limit),
    getAllCategories(),
    getAllTags(),
  ]);

  const { posts, total } = postsData;

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };

  return (
    <UniversalPageLayout
      pageType="blog"
      pageContext={{
        title: "RentParLo Blog",
        description: "Your ultimate guide to renting and listing in Pakistan",
        totalPosts: total,
        categories,
        tags,
      }}
      showSidebar={true}
    >
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
        <BlogPageContent
          posts={posts}
          categories={categories}
          tags={tags}
          filters={filters}
          pagination={pagination}
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