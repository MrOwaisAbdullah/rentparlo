'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SellerProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Profile Info Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start flex-1">
              {/* Avatar Skeleton */}
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />

              {/* Basic Info Skeleton */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-28" />
                  </div>
                </div>

                {/* Verification Status Skeleton */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                </div>

                {/* Location and Member since */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
                  <Skeleton className="h-3 sm:h-4 w-32 sm:w-36" />
                </div>

                {/* Bio Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-2xl" />
                  <Skeleton className="h-3 sm:h-4 w-3/4 max-w-xs sm:max-w-xl" />
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
              <Skeleton className="h-8 sm:h-10 w-full sm:w-40" />
              <Skeleton className="h-8 sm:h-10 w-full sm:w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Desktop Tabs Skeleton */}
        <div className="hidden md:block mb-6">
          <div className="flex space-x-4 sm:space-x-8 border-b">
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
            <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
          </div>
        </div>

        {/* Mobile Tabs Skeleton */}
        <div className="md:hidden mb-6">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Performance Overview Card Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 mx-auto" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                      <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                      <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                    </div>
                    <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded" />
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-1.5 sm:h-2 w-full rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Insights Card Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-5/6" />
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-4/5" />
                    <Skeleton className="h-3 sm:h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SellerProfileSkeleton;