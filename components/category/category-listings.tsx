"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  Loader2,
  Star,
  Award,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/cards/listing-card"; // Import the ListingCard component
import { Listing } from "@/types"; // Import the proper Listing type

interface CategoryListingsProps {
  listings: (Listing & { 
    hasPriorityPlacement?: boolean; 
    hasGuaranteedTopPlacement?: boolean;
    hasEnhancedSearchVisibility?: boolean; // Add enhanced search visibility flag
    hasSearchPriority?: boolean; // Add search priority flag for Bronze tier
    hasCategoryTopPlacement?: boolean; // Add category top placement flag for Gold tier
  })[];
  totalCount: number;
  categorySlug: string;
  currentFilters: any;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "featured", label: "Featured First" },
];

export function CategoryListings({
  listings,
  totalCount,
  categorySlug,
  currentFilters,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: CategoryListingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "undefined") {
        // Ensure value is a string and not an object
        const stringValue = typeof value === "string" ? value : String(value);
        params.set(key, stringValue);
      } else {
        params.delete(key);
      }
    });

    const newUrl = `/category/${categorySlug}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl);
  };

  const handleSortChange = (sort: string) => {
    // Ensure sort is a string, not an object
    const sortValue = typeof sort === "string" ? sort : String(sort);
    updateSearchParams({ sort: sortValue });
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any listings matching your criteria. Try adjusting
            your filters.
          </p>
          <Button asChild>
            <Link href={`/category/${categorySlug}`}>Reset Filters</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Separate listings by priority level
  const guaranteedTopListings = listings.filter(listing => listing.hasGuaranteedTopPlacement);
  const priorityListings = listings.filter(listing => !listing.hasGuaranteedTopPlacement && listing.hasPriorityPlacement);
  const categoryTopPlacementListings = listings.filter(listing => 
    !listing.hasGuaranteedTopPlacement && 
    !listing.hasPriorityPlacement && 
    listing.hasCategoryTopPlacement
  );
  const enhancedVisibilityListings = listings.filter(listing => 
    !listing.hasGuaranteedTopPlacement && 
    !listing.hasPriorityPlacement && 
    !listing.hasCategoryTopPlacement && 
    listing.hasEnhancedSearchVisibility
  );
  const searchPriorityListings = listings.filter(listing => 
    !listing.hasGuaranteedTopPlacement && 
    !listing.hasPriorityPlacement && 
    !listing.hasCategoryTopPlacement && 
    !listing.hasEnhancedSearchVisibility && 
    listing.hasSearchPriority
  );
  const regularListings = listings.filter(listing => 
    !listing.hasGuaranteedTopPlacement && 
    !listing.hasPriorityPlacement && 
    !listing.hasCategoryTopPlacement && 
    !listing.hasEnhancedSearchVisibility && 
    !listing.hasSearchPriority
  );

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {listings.length} of {totalCount.toLocaleString()}{" "}
            results
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-muted-foreground" />
          <Select
            value={currentFilters.sort || "newest"}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {Object.entries(currentFilters).some(
        ([key, value]) =>
          value && key !== "sort" && key !== "limit" && key !== "offset"
      ) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Active filters:</span>
          {Object.entries(currentFilters).map(([key, value]) => {
            if (!value || key === "sort" || key === "limit" || key === "offset")
              return null;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => updateSearchParams({ [key]: undefined })}
              >
                <span>
                  {key}: {String(value)}
                </span>
                <span className="ml-1">×</span>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/category/${categorySlug}`)}
            className="text-sm"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Guaranteed Top Placement Section */}
      {guaranteedTopListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Guaranteed Top Listings</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Premium/Business/Platinum/Diamond
            </Badge>
          </div>
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guaranteedTopListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {guaranteedTopListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Priority Placement Section */}
      {priorityListings.length > 0 && (
        <div className={guaranteedTopListings.length > 0 ? "space-y-4 pt-6" : "space-y-4"}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Priority Listings</h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Pro Package
            </Badge>
          </div>
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {priorityListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {priorityListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Top Placement Section */}
      {categoryTopPlacementListings.length > 0 && (
        <div className={(guaranteedTopListings.length > 0 || priorityListings.length > 0) ? "space-y-4 pt-6" : "space-y-4"}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Top Placement Listings</h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Gold/Platinum/Diamond Tier
            </Badge>
          </div>
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTopPlacementListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categoryTopPlacementListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Search Visibility Section */}
      {enhancedVisibilityListings.length > 0 && (
        <div className={(guaranteedTopListings.length > 0 || priorityListings.length > 0 || categoryTopPlacementListings.length > 0) ? "space-y-4 pt-6" : "space-y-4"}>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Enhanced Visibility Listings</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Silver/Gold/Platinum/Diamond
            </Badge>
          </div>
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedVisibilityListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {enhancedVisibilityListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Priority Section */}
      {searchPriorityListings.length > 0 && (
        <div className={(guaranteedTopListings.length > 0 || priorityListings.length > 0 || categoryTopPlacementListings.length > 0 || enhancedVisibilityListings.length > 0) ? "space-y-4 pt-6" : "space-y-4"}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Priority Listings</h3>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Bronze/Silver/Gold/Platinum/Diamond
            </Badge>
          </div>
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchPriorityListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {searchPriorityListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regular Listings */}
      {regularListings.length > 0 && (
        <div className={(guaranteedTopListings.length > 0 || priorityListings.length > 0 || categoryTopPlacementListings.length > 0 || enhancedVisibilityListings.length > 0 || searchPriorityListings.length > 0) ? "pt-6" : ""}>
          {(guaranteedTopListings.length > 0 || priorityListings.length > 0 || categoryTopPlacementListings.length > 0 || enhancedVisibilityListings.length > 0 || searchPriorityListings.length > 0) && (
            <h3 className="text-lg font-semibold mb-4">Other Listings</h3>
          )}
          <div className={viewMode === "grid" ? "gap-6" : "space-y-4"}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    variant="category"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {regularListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && onLoadMore && (
        <div className="text-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Results"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategoryListings;