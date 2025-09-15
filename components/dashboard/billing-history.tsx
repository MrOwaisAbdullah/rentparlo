"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";
import { BillingRecord, EnhancedUserSubscription } from "@/types";
import { formatDate, formatDateTime } from "@/lib/dashboard-utils";
import {
  CreditCard,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Settings,
  FileText,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingHistoryProps {
  billingHistory: BillingRecord[];
  currentSubscription: EnhancedUserSubscription;
  onToggleAutoRenew: (enabled: boolean) => void;
  onUpdatePaymentMethod: () => void;
  onDownloadInvoice: (recordId: string) => void;
}

export function BillingHistory({
  billingHistory,
  currentSubscription,
  onToggleAutoRenew,
  onUpdatePaymentMethod,
  onDownloadInvoice,
}: BillingHistoryProps) {
  const [showRenewalSettings, setShowRenewalSettings] = useState(false);

  const getStatusIcon = (status: BillingRecord["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: BillingRecord["status"]) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    } as const;

    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const billingColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.date)}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium truncate">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {row.original.currency} {row.original.amount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          {getStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.invoiceUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadInvoice(row.original.id)}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalPaid = billingHistory
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + record.amount, 0);

  const lastPayment = billingHistory
    .filter((record) => record.status === "paid")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">
                  {currentSubscription.subscription_packages?.currency || "PKR"}{" "}
                  {totalPaid.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.autoRenew
                    ? formatDate(currentSubscription.nextBillingDate)
                    : "Manual Renewal"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Payment</p>
                <p className="text-lg font-semibold">
                  {lastPayment ? formatDate(lastPayment.date) : "No payments"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Renewal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renewal Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Auto-Renewal</h4>
                <Badge
                  variant={
                    currentSubscription.autoRenew ? "default" : "outline"
                  }
                >
                  {currentSubscription.autoRenew ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentSubscription.autoRenew
                  ? "Your subscription will automatically renew before expiration"
                  : "You'll need to manually renew your subscription"}
              </p>
            </div>
            <Switch
              checked={currentSubscription.autoRenew}
              onCheckedChange={onToggleAutoRenew}
            />
          </div>

          {currentSubscription.autoRenew && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Auto-Renewal Active
                  </p>
                  <p className="text-sm text-blue-700">
                    Your subscription will automatically renew on{" "}
                    {formatDate(currentSubscription.nextBillingDate)} for{" "}
                    {currentSubscription.subscription_packages?.currency}{" "}
                    {currentSubscription.subscription_packages?.price}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!currentSubscription.autoRenew && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-900">
                    Manual Renewal Required
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your subscription expires on{" "}
                    {formatDate(currentSubscription.endDate)}. Enable
                    auto-renewal or renew manually to avoid service
                    interruption.
                  </p>
                  <Button size="sm" onClick={() => onToggleAutoRenew(true)}>
                    Enable Auto-Renewal
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={onUpdatePaymentMethod}>
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRenewalSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Renewal Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you make payments.
              </p>
            </div>
          ) : (
            <DataTable
              data={billingHistory}
              columns={billingColumns}
              pagination={true}
              sorting={true}
              filtering={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Renewal Settings Dialog */}
      <Dialog open={showRenewalSettings} onOpenChange={setShowRenewalSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Renewal Preferences
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified before renewal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Renewal Reminders</p>
                  <p className="text-xs text-muted-foreground">
                    7 days before expiration
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Payment Receipts</p>
                  <p className="text-xs text-muted-foreground">
                    Email receipts after payment
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Renewal Grace Period</p>
              <p className="text-xs text-muted-foreground">
                Your account remains active for 3 days after expiration to allow
                for payment processing delays.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRenewalSettings(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowRenewalSettings(false)}
                className="flex-1"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
