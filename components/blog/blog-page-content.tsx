'use client';

import React from 'react';
import { UnifiedBlogSearch } from '@/components/search/unified-blog-search';
import { BlogPostSummary, BlogCategory } from '@/types';

interface BlogPageContentProps {
  posts: BlogPostSummary[];
  categories: BlogCategory[];
  tags: string[];
  filters: any;
  pagination: any;
}

export function BlogPageContent({
  posts,
  categories,
  tags,
  filters,
  pagination,
}: BlogPageContentProps) {
  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    // In a real implementation, this would update the URL and refetch data
    console.log('Filters changed:', newFilters);
  };

  // Handle search
  const handleSearch = (query: string) => {
    // In a real implementation, this would update the URL and refetch data
    console.log('Search query:', query);
  };

  return (
    <UnifiedBlogSearch
      posts={posts}
      categories={categories}
      tags={tags}
      filters={filters}
      pagination={pagination}
      onFiltersChange={handleFiltersChange}
      onSearch={handleSearch}
      layout="top"
      showSidebar={false} // Sidebar is handled by UniversalPageLayout
    />
  );
}