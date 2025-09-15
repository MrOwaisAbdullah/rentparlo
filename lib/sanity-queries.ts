/**
 * =====================================================
 * RentParlo.pk Sanity GROQ Queries
 * =====================================================
 * Comprehensive collection of GROQ queries for fetching data from Sanity CMS
 */

import { client, sanityWriteClient } from './sanity'
import { Listing, Category, BlogPost, Review, AdBanner } from '@/types'

/**
 * =====================================================
 * CATEGORY QUERIES
 * =====================================================
 */

// Get all categories ordered by priority
export const CATEGORIES_QUERY = `
  *[_type == "category"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    parent->{
      _id,
      title,
      slug
    },
    icon{
      asset->{
        url
      }
    },
    order
  }
`

// Get category by slug with listings count
export const CATEGORY_BY_SLUG_QUERY = `
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    parent->{
      _id,
      title,
      slug
    },
    icon{
      asset->{
        url
      }
    },
    order,
    "listingCount": count(*[_type == "listing" && category._ref == ^._id && status == "active"])
  }
`

// Get popular categories with listing counts
export const POPULAR_CATEGORIES_QUERY = `
  *[_type == "category"] {
    _id,
    title,
    slug,
    description,
    icon{
      asset->{
        url
      }
    },
    order,
    "listingCount": count(*[_type == "listing" && category._ref == ^._id && status == "active"])
  } | order(listingCount desc)[0...8]
`

/**
 * =====================================================
 * LISTING QUERIES
 * =====================================================
 */

// Get all active listings with full details
export const LISTINGS_QUERY = `
  *[_type == "listing" && status == "active" && published == true] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    priceWeekly,
    priceMonthly,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    availability,
    specifications,
    rentalRules,
    status,
    supabaseId,
    isFeatured,
    isVerified,
    published,
    seo,
    tags
  }
`

// Get listing by ID with full details
export const LISTING_BY_ID_QUERY = `
  *[_type == "listing" && _id == $id][0] {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    priceWeekly,
    priceMonthly,
    priceType,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    availability,
    specifications,
    tags,
    rentalRules,
    badges,
    seo,
    status,
    published,
    isFeatured,
    isVerified,
    supabaseId,
    createdAt,
    _updatedAt
  }
`

// Get listing by slug with full details
export const LISTING_BY_SLUG_QUERY = `
  *[_type == "listing" && slug.current == $slug && (status == "active" || (status == "pending" && supabaseId == $userId))][0] {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    priceWeekly,
    priceMonthly,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    specifications,
    tags,
    rentalRules,
    badges,
    seo,
    status,
    published,
    isFeatured,
    isVerified,
    supabaseId,
    "seller": seller->{
      _id,
      name,
      email,
      phone,
      image {
        asset->{
          url
        }
      },
      seller_profiles {
        business_name,
        address_line1,
        city,
        phone,
        is_verified,
        verification_status,
        is_top_seller
      }
    }
  }
`

// Get featured listings
export const FEATURED_LISTINGS_QUERY = `
  *[_type == "listing" && status == "active" && published == true && isFeatured == true] | order(_createdAt desc) [0...12] {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      },
    },
    location,
    condition,
    supabaseId,
    isFeatured,
    isVerified
  }
`

// Get listings by category
export const LISTINGS_BY_CATEGORY_QUERY = `
  *[_type == "listing" && category._ref == $categoryId && status == "active" && published == true] | order(isFeatured desc, _createdAt desc) {
    _id,
    _type,
    title,
    slug,
    description,
    priceType,
    _createdAt,
    price,
    pricePerHour,
    priceWeekly,
    priceMonthly,
    category->{
      _ref,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    availability,
    specifications,
    rentalRules,
    status,
    supabaseId,
    isFeatured,
    featuredPriority,
    created_at,
    views,
    contactClicks
  }
`

// Get listings by Supabase user ID (seller's listings)
export const LISTINGS_BY_SELLER_QUERY = `
  *[_type == "listing" && supabaseId == $sellerId && status == "active" && published == true] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    supabaseId,
    isFeatured,
    isVerified,
    status
  }
`

// Search listings with filters
export const SEARCH_LISTINGS_QUERY = `
  *[_type == "listing" && status == "active" && published == true 
    && ($searchQuery == "" || title match $searchQuery + "*" || description[].children[].text match $searchQuery + "*")
    && ($category == "" || category._ref == $category)
    && ($city == "" || location.city == $city)
    && ($area == "" || location.area == $area)
    && ($condition == "" || condition == $condition)
    && ($minPrice == 0 || price >= $minPrice)
    && ($maxPrice == 0 || price <= $maxPrice)
  ] | order(
    isFeatured desc,
    _createdAt desc
  ) [$offset...$offset + $limit] {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    pricePerHour,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    isFeatured,
    "seller": seller->{
      _id,
      name,
      image {
        asset->{
          url
        }
      }
    }
  }
`

// Get listings by seller ID
export const SELLER_LISTINGS_QUERY = `
  *[_type == "listing" && supabaseId == $sellerId] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    description,
    price,
    priceType,
    status,
    images[]{
      asset->{
        url
      }
    },
    isFeatured
  }
`

// Search listings count query (for pagination)
export const SEARCH_LISTINGS_COUNT_QUERY = `
  count(*[_type == "listing" && status == "active" && published == true 
    && ($searchQuery == "" || title match $searchQuery + "*" || description[].children[].text match $searchQuery + "*")
    && ($category == "" || category._ref == $category)
    && ($city == "" || location.city == $city)
    && ($area == "" || location.area == $area)
    && ($condition == "" || condition == $condition)
    && ($minPrice == 0 || price >= $minPrice)
    && ($maxPrice == 0 || price <= $maxPrice)
  ])
`

// Get similar listings (same category, different listing)
export const SIMILAR_LISTINGS_QUERY = `
  *[_type == "listing" && category._ref == $categoryId && _id != $listingId && status == "active" && published == true] | order(isFeatured desc, _createdAt desc) [0...6] {
    _id,
    _type,
    title,
    slug,
    description,
    price,
    priceType,
    pricePerHour,
    priceWeekly,
    priceMonthly,
    category->{
      _id,
      title,
      slug
    },
    images[]{
      asset->{
        url,
        metadata {
          lqip
        }
      }
    },
    location,
    condition,
    availability,
    specifications,
    rentalRules,
    status,
    supabaseId,
    isFeatured,
    featuredPriority,
    _createdAt,
    created_at,
    views,
    contactClicks
  }
`

/**
 * =====================================================
 * BLOG QUERIES
 * =====================================================
 */

// Get all published blog posts
export const BLOG_POSTS_QUERY = `
  *[_type == "blog" && status == "published"] | order(publishedAt desc) {
    _id,
    _createdAt,
    title,
    titleUrdu,
    slug,
    excerpt,
    excerptUrdu,
    mainImage{
      asset->{
        url,
        metadata {
          lqip
        }
      },
      alt
    },
    categories[]->{
      _id,
      title,
      slug
    },
    tags,
    author,
    readingTime,
    publishedAt,
    featured,
    language
  }
`

// Get blog post by slug
export const BLOG_POST_BY_SLUG_QUERY = `
  *[_type == "blog" && slug.current == $slug && status == "published"][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    titleUrdu,
    slug,
    excerpt,
    excerptUrdu,
    body,
    bodyUrdu,
    mainImage{
      asset->{
        url,
        metadata {
          lqip
        }
      },
      alt,
      caption
    },
    categories[]->{
      _id,
      title,
      slug
    },
    tags,
    author,
    readingTime,
    seo,
    relatedPosts[]->{
      _id,
      title,
      slug,
      excerpt,
      mainImage{
        asset->{
          url
        }
      },
      publishedAt
    },
    publishedAt,
    featured,
    language
  }
`

// Get featured blog posts
export const FEATURED_BLOG_POSTS_QUERY = `
  *[_type == "blog" && status == "published" && featured == true] | order(publishedAt desc) [0...6] {
    _id,
    title,
    titleUrdu,
    slug,
    excerpt,
    excerptUrdu,
    mainImage{
      asset->{
        url,
        metadata {
          lqip
        }
      },
      alt
    },
    author,
    readingTime,
    publishedAt,
    language
  }
`

// Get recent blog posts
export const RECENT_BLOG_POSTS_QUERY = `
  *[_type == "blog" && status == "published"] | order(publishedAt desc) [0...5] {
    _id,
    title,
    titleUrdu,
    slug,
    excerpt,
    mainImage{
      asset->{
        url
      }
    },
    publishedAt,
    readingTime
  }
`

/**
 * =====================================================
 * BANNER QUERIES
 * =====================================================
 */

// Get active homepage banners
export const HOMEPAGE_BANNERS_QUERY = `
  *[_type == "banner" && active == true] | order(order asc) {
    _id,
    title,
    titleUrdu,
    subtitle,
    subtitleUrdu,
    image{
      asset->{
        url
      }
    },
    mobileImage{
      asset->{
        url
      }
    },
    link,
    order,
    active
  }
`

/**
 * =====================================================
 * REVIEW QUERIES
 * =====================================================
 */

// Get reviews for a specific listing
export const LISTING_REVIEWS_QUERY = `
  *[_type == "review" && listing._ref == $listingId && status == "approved"] | order(_createdAt desc) {
    _id,
    _createdAt,
    rating,
    title,
    comment,
    images[]{
      asset->{
        url
      }
    },
    supabaseUserId
  }
`

// Get recent reviews (for homepage or testimonials)
export const RECENT_REVIEWS_QUERY = `
  *[_type == "review" && status == "approved"] | order(_createdAt desc) [0...6] {
    _id,
    _createdAt,
    rating,
    title,
    comment,
    listing->{
      _id,
      title,
      slug,
      images[0]{
        asset->{
          url
        }
      }
    },
    supabaseUserId
  }
`

/**
 * =====================================================
 * AD BANNER QUERIES
 * =====================================================
 */

// Get ad banners by placement
export const AD_BANNERS_BY_PLACEMENT_QUERY = `
  *[_type == "adBanner" && placement == $placement && isActive == true && 
    dateTime(startDate) <= dateTime(now()) && 
    (endDate == null || dateTime(endDate) >= dateTime(now()))
  ] | order(displayOrder asc) {
    _id,
    title,
    placement,
    size,
    image{
      asset->{
        url
      }
    },
    mobileImage{
      asset->{
        url
      }
    },
    targetUrl,
    targetLocation,
    targetCategory->{
      _id,
      title
    },
    targetUserType
  }
`

/**
 * =====================================================
 * UTILITY FUNCTIONS
 * =====================================================
 */

// Helper function to fetch categories
export async function getCategories(): Promise<Category[]> {
  return await client.fetch(CATEGORIES_QUERY)
}

// Helper function to fetch featured listings
export async function getFeaturedListings(): Promise<Listing[]> {
  return await client.fetch(FEATURED_LISTINGS_QUERY)
}

// Helper function to fetch listing by ID
export async function getListingById(id: string): Promise<Listing | null> {
  return await client.fetch(LISTING_BY_ID_QUERY, { id })
}

// Helper function to fetch listing by slug
export async function getListingBySlug(slug: string, userId?: string): Promise<Listing | null> {
  return await client.fetch(LISTING_BY_SLUG_QUERY, { slug, userId })
}

// Helper function to fetch listings by category
export async function getListingsByCategory(categoryId: string): Promise<Listing[]> {
  return await client.fetch(LISTINGS_BY_CATEGORY_QUERY, { categoryId })
}

// Helper function to search listings
export async function searchListings(params: {
  query?: string
  category?: string
  city?: string
  area?: string
  condition?: string | string[]
  minPrice?: number
  maxPrice?: number
  offset?: number
  limit?: number
  sellerId?: string
}): Promise<Listing[]> {
  const {
    query: searchQuery = '',
    category = '',
    city = '',
    area = '',
    condition: conditionParam = '',
    minPrice = 0,
    maxPrice = 0,
    offset = 0,
    limit = 20,
    sellerId = ''
  } = params

  // Handle condition parameter - ensure it's never null
  const condition = conditionParam ?? '';

  // If sellerId is provided, use a different query
  if (sellerId) {
    const query = `*[_type == "listing" && supabaseId == $sellerId] | order(_createdAt desc) {
        _id,
        _createdAt,
        title,
        slug,
        description,
        price,
        priceType,
        status,
        images[]{
          asset->{
            url
          }
        },
        isFeatured
      }`;
    const queryParams = { sellerId };
    return await client.fetch(query, queryParams);
  }

  // Handle condition parameter - if it's an array or comma-separated string, make multiple queries
  if (Array.isArray(condition) || (typeof condition === 'string' && condition.includes(','))) {
    const conditions = Array.isArray(condition) 
      ? condition 
      : condition.split(',').filter(Boolean);
    
    // Make separate queries for each condition and combine results
    const allResults: Listing[] = [];
    const uniqueListings = new Map<string, Listing>();
    
    for (const cond of conditions) {
      const queryParams = {
        searchQuery,
        category,
        city,
        area,
        condition: cond.trim(),
        minPrice,
        maxPrice,
        offset: 0, // We'll handle pagination after combining
        limit: offset + limit // Get enough results to handle pagination
      };
      
      const results = await client.fetch(SEARCH_LISTINGS_QUERY, queryParams);
      // Add to unique listings map to avoid duplicates
      results.forEach(listing => {
        uniqueListings.set(listing._id, listing);
      });
    }
    
    // Convert map back to array and apply pagination
    const combinedResults = Array.from(uniqueListings.values());
    
    // Sort by featured and creation date (same as original query)
    combinedResults.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
    });
    
    // Apply pagination
    return combinedResults.slice(offset, offset + limit);
  } else {
    // Single condition case - use original query
    const queryParams = {
      searchQuery,
      category,
      city,
      area,
      condition: Array.isArray(condition) ? condition[0] : condition,
      minPrice,
      maxPrice,
      offset,
      limit
    };
    
    return await client.fetch(SEARCH_LISTINGS_QUERY, queryParams);
  }
}

// Helper function to get count of search results
export async function searchListingsCount(params: {
  query?: string
  category?: string
  city?: string
  area?: string
  condition?: string | string[]
  minPrice?: number
  maxPrice?: number
}): Promise<number> {
  const {
    query: searchQuery = '',
    category = '',
    city = '',
    area = '',
    condition: conditionParam = '',
    minPrice = 0,
    maxPrice = 0
  } = params

  // Handle condition parameter - ensure it's never null
  const condition = conditionParam ?? '';

  // Handle condition parameter - if it's an array or comma-separated string, make multiple queries
  if (Array.isArray(condition) || (typeof condition === 'string' && condition.includes(','))) {
    const conditions = Array.isArray(condition) 
      ? condition 
      : condition.split(',').filter(Boolean);
    
    // Make separate queries for each condition and count unique results
    const uniqueListingIds = new Set<string>();
    
    for (const cond of conditions) {
      const queryParams = {
        searchQuery,
        category,
        city,
        area,
        condition: cond.trim(),
        minPrice,
        maxPrice
      };
      
      // Get actual listings to count unique ones
      const listings = await client.fetch(SEARCH_LISTINGS_QUERY, {
        ...queryParams,
        offset: 0,
        limit: 1000 // Get a reasonable number of listings to count
      });
      
      // Add listing IDs to set to ensure uniqueness
      listings.forEach(listing => uniqueListingIds.add(listing._id));
    }
    
    return uniqueListingIds.size;
  } else {
    // Single condition case - use original query
    const queryParams = {
      searchQuery,
      category,
      city,
      area,
      condition: Array.isArray(condition) ? condition[0] : condition,
      minPrice,
      maxPrice
    };
    
    return await client.fetch(SEARCH_LISTINGS_COUNT_QUERY, queryParams);
  }
}

// Helper function to fetch blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  return await client.fetch(BLOG_POSTS_QUERY)
}

// Helper function to fetch blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return await client.fetch(BLOG_POST_BY_SLUG_QUERY, { slug })
}

// Helper function to fetch homepage banners
export async function getHomepageBanners() {
  return await client.fetch(HOMEPAGE_BANNERS_QUERY)
}

// Helper function to fetch reviews for a listing
export async function getListingReviews(listingId: string): Promise<Review[]> {
  return await client.fetch(LISTING_REVIEWS_QUERY, { listingId })
}

// Helper function to fetch similar listings
export async function getSimilarListings(listingId: string, categoryTitle: string, limit: number = 4): Promise<Listing[]> {
  // First we need to get the category ID from the title
  const category = await client.fetch(`*[_type == "category" && title == $categoryTitle][0]`, { categoryTitle });
  if (!category) return [];
  
  return await client.fetch(SIMILAR_LISTINGS_QUERY, { 
    categoryId: category._id, 
    listingId 
  });
}

// Helper function to fetch category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return await client.fetch(CATEGORY_BY_SLUG_QUERY, { slug })
}

// Helper function to fetch ad banners by placement
export async function getAdBannersByPlacement(placement: string) {
  return await client.fetch(AD_BANNERS_BY_PLACEMENT_QUERY, { placement })
}

/**
 * =====================================================
 * CONTENT CREATION HELPERS
 * =====================================================
 */

// Helper function to create a new listing
export async function createListing(listingData: any) {
  return await sanityWriteClient.create({
    _type: 'listing',
    ...listingData
  })
}

// Helper function to create a review
export async function createReview(reviewData: any) {
  return await sanityWriteClient.create({
    _type: 'review',
    ...reviewData
  })
}

// Helper function to update listing
export async function updateListing(listingId: string, updates: any) {
  return await sanityWriteClient
    .patch(listingId)
    .set(updates)
    .commit()
}

// Helper function to delete listing
export async function deleteListing(listingId: string) {
  return await sanityWriteClient.delete(listingId)
}

/**
 * =====================================================
 * SEO AND SITEMAP HELPERS
 * =====================================================
 */

// Get all listing slugs for sitemap generation
export const ALL_LISTING_SLUGS_QUERY = `
  *[_type == "listing" && status == "active" && published == true] {
    "slug": slug.current,
    _updatedAt
  }
`

// Get all blog post slugs for sitemap generation
export const ALL_BLOG_SLUGS_QUERY = `
  *[_type == "blog" && status == "published"] {
    "slug": slug.current,
    _updatedAt
  }
`

// Get all category slugs for sitemap generation
export const ALL_CATEGORY_SLUGS_QUERY = `
  *[_type == "category"] {
    "slug": slug.current,
    _updatedAt
  }
`

// Helper functions for sitemap generation
export async function getAllListingSlugs() {
  return await client.fetch(ALL_LISTING_SLUGS_QUERY)
}

export async function getAllBlogSlugs() {
  return await client.fetch(ALL_BLOG_SLUGS_QUERY)
}

export async function getAllCategorySlugs() {
  return await client.fetch(ALL_CATEGORY_SLUGS_QUERY)
}

// Helper function to fetch listings by seller ID
export async function getListingsBySeller(sellerId: string): Promise<Listing[]> {
    const query = `*[_type == "listing" && supabaseId == $sellerId] | order(_createdAt desc) {
        _id,
        title,
        slug,
        price,
        priceType,
        status,
        badges,
        "imageUrl": images[0].asset->url
    }`;
    const params = { sellerId };
    const listings = await client.fetch(query, params);
    return listings;
}