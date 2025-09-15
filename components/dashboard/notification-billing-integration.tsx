"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell,
  CreditCard,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  X,
  Info,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface NotificationSettings {
  email: {
    enabled: boolean;
    marketing: boolean;
    billing: boolean;
    security: boolean;
    listings: boolean;
    analytics: boolean;
  };
  sms: {
    enabled: boolean;
    urgent: boolean;
    billing: boolean;
    verification: boolean;
  };
  push: {
    enabled: boolean;
    realtime: boolean;
    daily: boolean;
    weekly: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

interface BillingSettings {
  autoRenew: boolean;
  paymentMethod: {
    type: "card" | "bank" | "wallet";
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  };
  billingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  invoicePreferences: {
    emailInvoices: boolean;
    language: "en" | "ur";
    currency: "PKR" | "USD";
  };
}

interface SystemNotification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  category: "billing" | "security" | "listing" | "verification" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "billing" | "technical" | "account" | "listing" | "other";
  createdAt: string;
  lastUpdated: string;
  messages: Array<{
    id: string;
    sender: "user" | "support";
    message: string;
    timestamp: string;
    attachments?: string[];
  }>;
}

interface NotificationBillingIntegrationProps {
  sellerId: string;
  initialNotificationSettings?: NotificationSettings;
  initialBillingSettings?: BillingSettings;
  initialNotifications?: SystemNotification[];
  initialSupportTickets?: SupportTicket[];
}

export function NotificationBillingIntegration({
  sellerId,
  initialNotificationSettings,
  initialBillingSettings,
  initialNotifications = [],
  initialSupportTickets = [],
}: NotificationBillingIntegrationProps) {
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(
      initialNotificationSettings || {
        email: {
          enabled: true,
          marketing: false,
          billing: true,
          security: true,
          listings: true,
          analytics: false,
        },
        sms: {
          enabled: false,
          urgent: true,
          billing: false,
          verification: true,
        },
        push: { enabled: true, realtime: true, daily: false, weekly: true },
        inApp: { enabled: true, sound: true, desktop: false },
      }
    );

  const [billingSettings, setBillingSettings] = useState<BillingSettings>(
    initialBillingSettings || {
      autoRenew: false,
      paymentMethod: { type: "card", last4: "", isDefault: false },
      billingAddress: {
        country: "Pakistan",
        city: "",
        address: "",
        postalCode: "",
      },
      invoicePreferences: {
        emailInvoices: true,
        language: "en",
        currency: "PKR",
      },
    }
  );

  const [notifications, setNotifications] =
    useState<SystemNotification[]>(initialNotifications);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
    initialSupportTickets
  );
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<SystemNotification | null>(null);
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [notificationsRes, settingsRes, ticketsRes] = await Promise.all([
        fetch(`/api/notifications?sellerId=${sellerId}`),
        fetch(`/api/settings/notifications?sellerId=${sellerId}`),
        fetch(`/api/support/tickets?sellerId=${sellerId}`),
      ]);

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setNotificationSettings(settingsData.notifications);
        setBillingSettings(settingsData.billing);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setSupportTickets(ticketsData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = async (
    newSettings: NotificationSettings
  ) => {
    try {
      const response = await fetch(`/api/settings/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, settings: newSettings }),
      });

      if (response.ok) {
        setNotificationSettings(newSettings);
        toast.success("Notification settings updated");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notification dismissed");
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast.error("Failed to dismiss notification");
    }
  };

  const createSupportTicket = async (ticketData: Partial<SupportTicket>) => {
    try {
      const response = await fetch(`/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, ...ticketData }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setSupportTickets((prev) => [newTicket, ...prev]);
        toast.success("Support ticket created");
        return newTicket;
      } else {
        toast.error("Failed to create support ticket");
      }
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast.error("Failed to create support ticket");
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (category === "billing") return <CreditCard className="h-4 w-4" />;
    if (category === "security") return <Shield className="h-4 w-4" />;
    if (category === "verification") return <CheckCircle className="h-4 w-4" />;

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalNotifications = notifications.filter(
    (n) => n.priority === "critical" && !n.read
  );
  const openTickets = supportTickets.filter(
    (t) => t.status === "open" || t.status === "pending"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications & Billing</h2>
          <p className="text-muted-foreground">
            Manage your notifications, billing settings, and support tickets
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalNotifications.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {criticalNotifications.length} critical notification(s)
            that require immediate attention.
            <div className="mt-2 space-y-1">
              {criticalNotifications.slice(0, 2).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{notification.title}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedNotification(notification)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-xl font-bold">
                  {criticalNotifications.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-xl font-bold">{openTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Renew</p>
                <p className="text-xl font-bold">
                  {billingSettings.autoRenew ? "On" : "Off"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications ({notifications.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.forEach(
                      (n) => !n.read && markNotificationAsRead(n.id)
                    );
                  }}
                >
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(
                          notification.type,
                          notification.category
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge
                              className={getPriorityColor(
                                notification.priority
                              )}
                              variant="outline"
                            >
                              {notification.priority}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                dismissNotification(notification.id)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              notification.timestamp
                            ).toLocaleDateString()}
                          </span>
                          {notification.actionUrl && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={notification.actionUrl}>
                                {notification.actionLabel || "View"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  {Object.entries(notificationSettings.email).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {key === "enabled" &&
                              "Enable all email notifications"}
                            {key === "marketing" &&
                              "Promotional emails and updates"}
                            {key === "billing" &&
                              "Payment and subscription notifications"}
                            {key === "security" &&
                              "Security alerts and login notifications"}
                            {key === "listings" &&
                              "Listing activity and performance"}
                            {key === "analytics" && "Weekly analytics reports"}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            const newSettings = {
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                [key]: checked,
                              },
                            };
                            updateNotificationSettings(newSettings);
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  SMS Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  {Object.entries(notificationSettings.sms).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {key === "enabled" && "Enable SMS notifications"}
                            {key === "urgent" && "Critical alerts only"}
                            {key === "billing" && "Payment confirmations"}
                            {key === "verification" &&
                              "Account verification codes"}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            const newSettings = {
                              ...notificationSettings,
                              sms: {
                                ...notificationSettings.sms,
                                [key]: checked,
                              },
                            };
                            updateNotificationSettings(newSettings);
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Auto-Renewal</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically renew your subscription
                  </p>
                </div>
                <Switch
                  checked={billingSettings.autoRenew}
                  onCheckedChange={(checked) => {
                    setBillingSettings((prev) => ({
                      ...prev,
                      autoRenew: checked,
                    }));
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBillingDialog(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/package">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Support Tickets
                </CardTitle>
                <Button
                  onClick={() =>
                    createSupportTicket({
                      subject: "New Support Request",
                      category: "other",
                      priority: "medium",
                    })
                  }
                >
                  Create Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportTickets.length > 0 ? (
                  supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-sm">
                          {ticket.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {ticket.category} • {ticket.status} •{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          ticket.status === "open" ? "destructive" : "outline"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No support tickets</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Billing Dialog */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>
              Update your payment information for subscription renewals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Payment method updates will be handled through our secure payment
              processor.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBillingDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowBillingDialog(false)}>
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
