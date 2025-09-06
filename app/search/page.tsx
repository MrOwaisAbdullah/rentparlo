import { Metadata } from "next";
import { Suspense } from "react";
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";
import { UnifiedSearchProvider } from "@/contexts/unified-search-provider";
import { UniversalPageLayout } from "@/components/layout/universal-page-layout";
import { SearchSkeleton } from "@/components/search/search-skeleton";
import { getCategories } from "@/lib/sanity-queries";
import { getCities } from "@/lib/supabase-queries";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    area?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";
  const city = params.city || "";

  let title = "Search Rental Items | RentParLo.pk";
  let description =
    "Find the perfect rental items in Pakistan. Search through thousands of listings from verified sellers.";

  if (query) {
    title = `Search Results for "${query}" | RentParLo.pk`;
    description = `Find rental items matching "${query}" in Pakistan. Browse verified listings with competitive prices.`;
  }

  if (category && !query) {
    title = `${category} Rentals | RentParLo.pk`;
    description = `Rent ${category.toLowerCase()} items in Pakistan. Verified sellers, competitive prices, secure transactions.`;
  }

  if (city) {
    title = title.replace("| RentParLo.pk", `in ${city} | RentParLo.pk`);
    description = description.replace("in Pakistan", `in ${city}, Pakistan`);
  }

  const keywords = [
    "rental search",
    "Pakistan rentals",
    query,
    category,
    city,
    "rental marketplace",
    "verified sellers",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/search",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Server component for data fetching
async function SearchPageContent({ searchParams }: SearchPageProps) {
  try {
    const params = await searchParams;
    // Fetch initial data for filters
    const [categories, cities] = await Promise.all([
      getCategories(),
      getCities(),
    ]);

    // Transform categories to match expected interface
    const transformedCategories = categories.map((category) => ({
      _id: category._id,
      title: category.title,
      slug:
        typeof category.slug === "string"
        ? category.slug
        : category.slug.current,
      description: category.description,
      itemCount: category.itemCount,
    }));

    // Define limited filters for search page (simplified set)
    const searchPageFilters = {
      query: params.q || "",
      sortBy: params.sortBy || "newest",
      minPrice: 0,
      maxPrice: 0,
      condition: "",
      area: "",
      availability: "",
    };

    // Page context for sidebar content - exclude filters to prevent them from showing
    const pageContext = {
      searchQuery: params.q || "",
      filters: searchPageFilters,
      categories: transformedCategories,
      hasActiveSearch: !!(params.q),
      hideFilters: true, // Flag to hide filters in the sidebar
    };

    return (
      <UnifiedSearchProvider initialFilters={searchPageFilters}>
        <UniversalPageLayout
          pageType="search"
          pageContext={pageContext}
          showSidebar={true}
          sidebarPosition="right"
        >
          <UnifiedListingSearch
            searchParams={params}
            categories={transformedCategories}
            cities={cities}
            layout="compact"
            showSidebar={false}
            manageURL={true}
            limitedFilters={[]}
          />
        </UniversalPageLayout>
      </UnifiedSearchProvider>
    );
  } catch (error) {
    console.error("Error loading search page data:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Search
          </h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the search page. Please try again
            later.
          </p>
          <a
            href="/search"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}