"use client";

import { useState, useEffect } from "react";
import {
  EnhancedUserSubscription,
  SubscriptionPackage,
  PackageUsage,
  BillingRecord,
} from "@/types";

interface PackageData {
  currentSubscription: EnhancedUserSubscription;
  availablePackages: SubscriptionPackage[];
  usage: PackageUsage;
  billingHistory: BillingRecord[];
}

interface UsePackageDataReturn {
  data: PackageData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePackageData(): UsePackageDataReturn {
  const [data, setData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/package");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const packageData = await response.json();
      setData(packageData);
    } catch (err) {
      console.error("Error fetching package data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch package data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPackageData,
  };
}
