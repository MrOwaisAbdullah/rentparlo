'use client';

import React from 'react';
import { Eye, Phone, DollarSign, Users, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Analytics {
  todayViews: number;
  todayContacts: number;
  weeklyViews: number;
  weeklyContacts: number;
  monthlyViews: number;
  monthlyContacts: number;
  totalEarnings: number;
  avgRating: number;
  responseRate: number;
}

interface Profile {
  total_listings: number;
  active_listings: number;
  total_views: number;
  total_contacts: number;
  success_rate: number;
  response_time: string;
}

interface DashboardStatsProps {
  analytics: Analytics;
  profile: Profile;
  period: string;
}

export function DashboardStats({ analytics, profile, period }: DashboardStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate changes (mock data for demonstration)
  const viewsChange = getChangePercentage(analytics.weeklyViews, analytics.weeklyViews * 0.8);
  const contactsChange = getChangePercentage(analytics.weeklyContacts, analytics.weeklyContacts * 0.9);
  const earningsChange = getChangePercentage(analytics.totalEarnings, analytics.totalEarnings * 0.85);
  const ratingsChange = getChangePercentage(analytics.avgRating, analytics.avgRating * 0.95);

  const stats = [
    {
      title: 'Total Views',
      value: formatNumber(profile.total_views),
      icon: Eye,
      change: viewsChange,
      period: 'vs last week',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Contact Requests',
      value: formatNumber(profile.total_contacts),
      icon: Phone,
      change: contactsChange,
      period: 'vs last week',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(analytics.totalEarnings),
      icon: DollarSign,
      change: earningsChange,
      period: 'this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Average Rating',
      value: analytics.avgRating.toFixed(1),
      icon: Star,
      change: ratingsChange,
      period: 'all time',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Listings',
      value: profile.active_listings.toString(),
      icon: Users,
      change: 0,
      period: `of ${profile.total_listings} total`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Response Rate',
      value: `${analytics.responseRate}%`,
      icon: Clock,
      change: 0,
      period: profile.response_time,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.change > 0;
        const isNegative = stat.change < 0;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : isNegative ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.period}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default DashboardStats;