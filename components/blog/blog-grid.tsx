'use client';

import React from 'react';
import { Search, Filter, ChevronDown, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogCard } from './blog-card';
import { cn } from '@/lib/utils';
import { BlogPostSummary, BlogCategory, BlogFilters, BlogPagination } from '@/types';

interface BlogGridProps {
  posts: BlogPostSummary[];
  categories: BlogCategory[];
  tags: string[];
  filters: BlogFilters;
  pagination: BlogPagination;
  loading?: boolean;
  onFiltersChange: (filters: BlogFilters) => void;
  className?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'popular' | 'title';

export function BlogGrid({
  posts,
  categories,
  tags,
  filters,
  pagination,
  loading = false,
  onFiltersChange,
  onPageChange,
  className
}: BlogGridProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [sortBy, setSortBy] = React.useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = React.useState(filters.query || '');
  const [showFilters, setShowFilters] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Handle search input with optimized debounce
  React.useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only trigger search if query actually changed
    if (searchQuery !== (filters.query || '')) {
      debounceTimer.current = setTimeout(() => {
        // Double-check that the query still differs before making the request
        if (searchQuery !== (filters.query || '')) {
          onFiltersChange({ ...filters, query: searchQuery });
        }
      }, 500);
    }

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]); // Only depend on searchQuery, not on filters or onFiltersChange

  // Update searchQuery when filters.query changes from outside (e.g. URL changes)
  React.useEffect(() => {
    if (searchQuery !== (filters.query || '')) {
      setSearchQuery(filters.query || '');
    }
  }, [filters.query]);

  const handleFilterChange = (key: keyof BlogFilters, value: string | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({
      query: '',
      category: undefined,
      tag: undefined,
      author: undefined,
      language: undefined,
      featured: undefined
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.tag,
    filters.author,
    filters.language,
    filters.featured,
    filters.query
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className={cn("space-y-8", className)}>
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Grid Skeleton */}
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

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {filters.category 
                ? `${categories.find(c => c.slug.current === filters.category)?.title || 'Category'} Posts`
                : 'Latest Posts'
              }
            </h2>
            <p className="text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} found
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Search Button */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Button
                  onClick={() => {
                    if (searchQuery) {
                      onFiltersChange({ ...filters, query: searchQuery });
                    }
                  }}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Posts
                </Button>
              </div>

              {/* Featured Posts Toggle */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filter</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured-toggle"
                    checked={filters.featured || false}
                    onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="featured-toggle" className="text-sm font-medium cursor-pointer">
                    Featured posts only
                  </label>
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.featured && (
              <Badge variant="secondary" className="gap-1">
                Featured only
                <button 
                  onClick={() => handleFilterChange('featured', undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing the filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}
        >
          {posts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              variant={viewMode === 'grid' ? 'default' : 'compact'}
              showExcerpt={viewMode === 'list'}
            />
          ))}
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
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}