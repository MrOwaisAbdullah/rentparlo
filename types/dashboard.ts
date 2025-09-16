// Dashboard-specific TypeScript interfaces and data models

import { EnhancedUserSubscription, SubscriptionPackage, PackageUsage, BillingRecord } from "@/types";

// Core Analytics Models
export interface SellerAnalytics {
  sellerId: string;
  totalViews: number;
  totalContacts: number;
  totalWhatsAppClicks: number;
  totalShares: number;
  totalSaves: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  topCities: CityMetric[];
  topDevices: DeviceMetric[];
  timeSeriesData: TimeSeriesPoint[];
  listingPerformance: ListingAnalytics[];
}

export interface ListingAnalytics {
  listingId: string;
  title: string;
  views: number;
  contacts: number;
  whatsappClicks: number;
  shares: number;
  saves: number;
  conversionRate: number;
  avgTimeOnPage: number;
  createdAt: string;
  lastActivity: string;
}

export interface TimeSeriesPoint {
  date: string;
  views: number;
  contacts: number;
  conversions: number;
}

export interface CityMetric {
  city: string;
  views: number;
  contacts: number;
  percentage: number;
}

export interface DeviceMetric {
  device: "mobile" | "tablet" | "desktop";
  views: number;
  contacts: number;
  percentage: number;
}

// Dashboard Overview Models
export interface DashboardOverviewData {
  sellerData: SellerProfile;
  analytics: SellerAnalytics;
  subscription: UserSubscription;
  recentActivity: ActivityEvent[];
  notifications: DashboardNotification[];
}

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tier: SellerTier;
  tierPoints: number;
  verificationStatus: VerificationStatus;
  responseRate: number;
  avgRating: number;
  totalRatings: number;
  joinedAt: string;
}

export interface SellerTier {
  name: "Bronze" | "Silver" | "Gold" | "Platinum";
  level: number;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
}

export interface VerificationStatus {
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  documentVerified: boolean;
  businessVerified: boolean;
}

export interface ActivityEvent {
  id: string;
  type: "view" | "contact" | "whatsapp" | "share" | "save";
  listingId: string;
  listingTitle: string;
  timestamp: string;
  userLocation?: string;
  deviceType?: string;
}

export interface DashboardNotification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  read: boolean;
}

// Package Management Models
export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: PackageFeature[];
  limits: PackageLimits;
  isPopular?: boolean;
  isActive: boolean;
}

export interface PackageFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PackageLimits {
  maxListings: number;
  maxFeaturedListings: number;
  analyticsAccessDays: number;
  maxPhotosPerListing: number;
  storageLimit: number; // in MB
  prioritySupport: boolean;
  advancedAnalytics: boolean;
}

export interface PackageUsage {
  listingsUsed: number;
  listingsLimit: number;
  featuredListingsUsed: number;
  featuredListingsLimit: number;
  analyticsAccessDays: number;
  storageUsed: number;
  storageLimit: number;
}

export interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: "paid" | "pending" | "failed" | "refunded";
  invoiceUrl?: string;
  description: string;
}

// Performance and Insights Models
export interface PerformanceScore {
  overall: number;
  responseRate: number;
  conversionRate: number;
  customerSatisfaction: number;
  verification: number;
  breakdown: PerformanceBreakdown[];
}

export interface PerformanceBreakdown {
  category: string;
  score: number;
  weight: number;
  description: string;
}

export interface Recommendation {
  id: string;
  type: "improvement" | "optimization" | "feature";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  actionUrl?: string;
  estimatedImprovement?: number;
  category: string;
}

export interface PlatformBenchmarks {
  avgConversionRate: number;
  avgResponseRate: number;
  avgRating: number;
  avgViewsPerListing: number;
  topPerformingCategories: string[];
}

// Chart and Visualization Models
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      display: boolean;
      position?: "top" | "bottom" | "left" | "right";
    };
    tooltip?: {
      enabled: boolean;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

// Component Props Interfaces
export interface DashboardOverviewProps {
  sellerData: SellerProfile;
  analytics: SellerAnalytics;
  subscription: UserSubscription;
  recentActivity: ActivityEvent[];
  listings?: any[]; // Listing type from main types
  categories?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
}

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  trend?: number[];
  loading?: boolean;
  description?: string;
  isPercentage?: boolean;
}

export interface QuickActionsProps {
  actions: QuickAction[];
}

export interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}

export interface AnalyticsDashboardProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  data: AnalyticsData;
  loading: boolean;
}

export interface AnalyticsData {
  overview: OverviewMetrics;
  trends: TrendData[];
  listings: ListingAnalytics[];
  geographic: GeographicData[];
  devices: DeviceData[];
  conversions: ConversionData;
}

export interface OverviewMetrics {
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  uniqueVisitors: number;
}

export interface TrendData {
  date: string;
  views: number;
  contacts: number;
  conversions: number;
}

export interface GeographicData {
  city: string;
  views: number;
  contacts: number;
  percentage: number;
}

export interface DeviceData {
  device: string;
  views: number;
  contacts: number;
  percentage: number;
}

export interface ConversionData {
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  conversionsBySource: ConversionBySource[];
}

export interface ConversionBySource {
  source: string;
  conversions: number;
  rate: number;
}

export interface InteractiveChartProps {
  type: "line" | "bar" | "pie" | "area" | "doughnut";
  data: ChartData;
  options: ChartOptions;
  height?: number;
  responsive?: boolean;
  loading?: boolean;
}

export interface PackageDashboardProps {
  currentSubscription: EnhancedUserSubscription;
  availablePackages: SubscriptionPackage[];
  usage: PackageUsage;
  billingHistory: BillingRecord[];
}

export interface UsageProgressProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  warningThreshold?: number;
  showPercentage?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  exportable?: boolean;
  loading?: boolean;
}

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface ExportButtonProps {
  data: any[];
  filename: string;
  format: "csv" | "pdf" | "excel";
  onExport?: () => void;
  disabled?: boolean;
  exportType?: "analytics" | "listings" | "performance" | "general";
  timeRange?: TimeRange;
  includeCharts?: boolean;
}

export interface PerformanceInsightsProps {
  analytics: SellerAnalytics;
  profile: SellerProfile;
  listings: ListingAnalytics[];
  benchmarks: PlatformBenchmarks;
  recommendations: Recommendation[];
}

// Utility Types
export interface TimeRange {
  start: string;
  end: string;
  preset?: "today" | "week" | "month" | "quarter" | "year" | "custom";
}

export interface LoadingState {
  isLoading: boolean;
  error?: ApiError;
  lastUpdated?: string;
  retryCount: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ErrorHandlingStrategy {
  retry: boolean;
  maxRetries: number;
  fallbackData?: any;
  userMessage: string;
}

// Navigation and Layout Types
export interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}
