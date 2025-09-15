"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsCard } from "./metrics-card";
import { QuickActions } from "./quick-actions";
import { UsageProgress } from "./usage-progress";
import { NotificationsPanel } from "./notifications-panel";
import { PerformanceInsights } from "./performance-insights";
import { DashboardOverviewProps, QuickAction } from "@/types/dashboard";
import { formatDate, calculatePerformanceScore } from "@/lib/dashboard-utils";
import {
  Eye,
  MessageCircle,
  Package,
  Star,
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  Bell,
  Clock,
} from "lucide-react";

export function DashboardOverview({
  sellerData,
  analytics,
  subscription,
  recentActivity,
}: DashboardOverviewProps) {
  // Calculate metrics changes (placeholder - in real app, compare with previous period)
  const metricsChanges = {
    views: 12.5,
    contacts: 8.3,
    listings: 0,
    tier: 5.2,
  };

  // Calculate additional metrics
  const performanceScore = calculatePerformanceScore(analytics);
  const actualConversionRate =
    analytics.totalViews > 0
      ? (analytics.totalContacts / analytics.totalViews) * 100
      : 0;

  const quickActions: QuickAction[] = [
    {
      label: "Create Listing",
      href: "/dashboard/create-listing",
      icon: Plus,
      description: "Add a new rental listing",
    },
    {
      label: "View Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Detailed performance insights",
    },
    {
      label: "Manage Profile",
      href: "/dashboard/profile",
      icon: Settings,
      description: "Update your seller profile",
    },
  ];

  const formatActivityDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4" />;
      case "contact":
        return <MessageCircle className="h-4 w-4" />;
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {sellerData.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {sellerData.tier.name} Tier
          </Badge>
          {sellerData.verificationStatus.isVerified && (
            <Badge variant="default" className="text-sm">
              Verified Seller
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricsCard
          title="Total Views"
          value={analytics.totalViews}
          change={metricsChanges.views}
          changeType="increase"
          icon={Eye}
          trend={[45, 52, 48, 61, 55, 67, 72]}
        />
        <MetricsCard
          title="Total Contacts"
          value={analytics.totalContacts}
          change={metricsChanges.contacts}
          changeType="increase"
          icon={MessageCircle}
          trend={[12, 15, 13, 18, 16, 21, 24]}
        />
        <MetricsCard
          title="Conversion Rate"
          value={`${actualConversionRate.toFixed(1)}%`}
          change={0.3}
          changeType="increase"
          icon={TrendingUp}
        />
        <MetricsCard
          title="Active Listings"
          value={analytics.activeListings}
          change={metricsChanges.listings}
          changeType="neutral"
          icon={Package}
        />
        <MetricsCard
          title="Performance Score"
          value={performanceScore}
          change={metricsChanges.tier}
          changeType="increase"
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} />
        </div>

        {/* Seller Tier Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seller Tier Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {sellerData.tier.name} Tier
                </span>
                <Badge variant="outline" className="text-xs">
                  Level {sellerData.tier.level}
                </Badge>
              </div>
              <UsageProgress
                label="Tier Points"
                used={sellerData.tierPoints}
                limit={sellerData.tier.maxPoints}
                unit="points"
                showPercentage={false}
              />
              <p className="text-xs text-muted-foreground">
                {sellerData.tier.maxPoints - sellerData.tierPoints} points to
                next tier
              </p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Current Benefits:</p>
              <ul className="space-y-1">
                {sellerData.tier.benefits.slice(0, 3).map((benefit, index) => (
                  <li
                    key={index}
                    className="text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.listingTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === "view" && "New view"}
                        {activity.type === "contact" && "New contact"}
                        {activity.type === "whatsapp" && "WhatsApp click"}
                        {activity.userLocation &&
                          ` from ${activity.userLocation}`}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatActivityDate(activity.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Plan
                </span>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "secondary"
                  }
                >
                  Pro Package
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "destructive"
                  }
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="text-sm font-medium">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Auto Renew
                </span>
                <Badge variant={subscription.autoRenew ? "default" : "outline"}>
                  {subscription.autoRenew ? "On" : "Off"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UsageProgress
              label="Listings"
              used={analytics.totalListings}
              limit={50} // This should come from subscription.package.limits
              unit="listings"
            />
            <UsageProgress
              label="Featured Listings"
              used={5} // This should come from actual usage data
              limit={10} // This should come from subscription.package.limits
              unit="featured"
            />
            <UsageProgress
              label="Analytics Access"
              used={25} // Days used
              limit={30} // Days in package
              unit="days"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications and Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationsPanel
          sellerData={sellerData}
          subscription={subscription}
        />
        <PerformanceInsights analytics={analytics} sellerData={sellerData} />
      </div>
    </div>
  );
}
