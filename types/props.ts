// types/props.ts

import { 
  Listing, 
  Category, 
  AdBanner, 
  Seller, 
  ListingAnalytics,
  Review,
  SearchParams
} from '@/types'

/**
 * Props for the ListingCard component
 */
export interface ListingCardProps {
  listing: Listing
  featured?: boolean
}

/**
 * Props for the CategoryCard component
 */
export interface CategoryCardProps {
  category: Category
}

/**
 * Props for the AdBanner component
 */
export interface AdBannerProps {
  ad: AdBanner
  placement: string
}

/**
 * Props for the SellerCard component
 */
export interface SellerCardProps {
  seller: Seller
}

/**
 * Props for the ProductGallery component
 */
export interface ProductGalleryProps {
  images: Listing['images']
}

/**
 * Props for the ProductDetails component
 */
export interface ProductDetailsProps {
  listing: Listing
  analytics: ListingAnalytics
}

/**
 * Props for the SellerProfile component
 */
export interface SellerProfileProps {
  seller: Seller
}

/**
 * Props for the SimilarProducts component
 */
export interface SimilarProductsProps {
  products: Listing[]
}

/**
 * Props for the ReviewCard component
 */
export interface ReviewCardProps {
  review: Review
}

/**
 * Props for the SearchForm component
 */
export interface SearchFormProps {
  initialParams?: SearchParams
  onSearch: (params: SearchParams) => void
}

/**
 * Filter structure for search and listing components
 */
export interface SearchFilters {
  priceRange: [number, number]
  condition: string
  dateRange: string
}

/**
 * Props for the FilterSidebar component
 */
export interface FilterSidebarProps {
  onFilterChange: (filters: SearchFilters) => void
  currentFilters: SearchFilters
}

/**
 * Props for the ProductGrid component
 */
export interface ProductGridProps {
  listings: Listing[]
  loading?: boolean
  onFilterChange?: (filters: SearchFilters) => void
  currentFilters?: SearchFilters
}