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
  onPageChange: (page: number) => void;
  className?: string;
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

  // Handle search input with debounce
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== filters.query) {
        onFiltersChange({ ...filters, query: searchQuery, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof BlogFilters, value: string | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug.current}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tag</label>
                <Select
                  value={filters.tag || ''}
                  onValueChange={(value) => handleFilterChange('tag', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tags</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select
                  value={filters.language || ''}
                  onValueChange={(value) => handleFilterChange('language', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All languages</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="popular">Most popular</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Posts Toggle */}
            <div className="flex items-center justify-between pt-2 border-t">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Featured posts only</span>
              </label>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find(c => c.slug.current === filters.category)?.title}
                <button 
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.tag && (
              <Badge variant="secondary" className="gap-1">
                Tag: {filters.tag}
                <button 
                  onClick={() => handleFilterChange('tag', undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.language && (
              <Badge variant="secondary" className="gap-1">
                Language: {filters.language === 'en' ? 'English' : filters.language === 'ur' ? 'Urdu' : 'Both'}
                <button 
                  onClick={() => handleFilterChange('language', undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.page;
              
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}