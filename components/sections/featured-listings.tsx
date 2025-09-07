'use client';

import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Listing } from '@/types';
import { ListingCard } from '@/components/cards/listing-card'; // Import the ListingCard component
import { toast } from "sonner"

interface FeaturedListingsProps {
  listings: Listing[];
  className?: string;
}

export function FeaturedListings({ listings, className }: FeaturedListingsProps) {

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured listings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          variant="featured"
        />
      ))}
    </div>
  );
}

export default FeaturedListings;