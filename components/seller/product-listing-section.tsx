'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingCard } from '@/components/cards/listing-card';
import { Listing } from '@/types';
import { cn } from '@/lib/utils';

interface ProductListingSectionProps {
  title: string;
  listings: Listing[];
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export function ProductListingSection({ 
  title, 
  listings, 
  showViewAll = true, 
  onViewAll,
  className 
}: ProductListingSectionProps) {
  if (!listings || listings.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No listings available in this section.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
          {showViewAll && listings.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listings.slice(0, 6).map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              variant="category"
              showSellerInfo={false}
              className="h-full"
            />
          ))}
        </div>
        
        {/* Show more button for mobile when there are many listings */}
        {showViewAll && listings.length > 6 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={onViewAll}
              className="w-full sm:w-auto"
            >
              View All {listings.length} Items
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}