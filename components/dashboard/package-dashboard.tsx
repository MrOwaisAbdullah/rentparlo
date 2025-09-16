'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function PackageDashboard({
  currentSubscription,
  availablePackages,
  usage,
  billingHistory,
}: PackageDashboardProps) {
  const [activeTab, setActiveTab] = useState("active");

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

  const daysRemaining = calculateDaysRemaining(currentSubscription.end_date);
  const isExpiringSoon = daysRemaining <= 7;
  const isExpired = daysRemaining <= 0;

  const packageFeatures = currentSubscription.subscription_packages?.features || {};
  const packageName = currentSubscription.subscription_packages?.name || "Unknown";
  const packageCurrency = currentSubscription.subscription_packages?.currency || "PKR";
  const packagePrice = currentSubscription.subscription_packages?.price || 0;
  const billingCycle = currentSubscription.subscription_packages?.billing_cycle || "monthly";
  const packageDuration = billingCycle === "yearly" ? 365 : 30;

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    }
    if (currentSubscription.status === "active") {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline">{currentSubscription.status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Package Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and monitor usage
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-col sm:flex-row sm:grid sm:grid-cols-3 gap-1 h-auto sm:h-12">
          <TabsTrigger 
            value="active" 
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 py-3 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm px-2 sm:px-3 order-1"
          >
            Active Package
          </TabsTrigger>
          <div className="flex w-full gap-1 sm:contents order-2">
            <TabsTrigger 
              value="compare" 
              className="flex-1 sm:flex-auto w-1/2 sm:w-auto min-h-[48px] sm:min-h-0 py-3 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm px-2 sm:px-3"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="flex-1 sm:flex-auto w-1/2 sm:w-auto min-h-[48px] sm:min-h-0 py-3 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm px-2 sm:px-3"
            >
              Billing
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {(isExpired || isExpiringSoon) && (
            <Card
              className={cn(
                "border-l-4 mb-6",
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
                        ? "Your subscription has expired. Contact support to renew your subscription and continue accessing premium features."
                        : `Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Contact support to extend your subscription and avoid service interruption.`}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      variant={isExpired ? "destructive" : "default"}
                      onClick={() => window.location.href = "/contact-support"}
                    >
                      {isExpired ? "Contact Support to Renew" : "Contact Support to Extend"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Current Package: {packageName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium ml-auto">{packageCurrency} {packagePrice} / {packageDuration} days</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="ml-auto">{getStatusBadge()}</div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Started:</span>
                      <span className="font-medium ml-auto">{formatDate(currentSubscription.start_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className={`font-medium ml-auto ${isExpiringSoon ? 'text-yellow-600' : ''} ${isExpired ? 'text-red-600' : ''}`}>
                        {formatDate(currentSubscription.end_date)} ({daysRemaining} days left)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Package Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(packageFeatures).map(([featureName, featureValue]) => (
                      <div key={featureName} className="flex items-center gap-3">
                        {featureValue ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`text-sm capitalize ${featureValue ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {featureName.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    used={usage.analyticsAccessDays}
                    limit={currentSubscription.subscription_packages?.analytics_days || 30}
                    unit="days left"
                    warningThreshold={20}
                  />
                </CardContent>
              </Card>
              
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
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
        </TabsContent>

        <TabsContent value="billing" className="mt-6">

              <BillingHistory
                billingHistory={billingHistory}
                currentSubscription={currentSubscription}
              />
        </TabsContent>
      </Tabs>

    </div>
  )
}
