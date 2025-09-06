'use client';

import React from 'react';
import { ProductListingSection } from '@/components/seller/product-listing-section';
import { Listing } from '@/types';
import { useRouter } from 'next/navigation';

interface ClientProductListingSectionProps {
  title: string;
  listings: Listing[];
}

export function ClientProductListingSection({ 
  title, 
  listings 
}: ClientProductListingSectionProps) {
  const router = useRouter();

  const handleViewAll = () => {
    // In a real app, this would navigate to a filtered listings page
    console.log(`View all ${title} items`);
    // Example navigation:
    // router.push(`/search?category=${title.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <ProductListingSection
      title={title}
      listings={listings}
      onViewAll={handleViewAll}
    />
  );
}