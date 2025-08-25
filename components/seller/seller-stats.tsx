'use client';

import React from 'react';
import { 
  Eye, MessageCircle, Phone, Share2, TrendingUp, 
  Users, Clock, Star, Package, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  created_at: string;
}

interface SellerStatsProps {
  analytics: Analytics;
  seller: Seller;
}

export function SellerStats({ analytics, seller }: SellerStatsProps) {
  const joinDate = new Date(seller.created_at);
  const monthsActive = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  const avgListingsPerMonth = Math.round(analytics.totalListings / monthsActive);
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
                  (Math.min(analytics.totalContactClicks / analytics.totalViews, 0.1) / 0.1) * 0.3;
    
    if (score >= 0.8) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 0.6) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 0.4) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const performance = getPerformanceLevel();

  const stats = [
    {
      title: 'Profile Views',
      value: formatNumber(analytics.totalViews),
      icon: Eye,
      description: 'Total profile visits',
      change: analytics.totalViews > 100 ? '+12%' : null,
      changeType: 'positive' as const
    },
    {
      title: 'Contact Requests',
      value: formatNumber(analytics.totalContactClicks + analytics.totalWhatsAppClicks),
      icon: MessageCircle,
      description: 'People who contacted',
      change: null,
      changeType: 'neutral' as const
    },
    {
      title: 'Active Listings',
      value: analytics.activeListings.toString(),
      icon: Package,
      description: `${analytics.totalListings} total listings`,
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
            <Badge className={performance.color}>
              {performance.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {seller.total_sales}
              </div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.uniqueUsers ? formatNumber(analytics.uniqueUsers) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Unique Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(analytics.avgSessionDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              {/* Progress bar for some stats */}
              {stat.title === 'Customer Rating' && seller.customer_rating > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Rating</span>
                    <span>{seller.customer_rating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(seller.customer_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {stat.title === 'Response Time' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Speed</span>
                    <span>{responseTimeHours <= 1 ? 'Excellent' : responseTimeHours <= 6 ? 'Good' : 'Slow'}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        responseTimeHours <= 1 ? 'bg-green-500' : 
                        responseTimeHours <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.max(20, Math.min(100, 100 - (responseTimeHours / 24) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Engagement</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • Contact rate: {analytics.totalViews > 0 
                    ? `${(((analytics.totalContactClicks + analytics.totalWhatsAppClicks) / analytics.totalViews) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </li>
                <li>
                  • Active since: {joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </li>
                <li>
                  • Listings per month: {avgListingsPerMonth}
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • Overall rating: {performance.label.toLowerCase()}
                </li>
                <li>
                  • Reviews ratio: {analytics.totalListings > 0 
                    ? `${(seller.total_reviews / analytics.totalListings).toFixed(1)} per listing`
                    : 'No data'
                  }
                </li>
                <li>
                  • Sales conversion: {analytics.totalContactClicks > 0 
                    ? `${((seller.total_sales / analytics.totalContactClicks) * 100).toFixed(1)}%`
                    : 'No data'
                  }
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SellerStats;