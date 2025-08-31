'use client';

import React from 'react';
import { Grid, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from '@/components/cards/listing-card';
import { cn } from '@/lib/utils';
import { Listing as FullListing, ListingImage } from '@/types';

// Define the interface that matches the actual data structure being passed
interface Listing {
  _id: string;
  title: string;
  description?: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  images: string[];
  condition: string;
  availability: 'available' | 'rented' | 'maintenance';
  location: {
    city: string;
    area: string;
  };
  category: {
    title: string;
    slug: string;
  };
  seller: {
    id: string;
    username: string;
    business_name?: string;
    tier: 'basic' | 'premium' | 'gold';
    isVerified: boolean;
    profile?: {
      city?: string;
    };
  };
  _createdAt?: string; // Add _createdAt field
  createdAt: string;
  views?: number;
  contactClicks?: number;
}

interface SearchResultsProps {
  listings: Listing[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  viewMode?: 'grid' | 'list' | 'horizontal';
  onViewModeChange?: (mode: 'grid' | 'list' | 'horizontal') => void;
  className?: string;
}

// Function to transform the Listing interface to the FullListing type
const transformToListingType = (listing: Listing): FullListing => {
  // Map priceType to match the expected type
  const mapPriceType = (type: 'hourly' | 'daily' | 'weekly' | 'monthly'): 'hourly' | 'daily' | 'monthly' | 'yearly' => {
    if (type === 'weekly') {
      return 'monthly'; // Map weekly to monthly as a fallback
    }
    return type;
  };

  // Handle different image data structures
  let transformedImages: ListingImage[] = [];
  if (Array.isArray(listing.images)) {
    transformedImages = listing.images.map(img => {
      // If img is already an object with asset property
      if (typeof img === 'object' && img !== null && 'asset' in img) {
        return img as ListingImage;
      }
      // If img is a string URL
      if (typeof img === 'string') {
        return {
          asset: {
            url: img,
            metadata: {}
          }
        };
      }
      // Fallback for unexpected image format
      return {
        asset: {
          url: '/placeholder.jpg',
          metadata: {}
        }
      };
    });
  }

  // Use _createdAt if available, otherwise fallback to createdAt
  const createdAt = listing._createdAt || listing.createdAt;

  return {
    _id: listing._id,
    _type: 'listing',
    _createdAt: createdAt,
    title: listing.title,
    slug: { current: listing._id },
    description: listing.description || '', // Keep as simple string, not array
    price: listing.price,
    priceType: mapPriceType(listing.priceType),
    pricePerHour: listing.price,
    priceWeekly: listing.price,
    priceMonthly: listing.price,
    category: {
      _ref: listing.category.slug,
      title: listing.category.title,
    },
    images: transformedImages,
    location: listing.location,
    condition: listing.condition as any, // Type assertion since the values should align
    availability: {
      isAvailable: listing.availability === 'available',
      availableFrom: new Date().toISOString()
    },
    specifications: [],
    rentalRules: [],
    status: 'active',
    supabaseId: listing.seller?.id || '', // Add safety check for seller object
    isFeatured: false,
    featuredPriority: 0,
    created_at: createdAt,
    createdAt: createdAt,
    views: listing.views || 0,
    contactClicks: listing.contactClicks || 0,
    badges: []
  };
};

export function SearchResults({
  listings,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  viewMode = 'grid',
  onViewModeChange,
  className
}: SearchResultsProps) {
  // Generate pagination pages
  const getPaginationPages = () => {
    const pages = [];
    const maxPages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const formatResultsText = () => {
    if (totalResults === 0) return 'No results found';
    if (totalResults === 1) return '1 result found';
    return `${totalResults.toLocaleString()} results found`;
  };

  if (isLoading) {
    return <SearchResultsSkeleton viewMode={viewMode} />;
  }

  if (listings.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search criteria or browse all categories.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Browse All Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{formatResultsText()}</h2>
          {totalPages > 1 && (
            <Badge variant="outline">
              Page {currentPage} of {totalPages}
            </Badge>
          )}
        </div>
        
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              variant='category'
              listing={transformToListingType(listing)}
              showSellerInfo={true}
              priority={false}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              variant='list'
              listing={transformToListingType(listing)}
              showSellerInfo={true}
            />
          ))}
        </div>
      )}

      {/* Load More / Pagination */}
      <div className="mt-8 space-y-4">
        {/* Infinite Scroll Load More */}
        {hasNextPage && onLoadMore && (
          <div className="text-center">
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
                'Load More Results'
              )}
            </Button>
          </div>
        )}

        {/* Page-based Pagination */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {getPaginationPages().map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton component
function SearchResultsSkeleton({ viewMode }: { viewMode: 'grid' | 'list' | 'horizontal' }) {
  if (viewMode === 'grid') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } else if (viewMode === 'horizontal') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex">
              <Skeleton className="h-32 w-1/3" />
              <CardContent className="p-4 flex-1">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;