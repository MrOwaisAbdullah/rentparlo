'use client';

import React from 'react';
import { 
  Eye, MessageCircle, Phone, Share2, TrendingUp, 
  Users, Clock, Star, Package, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Analytics {
  totalViews: number;
  totalContactClicks: number;
  totalWhatsAppClicks: number;
  totalListings: number;
  activeListings: number;
  avgSessionDuration?: number;
  uniqueUsers?: number;
}

interface Seller {
  customer_rating: number;
  total_reviews: number;
  total_sales: number;
  response_time_avg: number;
  created_at?: string;
}

interface SellerStatsProps {
  analytics: Analytics;
  seller: Seller;
}

export function SellerStats({ analytics, seller }: SellerStatsProps) {
  // Handle missing seller or created_at gracefully
  const joinDate = (seller && seller.created_at) ? new Date(seller.created_at) : new Date();
  const monthsActive = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  // Ensure all analytics values are valid numbers
  const safeAnalytics = {
    totalViews: typeof analytics.totalViews === 'number' ? Math.max(0, analytics.totalViews) : 0,
    totalContactClicks: typeof analytics.totalContactClicks === 'number' ? Math.max(0, analytics.totalContactClicks) : 0,
    totalWhatsAppClicks: typeof analytics.totalWhatsAppClicks === 'number' ? Math.max(0, analytics.totalWhatsAppClicks) : 0,
    totalListings: typeof analytics.totalListings === 'number' ? Math.max(0, analytics.totalListings) : 0,
    activeListings: typeof analytics.activeListings === 'number' ? Math.max(0, analytics.activeListings) : 0,
    avgSessionDuration: typeof analytics.avgSessionDuration === 'number' ? Math.max(0, analytics.avgSessionDuration) : undefined,
    uniqueUsers: typeof analytics.uniqueUsers === 'number' ? Math.max(0, analytics.uniqueUsers) : undefined,
  };
  
  const avgListingsPerMonth = Math.round(safeAnalytics.totalListings / monthsActive);
  const responseTimeHours = Math.round(seller.response_time_avg / 60);
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return 'N/A';
    
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getPerformanceLevel = () => {
    const score = (seller.customer_rating / 5) * 0.4 + 
                  (Math.min(responseTimeHours, 24) / 24) * 0.3 +
                  (Math.min((safeAnalytics.totalContactClicks + safeAnalytics.totalWhatsAppClicks) / Math.max(1, safeAnalytics.totalViews), 0.1) / 0.1) * 0.3;
    
    if (score >= 0.8) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 0.6) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 0.4) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const performance = getPerformanceLevel();

  const stats = [
    {
      title: 'Profile Views',
      value: formatNumber(safeAnalytics.totalViews),
      icon: Eye,
      description: 'Total profile visits',
      change: safeAnalytics.totalViews > 100 ? '+12%' : null,
      changeType: 'positive' as const
    },
    {
      title: 'Contact Requests',
      value: formatNumber(safeAnalytics.totalContactClicks + safeAnalytics.totalWhatsAppClicks),
      icon: MessageCircle,
      description: 'People who contacted',
      change: null,
      changeType: 'neutral' as const
    },
    {
      title: 'Active Listings',
      value: safeAnalytics.activeListings.toString(),
      icon: Package,
      description: `${safeAnalytics.totalListings} total listings`,
      change: null,
      changeType: 'neutral' as const
    },
    {
      title: 'Customer Rating',
      value: seller.customer_rating > 0 ? seller.customer_rating.toFixed(1) : 'N/A',
      icon: Star,
      description: `${seller.total_reviews} reviews`,
      change: null,
      changeType: 'neutral' as const
    },
    {
      title: 'Response Time',
      value: responseTimeHours > 0 ? `${responseTimeHours}h` : '< 1h',
      icon: Clock,
      description: 'Average response time',
      change: null,
      changeType: 'positive' as const
    },
    {
      title: 'Monthly Activity',
      value: avgListingsPerMonth.toString(),
      icon: Calendar,
      description: 'Avg listings per month',
      change: null,
      changeType: 'neutral' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Performance Overview
            </CardTitle>
            <Badge className={`text-xs sm:text-sm py-0.5 px-2 ${performance.color}`}>
              {performance.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-primary">
                {seller.total_sales}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {safeAnalytics.uniqueUsers ? formatNumber(safeAnalytics.uniqueUsers) : 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {formatDuration(safeAnalytics.avgSessionDuration)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg. Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg sm:text-2xl font-bold">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600' 
                          : stat.changeType === 'negative' 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
              </div>

              {/* Progress bar for some stats */}
              {stat.title === 'Customer Rating' && seller.customer_rating > 0 && (
                <div className="mt-3 sm:mt-4">
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