'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Search Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar Skeleton */}
          <div className="flex gap-3 mb-4">
            <Skeleton className="flex-1 h-12 rounded-lg" />
            <Skeleton className="w-20 h-12 rounded-lg" />
          </div>

          {/* Filter Controls Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-20 h-10 rounded-lg" />
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
            <Skeleton className="w-40 h-10 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar Skeleton */}
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-4" />
                </div>
                
                {/* Category Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>

                {/* Location Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>

                {/* Condition Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="w-18 h-4" />
                  <Skeleton className="w-full h-10" />
                </div>

                {/* Price Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="w-24 h-4" />
                  <div className="grid grid-cols-1 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="w-full h-8" />
                    ))}
                  </div>
                  <Skeleton className="w-full h-6" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Content Skeleton */}
          <div className="flex-1">
            {/* Results Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-20 h-5" />
              </div>
              <Skeleton className="w-20 h-8" />
            </div>

            {/* Results Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-10" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10" />
                ))}
                <Skeleton className="w-20 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact skeleton for list view
export function SearchSkeletonCompact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 mb-4">
            <Skeleton className="flex-1 h-12 rounded-lg" />
            <Skeleton className="w-20 h-12 rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-10 rounded-lg" />
            <Skeleton className="w-40 h-10 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="w-16 h-6" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-full h-10" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-20 h-8" />
            </div>
            
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchSkeleton;