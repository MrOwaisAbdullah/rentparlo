'use client';

import React from 'react';
import { Star, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SellerBasicInfoProps {
  seller: {
    customer_rating: number;
    total_reviews: number;
    response_time_avg: number;
    response_time_display?: string;
    response_time_description?: string;
    total_listings: number;
    active_listings: number;
  };
}

export function SellerBasicInfo({ seller }: SellerBasicInfoProps) {
  // Use the display text if provided, otherwise calculate from response_time_avg
  const responseTimeDisplay = seller.response_time_display || 
    (seller.response_time_avg > 0 ? 
      (Math.round(seller.response_time_avg / 60) > 0 ? 
        `${Math.round(seller.response_time_avg / 60)}h` : 
        '< 1h') : 
      '< 1h');
  
  const responseTimeDescription = seller.response_time_description || 'Average response time';
  
  const stats = [
    {
      title: 'Customer Rating',
      value: seller.customer_rating > 0 ? seller.customer_rating.toFixed(1) : 'N/A',
      icon: Star,
      description: `${seller.total_reviews} reviews`
    },
    {
      title: 'Response Time',
      value: responseTimeDisplay,
      icon: Clock,
      description: responseTimeDescription
    },
    {
      title: 'Active Listings',
      value: seller.active_listings.toString(),
      icon: Package,
      description: `${seller.total_listings} total listings`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Basic Info Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              {/* Progress bar for rating */}
              {stat.title === 'Customer Rating' && seller.customer_rating > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Rating</span>
                    <span>{seller.customer_rating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-yellow-400 h-1.5 rounded-full" 
                      style={{ width: `${(seller.customer_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}