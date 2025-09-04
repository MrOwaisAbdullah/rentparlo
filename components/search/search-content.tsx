'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, X, MapPin, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchResults } from '@/components/search/search-results';
import { SearchSort } from '@/components/search/search-sort';
import { useSearchListings } from '@/hooks/use-search-listings';
import { useDebounce } from '@/hooks/use-debounce';
import { analytics } from '@/lib/analytics-client';

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

interface City {
  id: string;
  name: string;
  province: string;
}

interface SearchContentProps {
  searchParams: {
    q?: string;
    category?: string;
    city?: string;
    area?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  };
  categories: Category[];
  cities: City[];
}

export function SearchContent({ searchParams, categories, cities }: SearchContentProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const pathname = usePathname();
  
  // Search state
  const [searchQuery, setSearchQuery] = React.useState(searchParams.q || '');
  const [showFilters, setShowFilters] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'horizontal'>('horizontal');
  
  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  // Current filters from URL
  const currentFilters = {
    query: searchParams.q || '',
    category: searchParams.category || '',
    city: searchParams.city || '',
    area: searchParams.area || '',
    condition: searchParams.condition || '',
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : 0,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 0,
    sortBy: searchParams.sortBy || 'newest',
    page: searchParams.page ? parseInt(searchParams.page) : 1
  };

  // Use search hook for data fetching
  const { 
    data, 
    isLoading, 
    error, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage,
    totalResults
  } = useSearchListings(currentFilters);

  // Update URL with new search parameters
  const updateSearchParams = React.useCallback((newParams: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      // Ensure value is properly converted to string
      const stringValue = value !== undefined && value !== null ? 
        typeof value === 'string' ? value : value.toString() : '';
      
      if (stringValue === '' || stringValue === '0' || (key === 'page' && stringValue === '1')) {
        params.delete(key);
      } else {
        params.set(key, stringValue);
      }
    });

    // Reset page when filters change (except when explicitly setting page)
    if (!('page' in newParams)) {
      params.delete('page');
    }

    // Construct the full URL with current pathname
    const path = typeof pathname === 'string' && pathname ? pathname : '/search';
    const searchParamsString = params.toString();
    const newUrl = searchParamsString ? `${path}?${searchParamsString}` : path;
    router.push(newUrl, { scroll: false });
  }, [currentSearchParams, router, pathname]);

  // Handle search input
  const handleSearchSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    updateSearchParams({ query: searchQuery });
    
    // Track search query
    analytics.trackSearch(searchQuery, currentFilters).catch(console.error);
    
    setTimeout(() => setIsSearching(false), 1000);
  }, [searchQuery, updateSearchParams, currentFilters]);

  // Handle filter changes
  const handleFilterChange = React.useCallback((filterName: string, value: string | number) => {
    updateSearchParams({ [filterName]: value });
  }, [updateSearchParams]);

  // Handle clear filters
  const handleClearFilters = React.useCallback(() => {
    setSearchQuery('');
    router.push(pathname);
  }, [router, pathname]);

  // Auto-search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery !== currentFilters.query) {
      updateSearchParams({ query: debouncedQuery });
    }
  }, [debouncedQuery, currentFilters.query, updateSearchParams]);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.city) count++;
    if (currentFilters.area) count++;
    if (currentFilters.condition) count++;
    if (currentFilters.minPrice > 0) count++;
    if (currentFilters.maxPrice > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0 || currentFilters.query;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for rental items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSearching}
              className="px-8"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground lg:hidden"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SearchSort 
                currentSort={currentFilters.sortBy}
                onSortChange={(sortBy) => handleFilterChange('sortBy', sortBy)}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t lg:hidden">
              {currentFilters.query && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  "{currentFilters.query}"
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleFilterChange('query', '');
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {currentFilters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {currentFilters.category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {currentFilters.city && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentFilters.city}
                  {currentFilters.area && ` - ${currentFilters.area}`}
                  <button
                    onClick={() => {
                      handleFilterChange('city', '');
                      handleFilterChange('area', '');
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {currentFilters.condition && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Condition: {currentFilters.condition}
                  <button
                    onClick={() => handleFilterChange('condition', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {(currentFilters.minPrice > 0 || currentFilters.maxPrice > 0) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: PKR {currentFilters.minPrice.toLocaleString()} - {currentFilters.maxPrice.toLocaleString()}
                  <button
                    onClick={() => {
                      handleFilterChange('minPrice', 0);
                      handleFilterChange('maxPrice', 0);
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters Sidebar (Mobile/Tablet) */}
            {showFilters && (
              <div className="w-80 flex-shrink-0 lg:hidden mb-6">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <SearchFilters
                      categories={categories}
                      cities={cities}
                      currentFilters={currentFilters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Active Filters Display (Desktop) */}
            {hasActiveFilters && (
              <div className="hidden lg:flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted rounded-lg">
                {currentFilters.query && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    "{currentFilters.query}"
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        handleFilterChange('query', '');
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                {currentFilters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {currentFilters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                {currentFilters.city && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {currentFilters.city}
                    {currentFilters.area && ` - ${currentFilters.area}`}
                    <button
                      onClick={() => {
                        handleFilterChange('city', '');
                        handleFilterChange('area', '');
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                {currentFilters.condition && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Condition: {currentFilters.condition}
                    <button
                      onClick={() => handleFilterChange('condition', '')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                {(currentFilters.minPrice > 0 || currentFilters.maxPrice > 0) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: PKR {currentFilters.minPrice.toLocaleString()} - {currentFilters.maxPrice.toLocaleString()}
                    <button
                      onClick={() => {
                        handleFilterChange('minPrice', 0);
                        handleFilterChange('maxPrice', 0);
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Content */}
            <SearchResults
              listings={data || []}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              totalResults={totalResults}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Permanent Sidebar on Right Side */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Ads Banner */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <h3 className="font-bold text-lg mb-2">Premium Ad Space</h3>
                  <p className="text-sm opacity-90">Advertise your products here</p>
                </div>
              </Card>

              {/* Categories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.slice(0, 8).map((category) => (
                      <button
                        key={category._id}
                        onClick={() => handleFilterChange('category', category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          currentFilters.category === category.slug
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.title}</span>
                          {category.itemCount && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {category.itemCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Searches */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Popular Searches</h3>
                  <div className="space-y-2">
                    {[
                      'Camera in Karachi',
                      'Car in Lahore',
                      'Medical Equipment in Islamabad',
                      'Construction Tools in Faisalabad',
                      'Electronics in Rawalpindi'
                    ].map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Parse the search term to extract query and city
                          const [query, , city] = search.split(' ');
                          setSearchQuery(query);
                          handleFilterChange('city', city);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recently Viewed Listings */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Recently Viewed</h3>
                  <div className="space-y-3">
                    {data && data.length > 0 ? (
                      data.slice(0, 3).map((listing) => (
                        <div key={listing._id} className="flex gap-3">
                          <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                            {listing.images?.[0] ? (
                              <img 
                                src={typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0].asset?.url || '/placeholder.svg'} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{listing.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {listing.location?.city}{listing.location?.area ? `, ${listing.location.area}` : ''}
                            </p>
                            <p className="text-sm font-semibold">PKR {listing.price?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recently viewed items</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchContent;