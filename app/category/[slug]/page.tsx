import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategoryWithListings } from "@/lib/data-integration";
import { CategoryHeader } from "@/components/category/category-header";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { RetryButton } from "@/components/ui/retry-button";
import { Category } from "@/types";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    condition?: string;
    priceRange?: string;
    location?: string;
    availability?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    priceType?: string;
    area?: string;
    q?: string;
    seller?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { category } = await getCategoryWithListings(resolvedParams.slug, {});

    if (!category) {
      return {
        title: "Category Not Found | RentParLo.pk",
        description: "The requested category could not be found.",
      };
    }

    return {
      title: `${category.title} for Rent | RentParLo.pk`,
      description:
        category.description ||
        `Find and rent ${category.title.toLowerCase()} in Pakistan. Browse verified listings from trusted sellers.`,
      keywords: [
        category.title,
        "rent",
        "Pakistan",
        "rental",
        "marketplace",
        ...category.title.split(" "),
      ].join(", "),
    };
  } catch (error) {
    return {
      title: "Category | RentParLo.pk",
      description: "Browse rental categories on RentParLo.pk",
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

async function CategoryContent({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: any;
}) {
  try {
    const { category, listings, totalCount, subcategories } =
      await getCategoryWithListings(slug, searchParams);

    if (!category) {
      notFound();
    }

    // Format categories to ensure slug is a string
    const formattedCategory = {
      ...category,
      slug:
        typeof category.slug === "string"
          ? category.slug
          : (category.slug as { current: string })?.current || slug,
    };

    // Format subcategories to ensure slug is a string
    const formattedSubcategories = subcategories.map((sub: Category) => ({
      ...sub,
      slug:
        typeof sub.slug === "string"
          ? sub.slug
          : (sub.slug as { current: string })?.current || "",
    }));

    const cities = [
      { id: "karachi", name: "Karachi", province: "Sindh" },
      { id: "lahore", name: "Lahore", province: "Punjab" },
      { id: "islamabad", name: "Islamabad", province: "ICT" },
      { id: "rawalpindi", name: "Rawalpindi", province: "Punjab" },
      { id: "faisalabad", name: "Faisalabad", province: "Punjab" },
      { id: "multan", name: "Multan", province: "Punjab" },
      { id: "peshawar", name: "Peshawar", province: "KPK" },
      { id: "quetta", name: "Quetta", province: "Balochistan" },
    ];

    // Set initial filters based on category context and URL parameters
    const initialFilters = {
      query: searchParams.q || "",
      condition: Array.isArray(searchParams.condition) 
        ? searchParams.condition.join(',') 
        : searchParams.condition || "",
      city: searchParams.location || "",
      area: searchParams.area || "",
      minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : 0,
      maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 0,
      priceType: searchParams.priceType || "",
      sortBy: searchParams.sort || "newest",
      category: formattedCategory._id, // Use category ID for proper filtering
      seller: searchParams.seller || "",
    };

    // Page context for sidebar
    const pageContext = {
      categoryId: formattedCategory._id,
      categorySlug: slug,
      categoryTitle: formattedCategory.title,
      totalCount,
      subcategories: formattedSubcategories,
      filters: initialFilters,
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Category Header */}
        <CategoryHeader
          category={formattedCategory}
          totalCount={totalCount}
          subcategories={formattedSubcategories}
        />

        {/* Main Content with Unified System */}
        <UniversalPageLayout
          pageType="category"
          pageContext={pageContext}
          showSidebar={true}
          sidebarPosition="left"
        >
          <UnifiedListingSearch
            initialFilters={initialFilters}
            categories={[formattedCategory]}
            cities={cities}
            layout="compact"
            manageURL={true}
            showSidebar={false} // Sidebar is handled by UniversalPageLayout
            limitedFilters={[
              "condition",
              "city",
              "area",
              "minPrice",
              "maxPrice",
              "priceType",
              "sortBy",
            ]}
            searchParams={searchParams}
            initialListings={listings}
            initialTotalResults={totalCount}
          />
        </UniversalPageLayout>
      </div>
    );
  } catch (error) {
    console.error("Error loading category:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading this category. Please try again later.
          </p>
          <RetryButton />
        </div>
      </div>
    );
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // Await params and searchParams in Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Extract plain object from searchParams to avoid passing functions
  const plainSearchParams = {
    sort: resolvedSearchParams.sort,
    condition: resolvedSearchParams.condition,
    priceRange: resolvedSearchParams.priceRange,
    location: resolvedSearchParams.location,
    availability: resolvedSearchParams.availability,
    page: resolvedSearchParams.page,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    priceType: resolvedSearchParams.priceType,
    area: resolvedSearchParams.area,
    q: resolvedSearchParams.q,
    seller: resolvedSearchParams.seller,
  };

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
      <CategoryContent
        slug={resolvedParams.slug}
        searchParams={plainSearchParams}
      />
    </Suspense>
  );
}
