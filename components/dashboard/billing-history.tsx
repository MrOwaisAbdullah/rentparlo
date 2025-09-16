'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { BillingRecord, EnhancedUserSubscription } from "@/types";
import { formatDate } from "@/lib/dashboard-utils";
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

interface BillingHistoryProps {
  billingHistory: BillingRecord[];
  currentSubscription: EnhancedUserSubscription;
}

export function BillingHistory({
  billingHistory,
  currentSubscription,
}: BillingHistoryProps) {

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
  ];

  return (
    <div className="space-y-6">
      {billingHistory.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you make payments.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
              data={billingHistory}
              columns={billingColumns}
              pagination={true}
              sorting={true}
              filtering={true}
              title="Billing History"
            />
      )}
    </div>
  );
}