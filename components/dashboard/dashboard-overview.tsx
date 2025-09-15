"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MetricsCard } from "./metrics-card";
import { QuickActions } from "./quick-actions";
import { UsageProgress } from "./usage-progress";
import { NotificationsPanel } from "./notifications-panel";
import { PerformanceInsights } from "./performance-insights";
import { ListingManagementIntegration } from "./listing-management-integration";
import { QuickListingCreator } from "./quick-listing-creator";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import { DashboardOverviewProps, QuickAction } from "@/types/dashboard";
import { formatDate, calculatePerformanceScore } from "@/lib/dashboard-utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Edit,
} from "lucide-react";

export function DashboardOverview({
  sellerData,
  analytics,
  subscription,
  recentActivity,
  listings = [],
  categories = [],
}: DashboardOverviewProps) {
  const isMobile = useIsMobile();

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
      label: "Manage Listings",
      href: "/dashboard/listings",
      icon: Package,
      description: "View and edit your listings",
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
    <MobileResponsiveWrapper
      className="space-y-6"
      mobileClassName="space-y-4 px-2"
      desktopClassName="space-y-6"
    >
      {/* Welcome Section */}
      <div
        className={`flex ${isMobile ? "flex-col gap-3" : "items-center justify-between"}`}
      >
        <div>
          <h1
            className={`font-bold tracking-tight ${isMobile ? "text-2xl" : "text-3xl"}`}
          >
            Welcome back, {sellerData.name}!
          </h1>
          <p
            className={`text-muted-foreground mt-1 ${isMobile ? "text-sm" : ""}`}
          >
            Here's what's happening with your business today.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 ${isMobile ? "flex-wrap" : ""}`}
        >
          <Badge variant="outline" className={isMobile ? "text-xs" : "text-sm"}>
            {sellerData.tier.name} Tier
          </Badge>
          {sellerData.verificationStatus.isVerified && (
            <Badge
              variant="default"
              className={isMobile ? "text-xs" : "text-sm"}
            >
              Verified Seller
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div
        className={`grid gap-4 ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-5"}`}
      >
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

      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* Quick Actions */}
        <div className={isMobile ? "" : "lg:col-span-2"}>
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

      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* Recent Activity */}
        <Card className={isMobile ? "" : "lg:col-span-2"}>
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
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}
          >
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

      {/* Quick Listing Creator */}
      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        <Card className={isMobile ? "" : "lg:col-span-1"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickListingCreator
              categories={categories}
              onListingCreated={() => {
                // Refresh listings or show success message
                window.location.reload();
              }}
            />
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/listings">
                <Package className="h-4 w-4 mr-2" />
                Manage All Listings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Full Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications and Performance Insights */}
        <div
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:col-span-2 grid-cols-1 lg:grid-cols-2"}`}
        >
          <NotificationsPanel
            sellerData={sellerData}
            subscription={subscription}
          />
          <PerformanceInsights analytics={analytics} sellerData={sellerData} />
        </div>
      </div>

      {/* Recent Listings Management */}
      {listings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Listings
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/listings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {listings.slice(0, 6).map((listing) => (
                <div
                  key={listing._id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {listing.title}
                    </h4>
                    <Badge
                      variant={
                        listing.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat("en-PK", {
                      style: "currency",
                      currency: "PKR",
                      minimumFractionDigits: 0,
                    }).format(listing.price)}
                    /{listing.priceType}
                  </p>
                  <div className={`flex gap-1 ${isMobile ? "flex-col" : ""}`}>
                    <Button
                      asChild
                      size={isMobile ? "sm" : "sm"}
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/listing/${listing.slug?.current}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        {isMobile ? "View" : "View"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size={isMobile ? "sm" : "sm"}
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/dashboard/listings/edit/${listing._id}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        {isMobile ? "Edit" : "Edit"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </MobileResponsiveWrapper>
  );
}
