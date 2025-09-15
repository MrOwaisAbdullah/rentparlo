"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UsageProgress } from "./usage-progress";
import { MetricsCard } from "./metrics-card";
import { PackageComparison } from "./package-comparison";
import { BillingHistory } from "./billing-history";
import { PackageDashboardProps } from "@/types/dashboard";
import { formatDate, calculateDaysRemaining } from "@/lib/dashboard-utils";
import {
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  BarChart3,
  Camera,
  HardDrive,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function PackageDashboard({
  currentSubscription,
  availablePackages,
  usage,
  billingHistory,
}: PackageDashboardProps) {
  const [showComparison, setShowComparison] = useState(!currentSubscription);
  const [showBilling, setShowBilling] = useState(false);

  const handleUpgrade = async (packageId: string) => {
    try {
      const response = await fetch("/api/dashboard/package/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Package changed successfully:", result);
        window.location.reload();
      } else {
        console.error("Failed to change package");
      }
    } catch (error) {
      console.error("Error changing package:", error);
    }
  };

  const handleDowngrade = async (packageId: string) => {
    await handleUpgrade(packageId);
  };

  if (!currentSubscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Package Management</h1>
            <p className="text-muted-foreground mt-1">
              You do not have an active subscription. Choose a package to get started.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select a Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PackageComparison
              availablePackages={availablePackages}
              currentSubscription={null}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(currentSubscription.endDate);
  const isExpiringSoon = daysRemaining <= 7;
  const isExpired = daysRemaining <= 0;

  const packageFeatures = currentSubscription.package.features || [];
  const packageLimits = currentSubscription.package.limits;

  // Calculate usage percentages
  const listingsUsage =
    packageLimits.maxListings > 0
      ? (usage.listingsUsed / packageLimits.maxListings) * 100
      : 0;
  const featuredUsage =
    packageLimits.maxFeaturedListings > 0
      ? (usage.featuredListingsUsed / packageLimits.maxFeaturedListings) * 100
      : 0;
  const storageUsage =
    packageLimits.storageLimit > 0
      ? (usage.storageUsed / packageLimits.storageLimit) * 100
      : 0;

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    }
    if (currentSubscription.status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">{currentSubscription.status}</Badge>;
  };

  const getFeatureIcon = (featureName: string) => {
    switch (featureName.toLowerCase()) {
      case "priority support":
        return <Users className="h-4 w-4" />;
      case "advanced analytics":
        return <BarChart3 className="h-4 w-4" />;
      case "featured listings":
        return <Star className="h-4 w-4" />;
      case "location boost":
        return <TrendingUp className="h-4 w-4" />;
      case "unlimited photos":
        return <Camera className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleToggleAutoRenew = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/dashboard/billing/auto-renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Auto-renew updated:", result);
        // Refresh the page or update state
        window.location.reload();
      } else {
        console.error("Failed to update auto-renew");
      }
    } catch (error) {
      console.error("Error updating auto-renew:", error);
    }
  };

  const handleUpdatePaymentMethod = () => {
    // In a real implementation, this would open a payment method update flow
    console.log("Update payment method clicked");
    // You might redirect to a payment processor like Stripe
  };

  const handleDownloadInvoice = async (recordId: string) => {
    try {
      const response = await fetch(
        `/api/dashboard/billing/invoice/${recordId}`
      );

      if (response.ok) {
        const result = await response.json();
        // In a real implementation, you'd download the actual file
        console.log("Invoice download:", result);
        // window.open(result.invoice.downloadUrl, '_blank');
      } else {
        console.error("Failed to download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Package Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and monitor usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            {showComparison ? "Hide Packages" : "Compare Packages"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBilling(!showBilling)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {showBilling ? "Hide Billing" : "Billing History"}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {(isExpired || isExpiringSoon) && (
        <Card
          className={cn(
            "border-l-4",
            isExpired
              ? "border-l-red-500 bg-red-50"
              : "border-l-yellow-500 bg-yellow-50"
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  "h-5 w-5 mt-0.5",
                  isExpired ? "text-red-600" : "text-yellow-600"
                )}
              />
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-semibold",
                    isExpired ? "text-red-900" : "text-yellow-900"
                  )}
                >
                  {isExpired
                    ? "Subscription Expired"
                    : "Subscription Expiring Soon"}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1",
                    isExpired ? "text-red-700" : "text-yellow-700"
                  )}
                >
                  {isExpired
                    ? "Your subscription has expired. Renew now to continue accessing premium features."
                    : `Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Renew to avoid service interruption.`}
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  variant={isExpired ? "destructive" : "default"}
                >
                  {isExpired ? "Renew Now" : "Extend Subscription"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Package Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Package: {currentSubscription.package.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {currentSubscription.package.currency}{" "}
                    {currentSubscription.package.price}
                    <span className="text-sm text-muted-foreground ml-1">
                      /{currentSubscription.package.duration} days
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge()}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expires</span>
                  <span
                    className={cn(
                      "font-medium",
                      isExpiringSoon && "text-yellow-600",
                      isExpired && "text-red-600"
                    )}
                  >
                    {formatDate(currentSubscription.endDate)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Auto Renew
                  </span>
                  <Badge
                    variant={
                      currentSubscription.autoRenew ? "default" : "outline"
                    }
                  >
                    {currentSubscription.autoRenew ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Next Billing
                  </span>
                  <span className="font-medium">
                    {currentSubscription.autoRenew
                      ? formatDate(currentSubscription.nextBillingDate)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Days Left
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isExpiringSoon && "text-yellow-600",
                      isExpired && "text-red-600"
                    )}
                  >
                    {Math.max(0, daysRemaining)} days
                  </span>
                </div>
              </div>
            </div>

            {/* Package Features */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Package Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {packageFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getFeatureIcon(feature.name)}
                    <span
                      className={cn(
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      )}
                    >
                      {feature.name}
                      {feature.limit && ` (${feature.limit})`}
                    </span>
                    {feature.included && (
                      <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <MetricsCard
            title="Days Remaining"
            value={Math.max(0, daysRemaining)}
            icon={Clock}
            changeType={isExpiringSoon ? "decrease" : "neutral"}
          />
          <MetricsCard
            title="Total Spent"
            value={`${currentSubscription.package.currency} ${billingHistory
              .filter((record) => record.status === "paid")
              .reduce((sum, record) => sum + record.amount, 0)}`}
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UsageProgress
              label="Listings"
              used={usage.listingsUsed}
              limit={usage.listingsLimit}
              unit="listings"
              warningThreshold={80}
            />
            <UsageProgress
              label="Featured Listings"
              used={usage.featuredListingsUsed}
              limit={usage.featuredListingsLimit}
              unit="featured"
              warningThreshold={80}
            />
            <UsageProgress
              label="Analytics Access"
              used={Math.max(
                0,
                packageLimits.analyticsAccessDays - usage.analyticsAccessDays
              )}
              limit={packageLimits.analyticsAccessDays}
              unit="days left"
              warningThreshold={20}
            />
            <UsageProgress
              label="Storage"
              used={usage.storageUsed}
              limit={usage.storageLimit}
              unit="MB"
              warningThreshold={80}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Details with Visual Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Listing Usage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Regular Listings</span>
                <span className="text-sm text-muted-foreground">
                  {usage.listingsUsed} / {usage.listingsLimit}
                </span>
              </div>
              <Progress value={listingsUsage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usage.listingsLimit - usage.listingsUsed} listings remaining
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured Listings</span>
                <span className="text-sm text-muted-foreground">
                  {usage.featuredListingsUsed} / {usage.featuredListingsLimit}
                </span>
              </div>
              <Progress value={featuredUsage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usage.featuredListingsLimit - usage.featuredListingsUsed}{" "}
                featured slots remaining
              </p>
            </div>

            {listingsUsage >= 90 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You're approaching your listing limit. Consider upgrading for
                  more listings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm text-muted-foreground">
                  {usage.storageUsed} / {usage.storageLimit} MB
                </span>
              </div>
              <Progress value={storageUsage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usage.storageLimit - usage.storageUsed} MB available
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analytics Access</span>
                <span className="text-sm text-muted-foreground">
                  {usage.analyticsAccessDays} days remaining
                </span>
              </div>
              <Progress
                value={
                  (usage.analyticsAccessDays /
                    packageLimits.analyticsAccessDays) *
                  100
                }
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Access expires in {usage.analyticsAccessDays} days
              </p>
            </div>

            {storageUsage >= 90 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Storage almost full. Delete unused photos or upgrade your
                  plan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Package Comparison Section */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Comparison & Upgrade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PackageComparison
              availablePackages={availablePackages}
              currentSubscription={currentSubscription}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
            />
          </CardContent>
        </Card>
      )}

      {/* Billing History Section */}
      {showBilling && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Renewal Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BillingHistory
              billingHistory={billingHistory}
              currentSubscription={currentSubscription}
              onToggleAutoRenew={handleToggleAutoRenew}
              onUpdatePaymentMethod={handleUpdatePaymentMethod}
              onDownloadInvoice={handleDownloadInvoice}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
