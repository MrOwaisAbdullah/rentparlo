# QWEN CLI AGENT DEVELOPMENT GUIDE

## Table of Contents
- [Introduction](#introduction)
- [Core Principles](#core-principles)
- [Development Process Guidelines](#development-process-guidelines)
  - [Understanding Requirements](#understanding-requirements)
  - [Database Design](#database-design)
  - [UI/UX Implementation](#uiux-implementation)
  - [TypeScript Typing](#typescript-typing)
  - [Performance Optimization](#performance-optimization)
  - [Testing & Quality Assurance](#testing--quality-assurance)
- [Communication Style Guidelines](#communication-style-guidelines)
- [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
- [Best Practices Reference](#best-practices-reference)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Appendix: Pakistan-Specific Development Considerations](#appendix-pakistan-specific-development-considerations)

## Introduction

This guide defines how the Qwen CLI agent should operate when assisting with development tasks for the RentParlo.pk platform. The agent is a specialized development assistant that understands the specific requirements, constraints, and patterns of this project.

Unlike general-purpose coding assistants, the Qwen CLI agent for RentParlo.pk must:
- Understand the project's unique architecture (Next.js, TypeScript, Tailwind, shadcn/ui, Supabase, Sanity)
- Adhere to Pakistan-specific development considerations
- Prioritize performance for low-bandwidth connections
- Maintain strict type consistency throughout the application
- Follow the established component architecture and design patterns

This document serves as the operational manual for the Qwen CLI agent, ensuring consistent, high-quality assistance throughout the development lifecycle.

## Core Principles

### 1. Pakistan-First Development Mindset
- Always consider Pakistan's internet infrastructure (3G/4G connections)
- Prioritize Urdu language support where relevant
- Respect cultural context in UI/UX decisions
- Account for Pakistan's city/neighborhood structure
- Validate CNIC format (XXXXX-XXXXXXX-X) in all relevant contexts

### 2. Performance-First Approach
- Optimize for 3G connection speeds (300ms+ latency)
- Minimize JavaScript bundle size
- Implement proper image optimization
- Use skeleton loading states for perceived performance
- Avoid unnecessary re-renders

### 3. Type Safety & Consistency
- Maintain strict TypeScript typing throughout
- Ensure all types are defined in the central type system
- Validate type compatibility across system boundaries
- Avoid `any` or implicit `any` in type definitions
- Use Zod for runtime validation where appropriate

### 4. Component Architecture Adherence
- Follow the established component structure
- Maintain separation of concerns (layout, sections, category, listing, etc.)
- Respect the UI component library specifications
- Avoid creating new component categories without justification
- Implement proper responsive behavior for all components

### 5. Data Flow Integrity
- Maintain clear separation between Sanity (content) and Supabase (data)
- Respect RLS policies in all data access patterns
- Implement proper error handling for data fetching
- Use appropriate caching strategies
- Maintain proper schema relationships

## Development Process Guidelines

# BEFORE START BUILDING ANYTHING CHECK THE /COMPONENTS AND /UI FOR REUSABLE COMPONENTS AND USE THEM, DONT CHANGE THE COMPONENTS, YOU CAN JUST ADD SOMETHING WITHOUT BREAKING PREVIOUS DESIGN AND FUNCTIONALITY. 

### Understanding Requirements

#### What to Do
- **Parse requirements thoroughly**: Break down complex requirements into atomic tasks
- **Identify dependencies**: Note which components/features depend on others
- **Validate against existing architecture**: Check if requirements fit the established patterns
- **Ask clarifying questions**: When requirements are ambiguous, identify specific gaps
- **Provide implementation options**: Offer 2-3 viable approaches with pros/cons

#### What to Avoid
- Making assumptions about unstated requirements
- Overcomplicating solutions for simple requirements
- Ignoring performance implications
- Suggesting approaches that violate architectural constraints
- Providing single-option solutions without context

#### Best Practices
```markdown
When presented with a requirement:

1. **Restate the requirement** in your own words to confirm understanding
2. **Identify the affected components** in the architecture
3. **Consider performance implications** for Pakistan's network conditions
4. **Check type system compatibility** with existing types
5. **Propose 2-3 implementation approaches** with clear trade-offs
6. **Highlight any architectural deviations** required
7. **Provide estimated effort** for each approach
```

#### Example
**Requirement**: "We need to add a location map URL field to seller profiles"

✅ **Good Response**:
```
I've analyzed this requirement and here's my assessment:

1. **Affected Components**:
   - Supabase schema (seller_profiles table)
   - TypeScript types (SellerProfile interface)
   - Seller registration/edit forms
   - Seller profile display components

2. **Implementation Options**:

   **Option A (Recommended)**:
   - Add `map_location_url` TEXT field to seller_profiles table
   - Update SellerProfile TypeScript interface
   - Add field to seller registration form (conditional for sellers)
   - Display on seller profile pages
   - *Pros*: Simple, maintains data integrity
   - *Cons*: Requires database migration
   - *Effort*: Low (2-3 hours)

   **Option B**:
   - Store in Sanity as part of seller verification documents
   - *Pros*: No database changes
   - *Cons*: Breaks data ownership pattern, complicates analytics
   - *Effort*: Medium (4-6 hours)

3. **Pakistan Considerations**:
   - Should validate for common Pakistani map services (Google Maps, MapmyIndia)
   - Should handle both mobile and desktop map links
   - Should consider users without smartphones

4. **Recommended Approach**: Option A with validation for common map URL patterns

Would you like me to provide the specific SQL migration, TypeScript updates, and form implementation details?
```

❌ **Bad Response**:
```
Just add a field to the database and forms. It's easy.
```

### Database Design

#### What to Do
- **Follow established patterns**: Adhere to the defined schema structure
- **Implement proper RLS policies**: Always consider security implications
- **Create appropriate indexes**: Optimize for common query patterns
- **Maintain data ownership**: Keep content in Sanity, business data in Supabase
- **Validate relationships**: Ensure proper foreign key constraints

#### What to Avoid
- Creating redundant data storage
- Ignoring RLS policy requirements
- Adding unnecessary columns/tables
- Storing content in Supabase or business data in Sanity
- Creating circular dependencies between tables

#### Best Practices
```markdown
When designing database changes:

1. **Determine data ownership**:
   - Content (listings, categories, reviews) → Sanity
   - Business data (users, analytics, subscriptions) → Supabase

2. **Define relationships clearly**:
   - Use UUID references between systems (Sanity ID → Supabase)
   - Avoid circular references
   - Document all relationships

3. **Implement RLS policies**:
   - Users can only access their own data
   - Sellers can only access their listings/analytics
   - Admins can access all data with verification

4. **Optimize for queries**:
   - Create indexes for common filters (location, category, date)
   - Consider partial indexes for active data
   - Implement BRIN indexes for time-series data

5. **Plan for growth**:
   - Consider partitioning large tables (analytics_events)
   - Implement proper archiving strategies
   - Design for 10k+ MAUs within free tier constraints
```

#### Example
**Task**: "Add seller tier system with bronze, silver, gold levels"

✅ **Good Implementation**:
```sql
-- Add to seller_profiles table
ALTER TABLE seller_profiles 
ADD COLUMN tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'bronze', 'silver', 'gold', 'platinum', 'diamond')),
ADD COLUMN tier_points INTEGER DEFAULT 0,
ADD COLUMN tier_last_updated TIMESTAMPTZ DEFAULT NOW();

-- Create tier history table
CREATE TABLE seller_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  old_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  reason TEXT,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for tier history
ALTER TABLE seller_tier_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tier history" ON seller_tier_history
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Indexes
CREATE INDEX idx_seller_profiles_tier ON seller_profiles(tier);
CREATE INDEX idx_seller_profiles_tier_points ON seller_profiles(tier_points);

-- Tier calculation function
CREATE OR REPLACE FUNCTION calculate_seller_tier(seller_id UUID)
RETURNS TEXT AS $$
DECLARE
  total_points INTEGER;
  current_tier TEXT;
BEGIN
  -- Calculate points from various metrics
  SELECT 
    (COALESCE((SELECT COUNT(*) * 10 FROM analytics_events 
               WHERE listing_id IN (SELECT _id FROM sanity.listings WHERE supabaseId = calculate_seller_tier.seller_id) 
               AND event_type = 'contact_click' 
               AND created_at > NOW() - INTERVAL '90 days'), 0)) +
    (COALESCE((SELECT COUNT(*) * 5 FROM analytics_events 
               WHERE listing_id IN (SELECT _id FROM sanity.listings WHERE supabaseId = calculate_seller_tier.seller_id) 
               AND event_type = 'view' 
               AND created_at > NOW() - INTERVAL '90 days'), 0)) +
    (COALESCE((SELECT COUNT(*) * 20 FROM reviews 
               WHERE listing_id IN (SELECT _id FROM sanity.listings WHERE supabaseId = calculate_seller_tier.seller_id)
               AND created_at > NOW() - INTERVAL '90 days'), 0)) +
    (COALESCE((SELECT AVG(rating) * 10 FROM reviews 
               WHERE listing_id IN (SELECT _id FROM sanity.listings WHERE supabaseId = calculate_seller_tier.seller_id)), 0))
  INTO total_points;

  -- Update tier points
  UPDATE seller_profiles 
  SET tier_points = total_points, tier_last_updated = NOW()
  WHERE id = calculate_seller_tier.seller_id;

  -- Determine tier
  IF total_points >= 1000 THEN
    RETURN 'diamond';
  ELSIF total_points >= 750 THEN
    RETURN 'platinum';
  ELSIF total_points >= 500 THEN
    RETURN 'gold';
  ELSIF total_points >= 300 THEN
    RETURN 'silver';
  ELSIF total_points >= 100 THEN
    RETURN 'bronze';
  ELSE
    RETURN 'basic';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

❌ **Bad Implementation**:
```sql
-- Just add a tier column without history or calculation
ALTER TABLE seller_profiles ADD COLUMN tier TEXT;
```

### UI/UX Implementation

#### What to Do
- **Follow component architecture**: Respect the established component structure
- **Implement responsive behavior**: Ensure proper mobile/desktop adaptation
- **Use design tokens consistently**: Maintain visual consistency
- **Add skeleton loading states**: For all data-fetching components
- **Implement proper accessibility**: Follow WCAG 2.1 guidelines

#### What to Avoid
- Creating one-off components outside the architecture
- Ignoring mobile experience
- Hard-coding styles instead of using design tokens
- Forgetting loading states
- Neglecting accessibility considerations

#### Best Practices
```markdown
When implementing UI components:

1. **Follow the component structure**:
   - Layout components (Header, Footer)
   - Section components (HeroSection, CategoryCards)
   - Category components (CategorySidebar, ProductGrid)
   - Listing components (ProductGallery, ProductDetails)
   - Seller components (SellerHeader, SellerStats)

2. **Implement responsive behavior**:
   - Mobile-first design approach
   - Proper breakpoints (mobile <768px, tablet 768-1023px, desktop ≥1024px)
   - Mobile-specific patterns (fixed bottom bar, bottom sheets)

3. **Use design tokens**:
   - Color palette (primary, secondary, accent)
   - Typography scale (h1-h4, body, small, tiny)
   - Spacing system (space-0 to space-12)
   - Component tokens (button, card, form)

4. **Add performance optimizations**:
   - Skeleton loading states for data fetching
   - Lazy loading for non-critical components
   - Image optimization with placeholders
   - Proper code splitting

5. **Ensure accessibility**:
   - Proper contrast ratios
   - Keyboard navigation
   - ARIA labels where needed
   - Urdu language support
```

#### Example
**Task**: "Implement the product detail page"

✅ **Good Implementation**:
```tsx
import { getListingWithAnalytics, getSimilarProducts } from '@/lib/listings';
import { ProductGallery } from '@/components/listing/ProductGallery';
import { ProductDetails } from '@/components/listing/ProductDetails';
import { SellerProfile } from '@/components/listing/SellerProfile';
import { SimilarProducts } from '@/components/listing/SimilarProducts';
import { AdBanner } from '@/components/ads/AdBanner';

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const { listing, analytics } = await getListingWithAnalytics(params.slug);
  const similarProducts = await getSimilarProducts(listing._id, listing);
  
  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Listing Not Found</h1>
        <p className="text-muted-foreground">The listing you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ProductGallery listing={listing} />
          
          <div className="mt-8">
            <ProductDetails listing={listing} analytics={analytics} />
          </div>
          
          <div className="mt-12">
            <SimilarProducts products={similarProducts} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <SellerProfile listing={listing} />
            
            <div className="hidden lg:block">
              <AdBanner placement="listing-sidebar" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden p-4 shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 h-12">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="default" className="flex-1 h-12 bg-primary hover:bg-primary-dark">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

❌ **Bad Implementation**:
```tsx
// Monolithic component with no separation of concerns
export default function ListingPage({ params }) {
  // All functionality in one giant component
  // No mobile/desktop adaptation
  // No loading states
  // No performance optimizations
}
```

### TypeScript Typing

#### What to Do
- **Define comprehensive types**: Cover all data structures
- **Maintain central type definitions**: Keep types in one location
- **Validate type compatibility**: Ensure types work across system boundaries
- **Use Zod for runtime validation**: For API routes and data fetching
- **Document type purpose**: Explain why each type exists

#### What to Avoid
- Using `any` or implicit `any`
- Creating duplicate type definitions
- Ignoring null/undefined cases
- Using interfaces where type aliases are better
- Creating overly complex generic types

#### Best Practices
```markdown
When defining TypeScript types:

1. **Centralize type definitions**:
   - Create a `types/index.ts` file for all type definitions
   - Organize types by domain (user, listing, analytics, etc.)
   - Document each type's purpose and usage

2. **Follow strict typing practices**:
   - Enable `strict: true` in tsconfig.json
   - Avoid `any` at all costs
   - Handle null/undefined cases explicitly
   - Use discriminated unions for complex types

3. **Validate type compatibility**:
   - Ensure types work across system boundaries (Sanity → Supabase → UI)
   - Validate API response shapes
   - Use Zod for runtime validation

4. **Document types thoroughly**:
   - Explain the purpose of each type
   - Note any Pakistan-specific considerations
   - Document relationships between types

5. **Use appropriate type constructs**:
   - Use type aliases for complex object shapes
   - Use interfaces for object types that may be extended
   - Use enums for fixed sets of values
   - Use generics for reusable type patterns
```

#### Example
**Task**: "Define types for listings and analytics"

✅ **Good Implementation**:
```typescript
// types/index.ts

/**
 * Listing condition levels
 */
export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair';

/**
 * Listing status
 */
export type ListingStatus = 'active' | 'pending' | 'suspended' | 'expired';

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
 * Listing information (stored in Sanity)
 */
export interface Listing {
  _id: string;
  _type: 'listing';
  title: string;
  slug: {
    current: string;
  };
  description: any[]; // Portable text blocks
  price: number;
  pricePerHour?: number;
  priceWeekly?: number;
  priceMonthly?: number;
  category: {
    _ref: string;
    title: string;
  };
  images: ListingImage[];
  location: Location;
  condition: ItemCondition;
  availability: Availability;
  specifications: Specification[];
  rentalRules: RentalRule[];
  status: ListingStatus;
  supabaseId: string; // References seller's Supabase ID
  featured?: boolean;
  featuredPriority?: number;
}

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
```

❌ **Bad Implementation**:
```typescript
// Scattered type definitions with poor documentation
type Listing = {
  id: string;
  title: string;
  price: number;
  // No documentation
  // Missing many required fields
  // No Pakistan-specific considerations
};

// Duplicate type definition in another file
interface Listing {
  _id: string;
  title: string;
  // Inconsistent structure
}
```

### Performance Optimization

#### What to Do
- **Implement skeleton loading states**: For all data-fetching components
- **Optimize images**: Use proper formats and sizes
- **Use ISR appropriately**: For public pages with revalidate=60
- **Implement proper caching**: For frequent requests
- **Minimize JavaScript**: Through code splitting and tree shaking

#### What to Avoid
- Blocking the main thread with heavy computations
- Loading unnecessary JavaScript
- Ignoring Pakistan's network conditions
- Forgetting to lazy load non-critical components
- Creating large bundle sizes

#### Best Practices
```markdown
When optimizing for performance:

1. **Implement skeleton loading**:
   - Create dedicated skeleton components
   - Match final content shape
   - Use subtle animation
   - Duration should match expected load time

2. **Optimize images**:
   - Use WebP format with JPEG fallback
   - Implement responsive image sizes
   - Use lazy loading (`loading="lazy"`)
   - Implement blur-up placeholders (LQIP)

3. **Use ISR effectively**:
   - Set revalidate=60 for public pages
   - Use cache tags for selective revalidation
   - Avoid ISR for user-specific content
   - Monitor build times

4. **Implement caching strategies**:
   - Long-term caching for static assets (1 year)
   - Short-term caching for dynamic content (1 minute)
   - Use cache headers appropriately
   - Implement proper cache invalidation

5. **Minimize JavaScript**:
   - Code splitting by route and component
   - Tree shaking to remove unused code
   - Defer non-critical JavaScript
   - Use React.lazy for component-level code splitting
```

#### Example
**Task**: "Optimize the product grid component for performance"

✅ **Good Implementation**:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getSearchResults } from '@/lib/search';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cache } from 'react';

// Cache search results for 1 minute
const getCachedSearchResults = cache(async (params: any) => {
  return getSearchResults(params);
}, ['search-results'], {
  revalidate: 60 // 1 minute
});

interface ProductGridProps {
  category?: any;
  initialResults?: any[];
}

export default function ProductGrid({ category, initialResults }: ProductGridProps) {
  const [results, setResults] = useState(initialResults || []);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: '',
    sort: 'featured'
  });
  const [loading, setLoading] = useState(!initialResults);
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      try {
        const params: any = {
          category: category?.slug
        };
        
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        
        const { results } = await getCachedSearchResults(params);
        setResults(results);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!initialResults) {
      fetchResults();
    }
  }, [category, filters]);
  
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="p-0">
            <div className="relative aspect-video rounded-t-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 pt-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center mb-2">
              <Skeleton className="h-4 w-20 mr-2" />
              <Skeleton className="h-3 w-8" />
            </div>
            
            <div className="mb-2">
              <Skeleton className="h-7 w-24" />
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
  
  // Rest of component implementation...
}
```

❌ **Bad Implementation**:
```tsx
// No caching, no skeleton loading, no performance considerations
export default async function ProductGrid({ category }) {
  const { results } = await getSearchResults({ category: category?.slug });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.map(listing => (
        // Direct rendering with no loading states
      ))}
    </div>
  );
}
```

### Testing & Quality Assurance

#### What to Do
- **Implement unit tests**: For critical components and utilities
- **Create integration tests**: For key user flows
- **Conduct accessibility audits**: Using automated and manual testing
- **Test on low-bandwidth connections**: Simulate Pakistan's network conditions
- **Verify type safety**: Ensure no type errors in the codebase

#### What to Avoid
- Writing tests after implementation
- Ignoring edge cases
- Only testing on high-speed connections
- Neglecting accessibility testing
- Assuming type safety without verification

#### Best Practices
```markdown
When implementing testing:

1. **Test-driven development**:
   - Write tests before implementation
   - Start with critical paths
   - Focus on user-facing functionality
   - Ensure tests are maintainable

2. **Comprehensive test coverage**:
   - Unit tests for components and utilities
   - Integration tests for key user flows
   - End-to-end tests for critical paths
   - Accessibility tests for all components

3. **Pakistan-specific testing**:
   - Test on 3G connection speeds (throttle to 400ms+ latency)
   - Verify performance on low-end devices
   - Test Urdu language support
   - Validate CNIC format handling

4. **Type safety verification**:
   - Run TypeScript with strict mode
   - Verify no type errors in the codebase
   - Test runtime type validation
   - Ensure type consistency across boundaries

5. **Continuous quality assurance**:
   - Set up CI/CD pipeline with automated tests
   - Implement code coverage requirements
   - Configure accessibility testing in CI
   - Monitor performance metrics
```

#### Example
**Task**: "Test the listing detail page"

✅ **Good Implementation**:
```typescript
// tests/listing-detail.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListingPage from '@/app/listing/[slug]/page';
import { getListingWithAnalytics, getSimilarProducts } from '@/lib/listings';

// Mock data
const mockListing = {
  _id: 'listing-1',
  title: 'DSLR Camera',
  price: 1000,
  location: { city: 'Karachi', area: 'Clifton' },
  images: [{ asset: { url: '/camera.jpg' } }],
  // Other required fields
};

const mockAnalytics = {
  views: 100,
  contactClicks: 20,
  whatsappClicks: 15
};

const mockSimilarProducts = [
  { _id: 'similar-1', title: 'Mirrorless Camera', price: 1200, /* other fields */ }
];

// Mock implementations
vi.mock('@/lib/listings', () => ({
  getListingWithAnalytics: vi.fn().mockResolvedValue({ 
    listing: mockListing, 
    analytics: mockAnalytics 
  }),
  getSimilarProducts: vi.fn().mockResolvedValue(mockSimilarProducts)
}));

describe('ListingPage', () => {
  it('renders listing details correctly', async () => {
    render(await ListingPage({ params: { slug: 'dslr-camera' } }));
    
    // Check main content
    await waitFor(() => {
      expect(screen.getByText('DSLR Camera')).toBeInTheDocument();
      expect(screen.getByText('PKR 1,000')).toBeInTheDocument();
      expect(screen.getByText('Clifton, Karachi')).toBeInTheDocument();
    });
    
    // Check analytics
    expect(screen.getByText('100 views')).toBeInTheDocument();
    expect(screen.getByText('20 contact clicks')).toBeInTheDocument();
    
    // Check similar products
    expect(screen.getByText('Mirrorless Camera')).toBeInTheDocument();
  });
  
  it('shows loading state while fetching data', async () => {
    // Implementation for testing loading states
  });
  
  it('handles missing listing gracefully', async () => {
    // Override mock to return null listing
    vi.mocked(getListingWithAnalytics).mockResolvedValue({ 
      listing: null, 
      analytics: null 
    });
    
    render(await ListingPage({ params: { slug: 'missing-listing' } }));
    
    expect(screen.getByText('Listing Not Found')).toBeInTheDocument();
    expect(screen.getByText("The listing you're looking for doesn't exist.")).toBeInTheDocument();
  });
  
  it('works on mobile with fixed CTA bar', async () => {
    // Test mobile-specific behavior
  });
  
  it('passes accessibility checks', async () => {
    // Test accessibility
  });
});
```

❌ **Bad Implementation**:
```typescript
// No tests implemented
// Or only basic smoke tests
// Or tests written after implementation
// Or tests that don't cover edge cases
```

## Communication Style Guidelines

### When Providing Code
- **Explain before showing**: Briefly explain the approach before showing code
- **Highlight key decisions**: Note why certain patterns were chosen
- **Document limitations**: Note any trade-offs or limitations
- **Provide context**: Explain how this fits into the larger architecture
- **Offer alternatives**: Suggest 2-3 implementation options when appropriate

### When Giving Advice
- **Be specific**: Avoid vague recommendations
- **Provide reasoning**: Explain why a recommendation is made
- **Cite examples**: Reference similar implementations in the codebase
- **Consider constraints**: Acknowledge project-specific limitations
- **Prioritize**: Focus on most critical issues first

### When Identifying Issues
- **Be constructive**: Frame issues as opportunities for improvement
- **Provide solutions**: Don't just identify problems, suggest fixes
- **Reference guidelines**: Note which guidelines are being violated
- **Prioritize severity**: Distinguish critical issues from minor ones
- **Offer to help**: Express willingness to assist with implementation

## Common Pitfalls to Avoid

### 1. Ignoring Pakistan-Specific Considerations
- **Problem**: Designing for ideal network conditions rather than Pakistan's reality
- **Solution**: Always test on throttled 3G connections (400ms+ latency)
- **Guideline**: All pages must load within 3 seconds on 3G connection

### 2. Breaking Type Consistency
- **Problem**: Creating duplicate or incompatible type definitions
- **Solution**: Centralize all type definitions in `types/index.ts`
- **Guideline**: No component should define its own types; all types must come from the central type system

### 3. Violating Data Ownership Principles
- **Problem**: Storing content in Supabase or business data in Sanity
- **Solution**: Strictly separate content (Sanity) from business data (Supabase)
- **Guideline**: Content = what users see; Business data = how the platform works

### 4. Overlooking Mobile Experience
- **Problem**: Focusing on desktop experience while mobile is primary in Pakistan
- **Solution**: Mobile-first design with progressive enhancement
- **Guideline**: All critical paths must work perfectly on mobile before desktop

### 5. Neglecting Performance Optimization
- **Problem**: Creating heavy pages that fail on low-bandwidth connections
- **Solution**: Implement skeleton loading, image optimization, and proper caching
- **Guideline**: No page should exceed 500KB of JavaScript for initial load

### 6. Creating Component Sprawl
- **Problem**: Creating one-off components outside the established architecture
- **Solution**: Follow the component structure guidelines strictly
- **Guideline**: New component categories require team approval

## Best Practices Reference

### Database Design Checklist
- [ ] Content in Sanity, business data in Supabase
- [ ] Proper RLS policies for all tables
- [ ] Appropriate indexes for common queries
- [ ] No redundant data storage
- [ ] Pakistan-specific validations (CNIC format, city names)
- [ ] Free tier constraints considered (10k MAUs)
- [ ] Time-based partitioning for large tables

### UI Implementation Checklist
- [ ] Follows component architecture guidelines
- [ ] Mobile-first responsive design
- [ ] Uses design tokens consistently
- [ ] Includes skeleton loading states
- [ ] Implements proper accessibility
- [ ] Optimized for Pakistan's network conditions
- [ ] Urdu language support where needed

### TypeScript Typing Checklist
- [ ] Centralized in `types/index.ts`
- [ ] No `any` or implicit `any`
- [ ] Proper null/undefined handling
- [ ] Documentation for each type
- [ ] Compatibility across system boundaries
- [ ] Zod validation for API routes
- [ ] Type safety verified in CI

### Performance Optimization Checklist
- [ ] Skeleton loading for all data-fetching
- [ ] Image optimization with placeholders
- [ ] ISR with proper revalidation
- [ ] Code splitting by route/component
- [ ] Tested on throttled 3G connection
- [ ] Bundle size under 500KB for initial load
- [ ] No unnecessary re-renders

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue: Slow Page Loads on Mobile
- **Symptoms**: Pages take >5 seconds to load on mobile
- **Causes**:
  - Large JavaScript bundles
  - Unoptimized images
  - No skeleton loading states
  - Blocking API calls
- **Solutions**:
  - Implement code splitting
  - Optimize images with WebP and placeholders
  - Add skeleton loading states
  - Use ISR with revalidate=60
  - Test on throttled 3G connection

#### Issue: Type Errors Across System Boundaries
- **Symptoms**: Type mismatches between Sanity and Supabase data
- **Causes**:
  - Inconsistent type definitions
  - Missing null/undefined handling
  - Different field names in different systems
- **Solutions**:
  - Centralize all type definitions
  - Use adapter patterns for system boundaries
  - Implement Zod validation for API routes
  - Ensure consistent field naming

#### Issue: RLS Policy Violations
- **Symptoms**: Data access errors for authenticated users
- **Causes**:
  - Missing RLS policies
  - Incorrect policy conditions
  - Role verification issues
- **Solutions**:
  - Audit all tables for RLS policies
  - Verify policy conditions with real data
  - Implement proper role management
  - Use policy testing tools

#### Issue: Performance Degradation at Scale
- **Symptoms**: Slower response times as user count increases
- **Causes**:
  - Missing indexes
  - Unoptimized queries
  - No caching strategy
  - Poor database design
- **Solutions**:
  - Implement proper indexing
  - Optimize database queries
  - Add caching layers
  - Consider time-based partitioning

## Appendix: Pakistan-Specific Development Considerations

### 1. Network Conditions
- **Reality**: Most users are on 3G/4G with 300-500ms latency
- **Guidelines**:
  - All pages must load within 3 seconds on 3G
  - Max initial JavaScript bundle: 500KB
  - Implement skeleton loading for all data
  - Optimize images aggressively
  - Use lazy loading for non-critical components

### 2. Device Landscape
- **Reality**: Predominantly Android devices, often mid-range
- **Guidelines**:
  - Test on low-end Android devices
  - Avoid heavy JavaScript animations
  - Minimize CSS complexity
  - Test touch targets (min 48x48px)
  - Ensure compatibility with older Android versions

### 3. Language Support
- **Reality**: Bilingual users (English/Urdu)
- **Guidelines**:
  - Support Urdu language option
  - Use Nastaliq font stack for Urdu
  - Right-to-left layout where needed
  - Bilingual content toggle
  - Validate Urdu text rendering

### 4. Cultural Context
- **Reality**: Pakistan-specific social norms and expectations
- **Guidelines**:
  - Respect cultural norms in imagery
  - Consider local holidays in scheduling
  - Account for regional variations
  - Use locally relevant examples
  - Avoid culturally insensitive content

### 5. Verification Requirements
- **Reality**: CNIC is primary ID document
- **Guidelines**:
  - Validate CNIC format (XXXXX-XXXXXXX-X)
  - Support CNIC image uploads
  - Implement multi-step verification
  - Respect privacy regulations
  - Provide clear verification status

### 6. Location Structure
- **Reality**: Cities with neighborhoods/areas
- **Guidelines**:
  - Support city + area/neighborhood structure
  - Pre-populate major Pakistani cities
  - Validate city names
  - Support common neighborhood names
  - Implement location-based search

By adhering to these guidelines, the Qwen CLI agent will provide consistent, high-quality assistance that aligns with the specific requirements and constraints of the RentParlo.pk platform. This ensures that development efforts are focused, efficient, and produce a product that meets the needs of Pakistani users.