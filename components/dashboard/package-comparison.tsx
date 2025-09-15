"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SubscriptionPackage, EnhancedUserSubscription } from "@/types";
import { formatDate, calculateDaysRemaining } from "@/lib/dashboard-utils";
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Calculator,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageComparisonProps {
  availablePackages: SubscriptionPackage[];
  currentSubscription: EnhancedUserSubscription;
  onUpgrade: (packageId: string) => void;
  onDowngrade: (packageId: string) => void;
}

interface UpgradeCalculation {
  packageId: string;
  packageName: string;
  currentPrice: number;
  newPrice: number;
  proratedAmount: number;
  daysRemaining: number;
  isUpgrade: boolean;
  savings?: number;
}

export function PackageComparison({
  availablePackages,
  currentSubscription,
  onUpgrade,
  onDowngrade,
}: PackageComparisonProps) {
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeCalculation, setUpgradeCalculation] =
    useState<UpgradeCalculation | null>(null);

  const currentPackage = currentSubscription?.subscription_packages;
  const daysRemaining = currentSubscription
    ? calculateDaysRemaining(currentSubscription.end_date)
    : 0;

  const calculateProration = (
    targetPackage: SubscriptionPackage
  ): UpgradeCalculation => {
    const isUpgrade = targetPackage.price > (currentPackage?.price || 0);
    const priceDifference = targetPackage.price - (currentPackage?.price || 0);
    const dailyRate = priceDifference / targetPackage.duration;
    const proratedAmount = Math.max(0, dailyRate * daysRemaining);

    return {
      packageId: targetPackage.id,
      packageName: targetPackage.name,
      currentPrice: currentPackage?.price || 0,
      newPrice: targetPackage.price,
      proratedAmount,
      daysRemaining,
      isUpgrade,
      savings: !isUpgrade ? Math.abs(proratedAmount) : undefined,
    };
  };

  const handlePackageSelect = (pkg: SubscriptionPackage) => {
    if (pkg.id === currentPackage?.id) return;

    const calculation = calculateProration(pkg);
    setSelectedPackage(pkg);
    setUpgradeCalculation(calculation);
    setShowUpgradeDialog(true);
  };

  const handleConfirmChange = () => {
    if (!selectedPackage || !upgradeCalculation) return;

    if (upgradeCalculation.isUpgrade) {
      onUpgrade(selectedPackage.id);
    } else {
      onDowngrade(selectedPackage.id);
    }

    setShowUpgradeDialog(false);
    setSelectedPackage(null);
    setUpgradeCalculation(null);
  };

  const getPackageIcon = (packageName: string) => {
    const name = packageName.toLowerCase();
    if (name.includes("premium") || name.includes("pro")) {
      return <Crown className="h-5 w-5" />;
    }
    if (name.includes("plus") || name.includes("advanced")) {
      return <Zap className="h-5 w-5" />;
    }
    return <Star className="h-5 w-5" />;
  };

  const getPackageColor = (packageName: string, isPopular?: boolean) => {
    if (isPopular) {
      return "border-primary bg-primary/5";
    }
    const name = packageName.toLowerCase();
    if (name.includes("premium") || name.includes("pro")) {
      return "border-purple-200 bg-purple-50";
    }
    if (name.includes("plus") || name.includes("advanced")) {
      return "border-blue-200 bg-blue-50";
    }
    return "border-gray-200 bg-gray-50";
  };

  const renderFeatureComparison = (feature: any, packageName: string) => {
    if (typeof feature === "boolean") {
      return feature ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      );
    }

    if (typeof feature === "number") {
      return (
        <span className="text-sm font-medium">
          {feature === -1 ? "Unlimited" : feature.toLocaleString()}
        </span>
      );
    }

    return <span className="text-sm">{feature?.toString() || "N/A"}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Package</h2>
        <p className="text-muted-foreground">
          Compare features and upgrade or downgrade your subscription
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePackages.map((pkg) => {
          const isCurrentPackage = pkg.id === currentPackage?.id;
          const isUpgrade = pkg.price > (currentPackage?.price || 0);
          const isDowngrade = pkg.price < (currentPackage?.price || 0);

          return (
            <Card
              key={pkg.id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg",
                getPackageColor(pkg.name, pkg.isPopular),
                isCurrentPackage && "ring-2 ring-primary"
              )}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPackage && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-background">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getPackageIcon(pkg.name)}
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {pkg.currency} {pkg.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {pkg.duration} days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pkg.description}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Package Limits */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Listings
                    </span>
                    <span className="font-medium">
                      {pkg.max_listings === -1 ? "Unlimited" : pkg.max_listings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Featured
                    </span>
                    <span className="font-medium">
                      {pkg.max_featured_listings === -1
                        ? "Unlimited"
                        : pkg.max_featured_listings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Analytics
                    </span>
                    <span className="font-medium">
                      {pkg.analytics_days} days
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Package Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Priority Support</span>
                      {renderFeatureComparison(
                        pkg.features.priority_support,
                        pkg.name
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced Analytics</span>
                      {renderFeatureComparison(
                        pkg.features.advanced_analytics,
                        pkg.name
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Location Boost</span>
                      {renderFeatureComparison(
                        pkg.features.location_boost,
                        pkg.name
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Featured Listings</span>
                      {renderFeatureComparison(
                        pkg.features.featured_listing,
                        pkg.name
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  {isCurrentPackage ? (
                    <Button disabled className="w-full">
                      Current Package
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePackageSelect(pkg)}
                      className="w-full"
                      variant={isUpgrade ? "default" : "outline"}
                    >
                      {isUpgrade && <ArrowRight className="h-4 w-4 mr-2" />}
                      {isUpgrade
                        ? "Upgrade"
                        : isDowngrade
                          ? "Downgrade"
                          : "Select"}
                      {isDowngrade && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade/Downgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {upgradeCalculation?.isUpgrade ? "Upgrade" : "Downgrade"}{" "}
              Confirmation
            </DialogTitle>
          </DialogHeader>

          {upgradeCalculation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Package
                  </span>
                  <span className="font-medium">{currentPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Package
                  </span>
                  <span className="font-medium">
                    {upgradeCalculation.packageName}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Days Remaining
                  </span>
                  <span className="font-medium">
                    {upgradeCalculation.daysRemaining} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {upgradeCalculation.isUpgrade
                      ? "Additional Cost"
                      : "Refund Amount"}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      upgradeCalculation.isUpgrade
                        ? "text-red-600"
                        : "text-green-600"
                    )}
                  >
                    {currentPackage?.currency}{" "}
                    {upgradeCalculation.proratedAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {upgradeCalculation.isUpgrade ? (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Prorated Billing
                    </p>
                    <p className="text-blue-700">
                      You'll be charged the prorated amount for the remaining{" "}
                      {upgradeCalculation.daysRemaining} days. Your next billing
                      cycle will be at the new package rate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">
                      Downgrade Notice
                    </p>
                    <p className="text-yellow-700">
                      Some features may be limited immediately. Any refund will
                      be credited to your account.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmChange}
                  className="flex-1"
                  variant={
                    upgradeCalculation.isUpgrade ? "default" : "secondary"
                  }
                >
                  Confirm{" "}
                  {upgradeCalculation.isUpgrade ? "Upgrade" : "Downgrade"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
