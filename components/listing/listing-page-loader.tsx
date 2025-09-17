"use client";

import { useEffect } from "react";
import { useLoading } from "@/contexts/loading-context";

export function ListingPageLoader() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Hide loading when the listing page component mounts
    hideLoading();
  }, [hideLoading]);

  return null; // This component doesn't render anything
}
