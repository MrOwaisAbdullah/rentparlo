# Page Optimization and Caching Setup Design

## 1. Overview

This document outlines the design for optimizing page performance, implementing caching strategies, and ensuring efficient data fetching for the RentParLo.pk platform. The focus is on reducing API calls, improving load times, and ensuring fresh content is displayed without manual cache clearing.

## 2. Objectives

- Optimize page load performance across all key pages (seller profile, category, listing, etc.)
- Implement efficient caching with Redis
- Reduce API calls through smart caching strategies
- Ensure fresh content is displayed without manual cache clearing
- Implement smooth authentication flows (Google login, etc.)
- Create seamless registration and onboarding experience

## 3. Current Architecture Analysis

### 3.1 Technology Stack
- **Frontend**: Next.js 15.5.0 with App Router, React 19.1.0, TypeScript 5+
- **UI Framework**: Tailwind CSS 4, Radix UI, Lucide React
- **Backend**: Supabase for database and authentication, Sanity CMS for content management
- **Data Fetching**: Server Components, API Routes, Sanity GROQ queries
- **Authentication**: Supabase Auth with Google OAuth support
- **Performance**: Skeleton loading, ISR (Incremental Static Regeneration)

### 3.2 Existing Performance Patterns
- Server Components used for data fetching with Suspense boundaries
- Skeleton loading implemented for perceived performance
- Data integration layer with caching key generators
- Performance optimizer with metrics tracking

## 4. Optimization Strategy

### 4.1 Caching Layer Implementation
- Redis caching for frequently accessed data
- In-memory caching for SSR pages
- Client-side caching with SWR/react-query

### 4.2 Data Fetching Optimization
- Server-side data fetching with proper caching headers
- Incremental Static Regeneration (ISR) for public pages
- Dynamic rendering for user-specific content

### 4.3 Authentication Flow Enhancement
- Google OAuth integration with Supabase
- Smooth registration and onboarding flow
- Session management optimization

## 5. Detailed Design

### 5.1 Redis Caching Implementation

#### Cache Structure Design
- **Multi-level caching**: In-memory (Map) → Redis → Database
- **Cache keys**: Standardized key generation using `getCacheKey` utility
- **Data segmentation**: User-specific vs public data
- **Cache tags**: For selective invalidation

#### Cache Invalidation Strategy
- **Time-based invalidation**: TTL configuration per data type
- **Event-driven invalidation**: Supabase webhooks for data changes
- **Selective invalidation**: Tag-based cache clearing
- **Manual invalidation**: Admin tools for cache clearing

**Implementation**:
```typescript
// lib/cache-invalidation.ts

// Event-driven invalidation using Supabase webhooks
export async function handleListingUpdate(listingId: string, categoryId: string) {
  // Invalidate specific listing cache
  const listingKey = getCacheKey.listing(listingId);
  await cacheManager.invalidate([listingKey]);
  
  // Invalidate category cache
  await cacheManager.invalidateTags([`category:${categoryId}`]);
  
  // Invalidate search cache
  await cacheManager.invalidateTags(['search']);
  
  // Invalidate homepage if this was a featured listing
  const listing = await getListingDetail(listingId);
  if (listing.featured) {
    await cacheManager.invalidateTags(['homepage']);
  }
}

// Manual invalidation via admin interface
export async function clearCache(tags: string[]) {
  await cacheManager.invalidateTags(tags);
}

// Scheduled cache warming
export async function warmCache() {
  // Warm homepage cache
  const homepageData = await getHomepageData();
  await cacheManager.set(getCacheKey.homepage(), homepageData, {
    ttl: 300, // 5 minutes
    tags: ['homepage']
  });
  
  // Warm top category caches
  const categories = await getCategories();
  for (const category of categories.slice(0, 5)) { // Top 5 categories
    const listings = await getCategoryListings(category.slug);
    const cacheKey = `category:${category.slug}:listings:1:20`;
    await cacheManager.set(cacheKey, listings, {
      ttl: 600, // 10 minutes
      tags: [`category:${category.slug}`]
    });
  }
  
  // Warm top seller caches
  const topSellers = await getTopSellers(10);
  for (const seller of topSellers) {
    const profile = await getSellerProfile(seller.username);
    const cacheKey = getCacheKey.seller(seller.username);
    await cacheManager.set(cacheKey, profile, {
      ttl: 900, // 15 minutes
      tags: [`seller:${seller.username}`]
    });
  }
}
```

#### TTL Configuration
- **Homepage data**: 5 minutes (300 seconds)
- **Category data**: 10 minutes (600 seconds)
- **Listing details**: 3 minutes (180 seconds)
- **Seller profiles**: 15 minutes (900 seconds)
- **Search results**: 2 minutes (120 seconds)
- **User sessions**: 24 hours (86400 seconds)

#### Cache Utility Implementation

The caching utility will provide a unified interface for cache operations:

```typescript
// lib/cache.ts

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheManager {
  private redis: Redis;
  private inMemory: Map<string, { data: any; expires: number }>;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.inMemory = new Map();
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Check in-memory cache first
    const inMemoryResult = this.getInMemory(key);
    if (inMemoryResult !== undefined) {
      return inMemoryResult;
    }
    
    // Check Redis cache
    const redisResult = await this.redis.get(key);
    if (redisResult) {
      return JSON.parse(redisResult);
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, tags = [] } = options;
    
    // Store in in-memory cache
    this.setInMemory(key, data, ttl);
    
    // Store in Redis with tags
    const payload = JSON.stringify(data);
    await this.redis.setex(key, ttl, payload);
    
    // Store tags for selective invalidation
    if (tags.length > 0) {
      await this.setTags(key, tags);
    }
  }
  
  async invalidateTags(tags: string[]): Promise<void> {
    // Get all keys associated with tags
    const keysToDelete: string[] = [];
    for (const tag of tags) {
      const tagKeys = await this.redis.smembers(`tag:${tag}`);
      keysToDelete.push(...tagKeys);
    }
    
    // Delete all associated keys
    if (keysToDelete.length > 0) {
      await this.redis.del(...keysToDelete);
      
      // Remove from in-memory cache
      for (const key of keysToDelete) {
        this.inMemory.delete(key);
      }
    }
    
    // Remove tag associations
    const tagKeys = tags.map(tag => `tag:${tag}`);
    await this.redis.del(...tagKeys);
  }
  
  private getInMemory<T>(key: string): T | undefined | null {
    const cached = this.inMemory.get(key);
    if (!cached) return null;
    
    if (cached.expires > Date.now()) {
      return cached.data;
    } else {
      this.inMemory.delete(key);
      return undefined; // Expired, force refresh
    }
  }
  
  private setInMemory<T>(key: string, data: T, ttl: number): void {
    this.inMemory.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    });
  }
  
  private async setTags(key: string, tags: string[]): Promise<void> {
    const promises = tags.map(tag => 
      this.redis.sadd(`tag:${tag}`, key)
    );
    await Promise.all(promises);
  }
}

export const cacheManager = new CacheManager();
```

### 5.2 Page-Specific Optimizations

#### Seller Profile Page
- Cache seller profile data with 15-minute TTL
- Cache seller listings with separate TTL (5 minutes)
- Implement cache warming for top sellers
- Use stale-while-revalidate strategy

**Implementation**:
```typescript
// lib/data-integration.ts
export async function getSellerProfile(username: string) {
  const cacheKey = getCacheKey.seller(username);
  
  // Try to get from cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Sanity
  const seller = await sanityClient.fetch(`*[_type == "seller" && username == $username][0]`, { username });
  
  // Cache the result
  await cacheManager.set(cacheKey, seller, { 
    ttl: 900, // 15 minutes
    tags: [`seller:${username}`]
  });
  
  return seller;
}
```

#### Category Page
- Cache category data with 10-minute TTL
- Cache category listings with 5-minute TTL
- Implement pagination caching
- Use cache tags for category-based invalidation

**Implementation**:
```typescript
// lib/data-integration.ts
export async function getCategoryListings(slug: string, page: number = 1, limit: number = 20) {
  const cacheKey = `category:${slug}:listings:${page}:${limit}`;
  
  // Try to get from cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Sanity with pagination
  const listings = await sanityClient.fetch(`*[_type == "listing" && category->slug == $slug][${(page-1)*limit}...${page*limit}]`, { slug });
  
  // Cache the result
  await cacheManager.set(cacheKey, listings, { 
    ttl: 300, // 5 minutes
    tags: [`category:${slug}`]
  });
  
  return listings;
}
```

#### Listing Detail Page
- Cache listing data with 3-minute TTL
- Cache related listings separately
- Implement cache warming for featured listings
- Use ETags for client-side caching

**Implementation**:
```typescript
// lib/data-integration.ts
export async function getListingDetail(slug: string) {
  const cacheKey = getCacheKey.listing(slug);
  
  // Try to get from cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Sanity
  const listing = await sanityClient.fetch(`*[_type == "listing" && slug == $slug][0]`, { slug });
  
  // Cache the result
  await cacheManager.set(cacheKey, listing, { 
    ttl: 180, // 3 minutes
    tags: [`listing:${slug}`]
  });
  
  return listing;
}
```

#### Search Results Page
- Cache search results with 2-minute TTL
- Implement query-based caching
- Use cache tags for search invalidation
- Implement search result pagination caching

**Implementation**:
```typescript
// lib/data-integration.ts
export async function getSearchResults(params: SearchParams) {
  const cacheKey = getCacheKey.search(params);
  
  // Try to get from cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Build GROQ query based on params
  let query = '*[_type == "listing" && status == "active"';
  const queryParams: Record<string, any> = {};
  
  if (params.query) {
    query += ' && (title match $query || description match $query)';
    queryParams.query = `*${params.query}*`;
  }
  
  if (params.category) {
    query += ' && category->slug == $category';
    queryParams.category = params.category;
  }
  
  query += ']'
  
  // Add sorting and pagination
  query += `[${(params.page || 0) * (params.limit || 20)}...${((params.page || 0) + 1) * (params.limit || 20)}]`;
  
  // Fetch from Sanity
  const results = await sanityClient.fetch(query, queryParams);
  
  // Cache the result
  await cacheManager.set(cacheKey, results, { 
    ttl: 120, // 2 minutes
    tags: ['search']
  });
  
  return results;
}
```

### 5.3 Authentication System

#### Google Login Integration
- Implement Supabase Google OAuth with proper callbacks
- Handle new user registration flow
- Create user profiles in Supabase on first login
- Redirect to onboarding for new users

**Implementation**:
```typescript
// lib/auth-actions.ts
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // For OAuth, the redirect is handled by Supabase
    return {
      success: true
    };

  } catch (error) {
    console.error('Google OAuth error:', error);
    return {
      success: false,
      error: 'Failed to sign in with Google'
    };
  }
}
```

#### Registration Flow Optimization
- Multi-step registration form with validation
- Server actions for form submission
- Rate limiting for registration attempts
- Email verification flow

**Implementation**:
```typescript
// app/auth/actions.ts
export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    // Rate limiting
    const clientIP = await getClientIP();
    if (!signupRateLimit(clientIP)) {
      return {
        success: false,
        error: 'Too many registration attempts. Please try again in 15 minutes.'
      };
    }

    // Extract and sanitize form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      role: formData.get('role') as string
    };

    const sanitizedData = sanitizeFormData(rawData);

    // Validate with Zod schema
    const validationResult = registrationSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      return {
        success: false,
        fieldErrors: validationResult.error.flatten().fieldErrors
      };
    }

    const supabase = await createClient();
    
    // Create user in auth.users
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: sanitizedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          name: sanitizedData.name
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Create user profile in public.users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: sanitizedData.email,
          name: sanitizedData.name,
          phone: sanitizedData.phone,
          role: sanitizedData.role,
          city: sanitizedData.city,
          country: 'Pakistan',
          is_verified: false,
          active: true,
          onboarding_completed: false,
          notification_preferences: {
            email: true,
            sms: false,
            push: true
          },
          privacy_settings: {
            profile_visible: true,
            contact_info_visible: false
          },
          preferred_language: 'en',
          timezone: 'Asia/Karachi',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the registration, just log the error
      }
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}
```

#### Onboarding Experience Enhancement
- Role-based onboarding steps
- Progressive profile completion
- Welcome flow for Google OAuth users
- Skip onboarding option for quick start

**Implementation**:
```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check if this is a new user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarding_completed')
          .eq('id', user.id)
          .single();
          
        let needsOnboarding = false;
          
        if (!existingUser) {
          // Create user profile for new OAuth user
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name,
              profile_image_url: user.user_metadata?.avatar_url,
              role: 'user',
              country: 'Pakistan',
              is_verified: false,
              email_verified: user.email_confirmed_at ? true : false,
              phone_verified: false,
              active: true,
              onboarding_completed: false,
              notification_preferences: {
                email: true,
                sms: false,
                push: true
              },
              privacy_settings: {
                profile_visible: true,
                contact_info_visible: false
              },
              preferred_language: 'en',
              timezone: 'Asia/Karachi',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (!profileError) {
            needsOnboarding = true;
          }
        } else {
          // Existing user - check if they need onboarding
          needsOnboarding = !existingUser.onboarding_completed;
        }
        
        // Update login info
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            login_count: supabase.sql`login_count + 1`
          })
          .eq('id', user.id);

        // Determine redirect path
        let redirectTo = next;

        if (type === 'signup' || needsOnboarding) {
          // New users or users who haven't completed onboarding go to welcome page
          redirectTo = '/auth/welcome';
        }

        return redirect(redirectTo);
      }
    }
  }

  // No code parameter, redirect to error
  return redirect('/auth/error?message=Invalid%20callback');
}
```

## 6. Implementation Plan

### 6.1 Phase 1: Infrastructure Setup

#### Redis Setup and Configuration
1. **Redis Cloud Setup**:
   - Create Redis instance on Redis Labs or AWS ElastiCache
   - Configure security groups and access controls
   - Set up connection pooling

2. **Environment Variables**:
   - `REDIS_URL`: Redis connection string
   - `REDIS_TOKEN`: Authentication token (if required)
   - `CACHE_TTL_DEFAULT`: Default cache TTL in seconds (300)
   - `CACHE_TTL_HOMEPAGE`: Homepage cache TTL (300)
   - `CACHE_TTL_LISTING`: Listing cache TTL (180)
   - `CACHE_TTL_SELLER`: Seller cache TTL (900)
   - `CACHE_TTL_CATEGORY`: Category cache TTL (600)
   - `CACHE_TTL_SEARCH`: Search results cache TTL (120)
   - `CACHE_WARMING_ENABLED`: Enable/disable cache warming (true/false)
   - `CACHE_WARMING_INTERVAL`: Cache warming interval in minutes (60)

**.env.example file**:
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=

# Cache TTL Configuration
CACHE_TTL_DEFAULT=300
CACHE_TTL_HOMEPAGE=300
CACHE_TTL_LISTING=180
CACHE_TTL_SELLER=900
CACHE_TTL_CATEGORY=600
CACHE_TTL_SEARCH=120

# Cache Warming
CACHE_WARMING_ENABLED=true
CACHE_WARMING_INTERVAL=60

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-14

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Caching Utility Development**:
   - Implement Redis client wrapper
   - Create cache key generators
   - Implement cache-aside pattern
   - Add cache metrics tracking

**Implementation**:
```typescript
// lib/cache-warming.ts

// Scheduled cache warming function
export async function scheduleCacheWarming() {
  if (process.env.CACHE_WARMING_ENABLED !== 'true') {
    return;
  }
  
  // Run cache warming immediately
  await warmCache();
  
  // Schedule periodic cache warming
  const interval = parseInt(process.env.CACHE_WARMING_INTERVAL || '60') * 60 * 1000;
  setInterval(async () => {
    try {
      await warmCache();
      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }, interval);
}

// API endpoint for manual cache warming
export async function handleCacheWarmingRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CACHE_WARMING_TOKEN}`;
  
  if (authHeader !== expectedToken) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    await warmCache();
    return new Response('Cache warming completed', { status: 200 });
  } catch (error) {
    return new Response(`Cache warming failed: ${error}`, { status: 500 });
  }
}
```

### 6.2 Phase 2: Page Optimizations

#### Implementation Steps:
1. **Homepage Optimization**:
   - Implement Redis caching for homepage data
   - Add cache warming for featured listings
   - Optimize image loading with lazy loading
   - Implement skeleton loading states

2. **Category Page Optimization**:
   - Cache category data with tag-based invalidation
   - Implement pagination caching
   - Optimize category card loading

3. **Listing Detail Page Optimization**:
   - Cache listing data with short TTL
   - Implement related listings caching
   - Optimize image gallery loading

4. **Search Results Optimization**:
   - Implement query-based caching
   - Add search result pagination caching
   - Optimize filter application

5. **Seller Profile Optimization**:
   - Cache seller data with longer TTL
   - Implement seller listings caching
   - Optimize analytics data loading

#### Performance Testing and Optimization:
- Load testing with artillery/k6
- Cache hit/miss ratio monitoring
- API call reduction measurement
- Page load time improvements tracking

### 6.3 Phase 3: Authentication Enhancement

#### Google OAuth Implementation:
1. Configure Supabase Google OAuth settings
2. Implement OAuth callback handling
3. Create user profiles for new OAuth users
4. Redirect to onboarding for new users

#### Registration and Onboarding Flow Improvements:
1. Implement multi-step registration form
2. Add server actions for form submission
3. Create welcome flow for Google OAuth users
4. Implement profile completion tracking
5. Add skip onboarding option

## 7. Testing Strategy

### 7.1 Performance Testing

#### Load Time Measurements
- **Tools**: Lighthouse, WebPageTest, Pingdom
- **Metrics**: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Time to Interactive (TTI)
- **Targets**: Homepage < 1.5s, Listing page < 2s, Search results < 1s

#### API Call Reduction Verification
- **Tools**: Chrome DevTools Network tab, Supabase logs
- **Metrics**: Number of API calls per page load, Data transferred
- **Targets**: 50% reduction in API calls after caching implementation

#### Cache Hit/Miss Ratio Analysis
- **Tools**: Redis monitoring, Custom cache metrics
- **Metrics**: Cache hit ratio, Average response time improvement
- **Targets**: >80% cache hit ratio for public pages

### 7.2 Functional Testing

#### Data Consistency Verification
- **Test Cases**: Verify cached data matches database data
- **Tools**: Jest, Supabase testing utilities
- **Approach**: Compare cached responses with direct database queries

#### Cache Invalidation Testing
- **Test Cases**: Verify cache is properly invalidated on data changes
- **Tools**: Jest, Mock Redis
- **Approach**: Update data and verify cache is invalidated

#### Authentication Flow Testing
- **Test Cases**: Google OAuth login, Registration, Onboarding
- **Tools**: Playwright, Jest
- **Approach**: End-to-end testing of authentication flows

## 8. Monitoring and Maintenance

### 8.1 Performance Monitoring

#### Key Metrics Tracking:
- Page load times (server-side and client-side)
- Cache hit/miss ratios
- API call reduction percentages
- User engagement metrics
- Error rates and fallback usage

**Implementation**:
```typescript
// lib/cache-metrics.ts

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRatio: number;
  averageResponseTime: number;
}

class CacheMetricsTracker {
  private metrics: Map<string, CacheMetrics> = new Map();
  
  recordHit(cacheType: string): void {
    const metrics = this.getMetrics(cacheType);
    metrics.hits++;
    metrics.totalRequests++;
    metrics.hitRatio = metrics.hits / metrics.totalRequests;
  }
  
  recordMiss(cacheType: string): void {
    const metrics = this.getMetrics(cacheType);
    metrics.misses++;
    metrics.totalRequests++;
    metrics.hitRatio = metrics.hits / metrics.totalRequests;
  }
  
  recordResponseTime(cacheType: string, time: number): void {
    const metrics = this.getMetrics(cacheType);
    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + time) / metrics.totalRequests;
  }
  
  private getMetrics(cacheType: string): CacheMetrics {
    if (!this.metrics.has(cacheType)) {
      this.metrics.set(cacheType, {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRatio: 0,
        averageResponseTime: 0
      });
    }
    return this.metrics.get(cacheType)!;
  }
  
  getMetricsReport(): Record<string, CacheMetrics> {
    const report: Record<string, CacheMetrics> = {};
    for (const [key, value] of this.metrics.entries()) {
      report[key] = { ...value };
    }
    return report;
  }
  
  resetMetrics(): void {
    this.metrics.clear();
  }
}

export const cacheMetrics = new CacheMetricsTracker();
```

#### Alerting Mechanisms:
- Cache failure alerts
- Performance degradation notifications
- High latency warnings
- Memory usage thresholds

#### Regular Performance Audits:
- Weekly performance reports
- Monthly optimization reviews
- Quarterly architecture assessments
- Annual technology stack evaluation

### 8.2 Cache Management

#### Cache Invalidation Procedures:
- Automatic TTL-based expiration
- Event-driven invalidation on data changes
- Manual cache clearing via admin interface
- Selective invalidation using cache tags

#### Memory Usage Monitoring:
- Redis memory usage tracking
- Cache size monitoring
- Eviction policy analysis
- Performance impact assessment

#### Optimization Recommendations:
- Regular cache pattern analysis
- TTL adjustment based on usage patterns
- Cache warming strategy improvements
- Data segmentation optimizations