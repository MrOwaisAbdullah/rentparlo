// types/index.ts

/**
 * =====================
 * CORE USER TYPES
 * =====================
 */

/**
 * User roles in the platform
 */
export type UserRole = "user" | "seller" | "admin";

/**
 * Language preferences for users
 */
export type UserLanguage = "en" | "ur";

/**
 * Notification preferences for users
 */
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

/**\n * Basic user information (stored in Supabase)\n */
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  last_login?: string;
  is_verified: boolean;
  guest_id: string;
  city?: string;
  state?: string;
  country: string;
  last_location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  active: boolean;
  email_verified: boolean;
  whatsapp_consent?: boolean;
  notification_preferences: NotificationPreferences;
  preferred_language: UserLanguage;
  bio?: string;
  profile_image_url?: string;
  onboarding_completed: boolean; // Add this field
  name?: string; // Add this field
}

/**
 * Seller tier levels
 */
export type SellerTier =
  | "basic"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

/**
 * Seller profile information (stored in Supabase)
 */
export interface SellerProfile {
  id: string; // References user.id
  username: string;
  business_name?: string;
  verification_documents: {
    cnic_front: string | null;
    cnic_back: string | null;
    business_license: string | null;
  };
  owner_cnic?: string;
  address_line1?: string;
  // address_line2?: string; // Removed because it doesn't exist in the database schema
  avatar_url?: string;
  is_verified: boolean;
  is_top_seller: boolean;
  tier: SellerTier;
  tier_points: number;
  tier_last_updated: string;
  verification_status: "pending" | "approved" | "rejected";
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  map_location_url?: string; // New field for location map URL
  listing_count?: number; // Number of listings for this seller
  customer_rating?: number;
  total_reviews?: number;
  description?: string;
}

/**
 * Complete seller information (combining User and SellerProfile)
 */
export interface Seller extends User {
  profile: SellerProfile;
  listingCount?: number; // Add listing count property
}

/**
 * =====================
 * LISTING TYPES
 * =====================
 */

/**
 * Listing condition levels
 */
export type ItemCondition = "new" | "like-new" | "good" | "fair";

/**
 * Listing status
 */
export type ListingStatus = "active" | "pending" | "suspended" | "expired";

/**
 * Specification for a listing
 */
export interface Specification {
  key: string;
  value: string;
}

/**
 * Rental rules for a listing
 */
export type RentalRule = string;

/**
 * Availability information for a listing
 */
export interface Availability {
  isAvailable: boolean;
}

/**
 * Location information for a listing
 */
export interface Location {
  city: string;
  area?: string;
}

/**
 * Listing image
 */
export interface ListingImage {
  asset: {
    url: string;
    metadata?: {
      lqip?: string; // Low quality image placeholder
    };
  };
}

/**
 * Category information
 */
export interface Category {
  _id: string;
  title: string;
  slug: string | { current: string };
  description?: string;
  parent?: {
    _ref: string;
    title: string;
  };
  icon?: {
    asset: {
      url: string;
    };
  };
  order: number;
  popular?: boolean;
  itemCount?: number;
}

/**
 * Listing badge types
 */
export type ListingBadge =
  | "hot"
  | "new"
  | "featured"
  | "verified"
  | "top_seller"
  | "discount"
  | "eco_friendly"
  | "local"
  | "instant_delivery";

/**
 * Listing information (stored in Sanity)
 */
export interface Listing {
  _id: string;
  _type: "listing";
  _createdAt: string;
  title: string;
  slug: {
    current: string;
  };
  description: string; // Changed from any[] to string to match Sanity schema
  priceType: "hourly" | "daily" | "monthly" | "yearly";
  createdAt: string;
  price: number;
  pricePerHour?: number;
  priceWeekly?: number;
  priceMonthly?: number;
  category: {
    _id: string;
    title: string;
    slug: string | { current: string };
  };
  images: ListingImage[];
  location: Location;
  condition: ItemCondition;
  availability: Availability & {
    availableFrom?: string;
  };
  specifications: Specification[];
  rentalRules: RentalRule[];
  status: ListingStatus;
  supabaseId: string; // References seller's Supabase ID
  isFeatured?: boolean;
  featuredPriority?: number;
  created_at: string;
  views?: number;
  contactClicks?: number;
  badges?: ListingBadge[];
  seller?: Seller; // Add seller information for badge calculation
}
/**
 * =====================
 * ANALYTICS TYPES
 * =====================
 */

/**
 * Types of analytics events
 */
export type AnalyticsEventType =
  | "impressions"
  | "listing_click"
  | "view"
  | "contact_click"
  | "WhatsApp_click"
  | "share"
  | "save"
  | "search";

/**
 * Device types for analytics
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Analytics event (stored in Supabase)
 */
export interface AnalyticsEvent {
  id: string;
  listing_id: string; // Sanity listing ID
  event_type: AnalyticsEventType;
  user_id?: string; // Supabase user ID
  guest_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  city?: string;
  device_type?: DeviceType;
  os?: string;
  browser?: string;
  session_id: string;
  created_at: string;
}

/**
 * Analytics data for a listing
 */
export interface ListingAnalytics {
  views: number;
  contactClicks: number;
  whatsappClicks: number;
  impressions: number;
  listingClicks: number;
}

/**
 * Seller analytics data
 */
export interface SellerAnalytics {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContactClicks: number;
  totalWhatsAppClicks: number;
  topListings: {
    _id: string;
    title: string;
    views: number;
    contactClicks: number;
  }[];
  viewsByDay: {
    date: string;
    views: number;
  }[];
}

/**
 * =====================
 * BLOG TYPES
 * =====================
 */

/**
 * Blog post status
 */
export type BlogStatus = "draft" | "published" | "archived";

/**
 * Blog post language
 */
export type BlogLanguage = "en" | "ur" | "both";

/**
 * SEO settings for blog posts
 */
export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  socialImage?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  noIndex?: boolean;
}

/**
 * Blog post image
 */
export interface BlogImage {
  asset: {
    url: string;
    metadata?: {
      lqip?: string; // Low quality image placeholder
    };
  };
  alt: string;
  caption?: string;
}

/**
 * Blog post category reference
 */
export interface BlogCategoryRef {
  _ref: string;
  _type: "reference";
}

/**
 * Blog post reference (for related posts)
 */
export interface BlogPostRef {
  _ref: string;
  _type: "reference";
}

/**
 * Portable text block for blog content
 */
export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style?: string;
  children: Array<{
    _type: "span";
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: any;
  }>;
}

/**
 * Code block in portable text
 */
export interface CodeBlock {
  _type: "code";
  _key: string;
  language?: string;
  code: string;
}

/**
 * Image block in portable text
 */
export interface ImageBlock {
  _type: "image";
  _key: string;
  asset: {
    url: string;
  };
  alt: string;
  caption?: string;
}

/**
 * Blog post content (portable text)
 */
export type BlogContent = Array<PortableTextBlock | CodeBlock | ImageBlock>;

/**
 * Complete blog post from Sanity
 */
export interface BlogPost {
  _id: string;
  _type: "blog";
  _createdAt: string;
  _updatedAt: string;
  title: string;
  titleUrdu?: string;
  slug: {
    current: string;
  };
  excerpt: string;
  excerptUrdu?: string;
  body: BlogContent;
  bodyUrdu?: BlogContent;
  mainImage: BlogImage;
  categories?: BlogCategoryRef[];
  tags?: string[];
  author: string;
  readingTime?: number;
  seo?: BlogSEO;
  relatedPosts?: BlogPostRef[];
  publishedAt: string;
  featured: boolean;
  status: BlogStatus;
  language: BlogLanguage;
}

/**
 * Simplified blog post for listings
 */
export interface BlogPostSummary {
  _id: string;
  title: string;
  titleUrdu?: string;
  slug: {
    current: string;
  };
  excerpt: string;
  excerptUrdu?: string;
  mainImage: BlogImage;
  categories?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  tags?: string[];
  author: string;
  readingTime?: number;
  publishedAt: string;
  featured: boolean;
  language: BlogLanguage;
}

/**
 * Blog category
 */
export interface BlogCategory {
  _id: string;
  _type: "category";
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  color?: string;
  postCount?: number;
}

/**
 * Blog search filters
 */
export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  language?: BlogLanguage;
  featured?: boolean;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Blog search results
 */
export interface BlogSearchResults {
  posts: BlogPostSummary[];
  total: number;
  categories: BlogCategory[];
  tags: string[];
  authors: string[];
  filters: BlogFilters;
}

/**
 * Blog pagination
 */
export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Popular posts for sidebar
 */
export interface PopularPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
    alt: string;
  };
  publishedAt: string;
  readingTime?: number;
  views?: number;
}

/**
 * Newsletter subscription
 */
export interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
  active: boolean;
  preferences?: {
    weekly: boolean;
    monthly: boolean;
    breaking: boolean;
  };
}

/**
 * Review status
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * Review information (stored in Sanity)
 */
export interface Review {
  _id: string;
  _type: "review";
  listing: {
    _ref: string;
    title: string;
  };
  supabaseUserId: string; // References user's Supabase ID
  rating: number;
  title: string;
  comment: string;
  images?: ListingImage[];
  status: ReviewStatus;
}

/**
 * =====================
 * SUBSCRIPTION TYPES
 * =====================
 */

/**
 * Billing cycle for subscriptions
 */
export type BillingCycle = "monthly" | "yearly";

/**
 * Subscription package features
 */
export interface PackageFeatures {
  location_boost: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  featured_listing: boolean;
  listing_priority: number;
}

/**
 * Subscription package (stored in Supabase)
 */
export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  max_listings: number;
  max_featured_listings: number;
  analytics_days: number;
  features: PackageFeatures;
  billing_cycle: BillingCycle;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

/**
 * User subscription status
 */
export type SubscriptionStatus = "active" | "canceled" | "expired" | "pending";

/**
 * Enhanced user subscription with package information
 */
export interface EnhancedUserSubscription extends UserSubscription {
  subscription_packages?: SubscriptionPackage;
}

/**
 * User subscription (stored in Supabase)
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  trial_end?: string;
  cancel_at?: string;
}

/**
 * =====================
 * AFFILIATE TYPES
 * =====================
 */

/**
 * Discount type for affiliate codes
 */
export type DiscountType = "percentage" | "fixed";

/**
 * Affiliate program (stored in Supabase)
 */
export interface AffiliateProgram {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  max_uses?: number;
  current_uses: number;
  created_at: string;
}

/**
 * Affiliate code (stored in Supabase)
 */
export interface AffiliateCode {
  id: string;
  code: string;
  seller_id: string;
  program_id?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_to?: string;
  status: "active" | "expired" | "disabled";
  created_at: string;
  updated_at: string;
}

/**
 * Affiliate referral status
 */
export type ReferralStatus = "pending" | "completed" | "cancelled";

/**
 * Affiliate referral (stored in Supabase)
 */
export interface AffiliateReferral {
  id: string;
  code_id: string;
  referrer_id: string;
  referred_id: string;
  listing_id?: string;
  purchase_amount?: number;
  commission_amount?: number;
  status: ReferralStatus;
  created_at: string;
  completed_at?: string;
}

/**
 * Affiliate statistics for a seller
 */
export interface AffiliateStats {
  totalEarnings: number;
  totalReferrals: number;
  activeCodes: number;
  conversionRate: number;
  totalClicks: number;
}

/**
 * =====================
 * ADVERTISEMENT TYPES
 * =====================
 */

/**
 * Banner placement locations
 */
export type BannerPlacement =
  | "homepage-top"
  | "homepage-middle"
  | "homepage-bottom"
  | "dashboard-top"
  | "dashboard-sidebar"
  | "category-top"
  | "category-sidebar"
  | "category-sidebar-specific"
  | "search-top"
  | "search-sidebar"
  | "listing-top"
  | "listing-sidebar"
  | "profile-top"
  | "profile-sidebar"
  | "blog-top"
  | "blog-sidebar"
  | "content-top"
  | "content-sidebar"
  | "mobile-banner"
  | "mobile-specific"
  | "popup-banner"
  | "seller-profile";

  /**
   * Banner sizes
   */
  export type BannerSize =
    | "large-banner"
    | "leaderboard"
    | "medium-rectangle"
    | "large-rectangle"
    | "half-page"
    | "mobile-banner"
    | "popup"
    | "square"
    | "vertical-rectangle"
    | "skyscraper";

/**
 * Advertisement banner (stored in Sanity)
 */
export interface AdBanner {
  _id: string;
  _type: "adBanner";
  title: string;
  placement: BannerPlacement;
  size: BannerSize;
  image: {
    asset: {
      url: string;
    };
  };
  mobileImage?: {
    asset: {
      url: string;
    };
  };
  targetUrl: string;
  targetLocation?: string;
  targetCategory?: {
    _ref: string;
    title: string;
  };
  targetUserType: "all" | "sellers" | "new-users";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  displayOrder: number;
  clicks: number;
}

/**
 * Banner click tracking (stored in Supabase)
 */
export interface BannerClick {
  id: string;
  banner_id: string; // Sanity document ID
  user_id?: string;
  guest_id?: string;
  location?: string;
  device_type?: DeviceType;
  created_at: string;
}

/**
 * =====================
 * SUPPORT TYPES
 * =====================
 */

/**
 * Support ticket categories
 */
export type TicketCategory =
  | "technical"
  | "billing"
  | "verification"
  | "listing"
  | "other";

/**
 * Support ticket priorities
 */
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/**
 * Support ticket statuses
 */
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

/**
 * Support ticket (stored in Supabase)
 */
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

/**
 * =====================
 * SEARCH TYPES
 * =====================
 */

/**
 * Search parameters for the search API
 */
export interface SearchParams {
  query?: string;
  category?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition | ItemCondition[];
  sort?: "featured" | "price-low" | "price-high" | "newest";
  offset?: number;
  limit?: number;
}

/**
 * Applied search filters
 */
export interface SearchFilters {
  query?: string;
  category?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition | ItemCondition[];
  sort?: "featured" | "price-low" | "price-high" | "newest";
}

/**
 * Search results
 */
export interface SearchResults {
  results: Listing[];
  filters: SearchFilters;
  total: number;
}

/**
 * =====================
 * SELLER TIER TYPES
 * =====================
 */

/**
 * Seller tier history entry
 */
export interface SellerTierHistory {
  id: string;
  seller_id: string;
  old_tier: SellerTier;
  new_tier: SellerTier;
  points_change: number;
  reason?: string;
  admin_id?: string;
  created_at: string;
}

/**
 * =====================
 * UTILITY TYPES
 * =====================
 */

/**
 * API response structure
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

/**
 * Paginated results
 */
export interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * =====================
 * UNIFIED SEARCH TYPES
 * =====================
 */

// Re-export unified search types
export * from "./search";
