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
  return (
    <UnifiedBlogSearch
      posts={posts}
      categories={categories}
      tags={tags}
      filters={filters}
      pagination={pagination}
      layout="top"
      showSidebar={false} // Sidebar is handled by UniversalPageLayout
    />
  );
}