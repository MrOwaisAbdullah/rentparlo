"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashboardNotification,
  SellerProfile,
  UserSubscription,
} from "@/types/dashboard";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Shield,
  CreditCard,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dashboard-utils";

interface NotificationsPanelProps {
  sellerData: SellerProfile;
  subscription: UserSubscription;
  onDismissNotification?: (notificationId: string) => void;
}

export function NotificationsPanel({
  sellerData,
  subscription,
  onDismissNotification,
}: NotificationsPanelProps) {
  // Generate notifications based on seller data and subscription
  const generateNotifications = (): DashboardNotification[] => {
    const notifications: DashboardNotification[] = [];

    // Verification status notifications
    if (!sellerData.verificationStatus.isVerified) {
      notifications.push({
        id: "verification-pending",
        type: "warning",
        title: "Complete Your Verification",
        message:
          "Verify your account to unlock all features and build trust with customers.",
        actionUrl: "/dashboard/profile?tab=verification",
        actionLabel: "Verify Now",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (!sellerData.verificationStatus.phoneVerified) {
      notifications.push({
        id: "phone-verification",
        type: "info",
        title: "Verify Your Phone Number",
        message: "Phone verification helps customers contact you directly.",
        actionUrl: "/dashboard/profile?tab=verification",
        actionLabel: "Verify Phone",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (!sellerData.verificationStatus.documentVerified) {
      notifications.push({
        id: "document-verification",
        type: "warning",
        title: "Upload Verification Documents",
        message:
          "Document verification increases your credibility and tier points.",
        actionUrl: "/dashboard/profile?tab=verification",
        actionLabel: "Upload Documents",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    // Subscription notifications
    const daysUntilExpiry = Math.ceil(
      (new Date(subscription.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      notifications.push({
        id: "subscription-expiring",
        type: "warning",
        title: "Subscription Expiring Soon",
        message: `Your subscription expires in ${daysUntilExpiry} days. Renew to continue accessing premium features.`,
        actionUrl: "/dashboard/package",
        actionLabel: "Renew Now",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (daysUntilExpiry <= 0) {
      notifications.push({
        id: "subscription-expired",
        type: "error",
        title: "Subscription Expired",
        message:
          "Your subscription has expired. Renew to restore access to premium features.",
        actionUrl: "/dashboard/package",
        actionLabel: "Renew Subscription",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (!subscription.autoRenew && daysUntilExpiry > 7) {
      notifications.push({
        id: "auto-renew-disabled",
        type: "info",
        title: "Auto-Renewal Disabled",
        message: "Enable auto-renewal to avoid service interruption.",
        actionUrl: "/dashboard/package",
        actionLabel: "Enable Auto-Renewal",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    // Performance insights
    if (sellerData.responseRate < 80) {
      notifications.push({
        id: "low-response-rate",
        type: "warning",
        title: "Improve Response Rate",
        message: `Your response rate is ${sellerData.responseRate.toFixed(1)}%. Respond faster to increase your tier points.`,
        actionUrl: "/dashboard/analytics",
        actionLabel: "View Analytics",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (sellerData.avgRating < 4.0) {
      notifications.push({
        id: "low-rating",
        type: "warning",
        title: "Rating Below Average",
        message: `Your average rating is ${sellerData.avgRating.toFixed(1)}. Focus on customer satisfaction to improve.`,
        actionUrl: "/dashboard/analytics",
        actionLabel: "View Insights",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    // Tier progression
    const tierProgress =
      (sellerData.tierPoints - sellerData.tier.minPoints) /
      (sellerData.tier.maxPoints - sellerData.tier.minPoints);

    if (tierProgress >= 0.8) {
      notifications.push({
        id: "tier-upgrade-soon",
        type: "success",
        title: "Tier Upgrade Coming Soon!",
        message: `You're ${sellerData.tier.maxPoints - sellerData.tierPoints} points away from the next tier.`,
        actionUrl: "/dashboard/profile",
        actionLabel: "View Progress",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return notifications;
  };

  const notifications = generateNotifications();

  const getNotificationIcon = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationBadgeVariant = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              All caught up! No new notifications.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </div>
          <Badge variant="secondary" className="text-xs">
            {notifications.filter((n) => !n.read).length} new
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                !notification.read && "bg-muted/50"
              )}
            >
              <div className="mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {onDismissNotification && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => onDismissNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-1">
                  {notification.actionUrl && notification.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      asChild
                    >
                      <a href={notification.actionUrl}>
                        {notification.actionLabel}
                      </a>
                    </Button>
                  )}
                  <Badge
                    variant={getNotificationBadgeVariant(notification.type)}
                    className="text-xs ml-auto"
                  >
                    {notification.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Notifications ({notifications.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
