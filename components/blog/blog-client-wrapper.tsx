'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { BlogPostSummary, BlogCategory, PopularPost, BlogFilters } from '@/types';

interface BlogClientWrapperProps {
  posts: BlogPostSummary[];
  categories: BlogCategory[];
  popularPosts: PopularPost[];
  tags: string[];
  initialFilters: BlogFilters;
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  basePath?: string; // For category pages: '/blog/category/[category]'
}

export function BlogClientWrapper({
  posts,
  categories,
  popularPosts,
  tags,
  initialFilters,
  initialPagination,
  basePath = '/blog'
}: BlogClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFiltersChange = React.useCallback((newFilters: BlogFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update URL parameters based on filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          params.set(key, value.toString());
        }
      } else {
        params.delete(key);
      }
    });

    // Always reset to page 1 when filters change
    if (newFilters.page && newFilters.page > 1) {
      params.set('page', newFilters.page.toString());
    } else {
      params.delete('page');
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams]);

  const handlePageChange = React.useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = React.useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('query', query.trim());
    } else {
      params.delete('query');
    }
    
    // Reset to page 1 when searching
    params.delete('page');

    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <BlogGrid
          posts={posts}
          categories={categories}
          tags={tags}
          filters={initialFilters}
          pagination={initialPagination}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <BlogSidebar
          categories={categories}
          popularPosts={popularPosts}
          recentPosts={posts.slice(0, 3)}
          tags={tags}
          showNewsletter={true}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}