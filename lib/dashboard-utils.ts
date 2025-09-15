// Dashboard utility functions
import { SellerAnalytics, TimeRange, ChartData } from "@/types/dashboard";

/**
 * Format numbers for display (e.g., 1000 -> 1K, 1000000 -> 1M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number, decimals = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(
  conversions: number,
  total: number
): number {
  if (total === 0) return 0;
  return (conversions / total) * 100;
}

/**
 * Generate time range options for analytics
 */
export function getTimeRangeOptions(): Array<{
  label: string;
  value: TimeRange["preset"];
}> {
  return [
    { label: "Today", value: "today" },
    { label: "Last 7 days", value: "week" },
    { label: "Last 30 days", value: "month" },
    { label: "Last 3 months", value: "quarter" },
    { label: "Last year", value: "year" },
  ];
}

/**
 * Create time range from preset
 */
export function createTimeRange(preset: TimeRange["preset"]): TimeRange {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(end.getDate() - 7);
      break;
    case "month":
      start.setDate(end.getDate() - 30);
      break;
    case "quarter":
      start.setMonth(end.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 7);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    preset,
  };
}

/**
 * Format date for display
 */
export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Date(dateString).toLocaleDateString(
    "en-US",
    options || defaultOptions
  );
}

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateString);
}

/**
 * Calculate performance score based on various metrics
 */
export function calculatePerformanceScore(analytics: SellerAnalytics): number {
  const weights = {
    conversionRate: 0.3,
    responseRate: 0.25,
    avgRating: 0.25,
    viewsToContactsRatio: 0.2,
  };

  // Normalize metrics to 0-100 scale
  const normalizedConversionRate = Math.min(analytics.conversionRate * 20, 100); // 5% = 100 points
  const normalizedResponseRate = 85; // Placeholder - would come from seller profile
  const normalizedRating = 94; // Placeholder - would come from seller profile (4.7/5 * 100)
  const normalizedViewsRatio = Math.min(
    (analytics.totalContacts / analytics.totalViews) * 1000,
    100
  );

  const score =
    normalizedConversionRate * weights.conversionRate +
    normalizedResponseRate * weights.responseRate +
    normalizedRating * weights.avgRating +
    normalizedViewsRatio * weights.viewsToContactsRatio;

  return Math.round(score);
}

/**
 * Get performance score color class
 */
export function getPerformanceScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Get tier color class
 */
export function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case "platinum":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "gold":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "silver":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "bronze":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Generate chart colors
 */
export function generateChartColors(count: number): string[] {
  const baseColors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

/**
 * Validate time range
 */
export function isValidTimeRange(timeRange: TimeRange): boolean {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  return start <= end && start <= new Date();
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
