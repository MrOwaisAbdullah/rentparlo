'use client';

import React from 'react';
import { Star, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SellerBasicInfoProps {
  seller: {
    customer_rating: number;
    total_reviews: number;
    response_time_avg: number;
    total_listings: number;
    active_listings: number;
  };
}

export function SellerBasicInfo({ seller }: SellerBasicInfoProps) {
  const responseTimeHours = Math.round(seller.response_time_avg / 60);
  
  const stats = [
    {
      title: 'Customer Rating',
      value: seller.customer_rating > 0 ? seller.customer_rating.toFixed(1) : 'N/A',
      icon: Star,
      description: `${seller.total_reviews} reviews`
    },
    {
      title: 'Response Time',
      value: responseTimeHours > 0 ? `${responseTimeHours}h` : '< 1h',
      icon: Clock,
      description: 'Average response time'
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