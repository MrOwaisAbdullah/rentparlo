'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Listing } from '@/types';

interface PriceInfoCardProps {
  listing: Listing;
}

export function PriceInfoCard({ listing }: PriceInfoCardProps) {
  const formatPrice = (price: number, priceType?: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: '/hr',
      daily: '/day', 
      weekly: '/week',
      monthly: '/month',
      yearly: '/year'
    };

    // Handle case where priceType might be undefined
    const normalizedPriceType = priceType || 'daily';
    return `${formatted}${typeMap[normalizedPriceType as keyof typeof typeMap] || '/' + normalizedPriceType}`;
  };

  const formatDate = (dateString: string) => {
    // Use _createdAt from Sanity if available, otherwise use fallbacks
    const dateToFormat = dateString || listing._createdAt || listing.createdAt || listing.created_at;
    if (!dateToFormat) return 'N/A';
    
    return new Date(dateToFormat).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriceInfo = () => {
    const prices = [];
    
    // Add base price
    if (listing.price) {
      prices.push({
        type: 'Base Price',
        amount: listing.price,
        period: listing.priceType
      });
    }
    
    // Add hourly price if available
    if (listing.pricePerHour) {
      prices.push({
        type: 'Per Hour',
        amount: listing.pricePerHour,
        period: 'hourly'
      });
    }
    
    // Add weekly price if available
    if (listing.priceWeekly) {
      prices.push({
        type: 'Per Week',
        amount: listing.priceWeekly,
        period: 'weekly'
      });
    }
    
    // Add monthly price if available
    if (listing.priceMonthly) {
      prices.push({
        type: 'Per Month',
        amount: listing.priceMonthly,
        period: 'monthly'
      });
    }
    
    return prices;
  };

  const priceInfo = getPriceInfo();

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Price Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {priceInfo.length > 0 ? (
            priceInfo.map((price, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                <div>
                  <div className="font-medium text-sm sm:text-base">{price.type}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground capitalize">{price.period}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base sm:text-lg">{formatPrice(price.amount, price.period)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No pricing information available
            </div>
          )}
          
          {/* Listing date */}
          <div className="flex items-center gap-2 pt-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Listed on {formatDate(listing._createdAt)}
            </span>
          </div>
          
          {/* Availability badge */}
          {listing.availability?.isAvailable !== undefined && (
            <div className="pt-2">
              <Badge 
                className={listing.availability.isAvailable 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                  : 'bg-red-100 text-red-800 hover:bg-red-100'}
              >
                {listing.availability.isAvailable ? 'Available Now' : 'Not Available'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}