# Design Document

## Overview

This design outlines a unified search and filter system that consolidates all search functionality across the RentParLo platform. The system will provide consistent user experience, eliminate code duplication, ensure responsive design without horizontal scrollbars, and implement proper state management for filters and search queries.

## Architecture

### Component Hierarchy

```
UnifiedSearchSystem/
├── Core Components/
│   ├── UniversalSearchBar/
│   ├── UnifiedListingSearch/
│   ├── UnifiedBlogSearch/
│   ├── UniversalPageLayout/
│   └── FilterManager/
├── Page-Specific Wrappers/
│   ├── SearchPageWrapper/
│   ├── CategoryPageWrapper/
│   └── BlogPageWrapper/
├── Shared UI Components/
│   ├── FilterPanel/
│   ├── ActiveFilters/
│   ├── ClearFilters/
│   ├── UniversalSidebar/
│   ├── AdBanner/
│   ├── RelatedContent/
│   └── ResponsiveContainer/
└── State Management/
    ├── SearchContext/
    ├── FilterContext/
    ├── SidebarContext/
    └── URLStateManager/
```

### Data Flow Architecture

```mermaid
graph TD
    A[User Input] --> B[UniversalSearchBar]
    B --> C[SearchContext]
    C --> D[URLStateManager]
    D --> E[API Calls]
    E --> F[Results Display]

    G[Filter Changes] --> H[FilterManager]
    H --> C

    I[Page Navigation] --> J[URLStateManager]
    J --> K[State Restoration]
    K --> C
```

## Components and Interfaces

### 1. UniversalSearchBar Component

**Purpose**: Single search component used in header and hero sections

**Props Interface**:

```typescript
interface UniversalSearchBarProps {
  variant: "header" | "hero" | "inline";
  placeholder?: string;
  showLocationFilter?: boolean;
  showCategoryFilter?: boolean;
  onSearch: (query: string, filters: SearchFilters) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}
```

**Features**:

- Responsive design with breakpoint-specific layouts
- Auto-complete suggestions
- Recent searches
- Location and category quick filters
- Keyboard navigation support

### 2. UnifiedListingSearch Component

**Purpose**: Comprehensive search and filter system for listings

**Props Interface**:

```typescript
interface UnifiedListingSearchProps {
  initialFilters?: ListingFilters;
  categories: Category[];
  cities: City[];
  onFiltersChange: (filters: ListingFilters) => void;
  onSearch: (query: string) => void;
  showSidebar?: boolean;
  layout: "full" | "compact" | "minimal";
}

interface ListingFilters {
  query: string;
  category: string;
  city: string;
  area: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  availability: string;
  sortBy: string;
  priceType: string;
}

interface SearchPageFilters {
  query: string;
  sortBy: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  area: string;
  availability: string;
}
```

### 3. UnifiedBlogSearch Component

**Purpose**: Search and filter system specifically for blog content

**Props Interface**:

```typescript
interface UnifiedBlogSearchProps {
  initialFilters?: BlogFilters;
  categories: BlogCategory[];
  tags: string[];
  onFiltersChange: (filters: BlogFilters) => void;
  onSearch: (query: string) => void;
  layout: "sidebar" | "top" | "inline";
}

interface BlogFilters {
  query: string;
  category: string;
  tag: string;
  language: "en" | "ur";
  featured: boolean;
  dateRange: DateRange;
}
```

### 4. UniversalPageLayout Component

**Purpose**: Universal layout component for search, category, and blog pages with sidebar

**Props Interface**:

```typescript
interface UniversalPageLayoutProps {
  children: React.ReactNode;
  pageType: "search" | "category" | "blog";
  pageContext?: Record<string, any>;
  showSidebar?: boolean;
  sidebarPosition?: "left" | "right";
  className?: string;
}
```

**Features**:

- Responsive grid layout with main content and sidebar
- Collapsible sidebar on mobile devices
- Context-aware sidebar content based on page type
- Flexible sidebar positioning

### 5. UniversalSidebar Component

**Purpose**: Universal sidebar component for displaying contextual content

**Props Interface**:

```typescript
interface UniversalSidebarProps {
  pageType: "search" | "category" | "blog";
  pageContext?: Record<string, any>;
  content: SidebarContent[];
  onContentClick?: (contentId: string, contentType: string) => void;
  className?: string;
}

interface SidebarContent {
  id: string;
  type: "ad" | "related-posts" | "popular-listings" | "categories" | "custom";
  title?: string;
  data: any;
  priority: number;
  position?: "top" | "middle" | "bottom";
}
```

### 6. AdBanner Component

**Purpose**: Individual advertisement banner component

**Props Interface**:

```typescript
interface AdBannerProps {
  banner: AdBanner;
  size?: "small" | "medium" | "large";
  onBannerClick?: (bannerId: string) => void;
  className?: string;
}

interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  priority: number;
  targetAudience?: string[];
  category?: string;
}
```

### 7. RelatedContent Component

**Purpose**: Component for displaying related posts, listings, or categories

**Props Interface**:

```typescript
interface RelatedContentProps {
  contentType: "posts" | "listings" | "categories";
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

interface RelatedItem {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl: string;
  description?: string;
  metadata?: Record<string, any>;
}
```

### 6. FilterManager Component

**Purpose**: Centralized filter management with clear/reset functionality

**Props Interface**:

```typescript
interface FilterManagerProps {
  filters: Record<string, any>;
  filterConfig: FilterConfig[];
  onFilterChange: (key: string, value: any) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  showActiveFilters?: boolean;
  layout: "horizontal" | "vertical" | "grid";
}

interface FilterConfig {
  key: string;
  type: "select" | "range" | "checkbox" | "search" | "date";
  label: string;
  options?: Option[];
  placeholder?: string;
  validation?: ValidationRule[];
}
```

## Data Models

### Search State Model

```typescript
interface SearchState {
  // Current search query
  query: string;

  // Active filters
  filters: Record<string, any>;

  // Search results
  results: SearchResult[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // UI state
  isLoading: boolean;
  error: string | null;

  // View preferences
  viewMode: "grid" | "list" | "horizontal";
  sortBy: string;
}
```

### Filter Configuration Model

```typescript
interface FilterConfiguration {
  listings: {
    category: SelectFilter;
    location: LocationFilter;
    price: RangeFilter;
    condition: SelectFilter;
    availability: SelectFilter;
    priceType: SelectFilter;
  };

  blog: {
    category: SelectFilter;
    tags: MultiSelectFilter;
    language: SelectFilter;
    featured: BooleanFilter;
    dateRange: DateRangeFilter;
  };

  search: {
    sortBy: SelectFilter;
    price: RangeFilter;
    condition: SelectFilter;
    area: SelectFilter;
    availability: SelectFilter;
  };
}
```

### Sidebar State Model

```typescript
interface SidebarState {
  // Current page context
  pageType: "search" | "category" | "blog";
  pageContext: Record<string, any>;

  // Sidebar content
  content: SidebarContent[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // User interactions
  interactions: SidebarInteraction[];
}

interface SidebarInteraction {
  contentId: string;
  contentType: string;
  action: "view" | "click" | "hover";
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface SidebarContentConfig {
  search: {
    ads: AdContent[];
    popularListings: ListingContent[];
    featuredCategories: CategoryContent[];
  };

  category: {
    ads: AdContent[];
    relatedCategories: CategoryContent[];
    popularInCategory: ListingContent[];
  };

  blog: {
    ads: AdContent[];
    relatedPosts: BlogContent[];
    blogCategories: CategoryContent[];
    popularPosts: BlogContent[];
  };
}
```

## Error Handling

### Error Types and Recovery

1. **Network Errors**
   - Retry mechanism with exponential backoff
   - Offline state detection
   - Cached results fallback

2. **Validation Errors**
   - Real-time field validation
   - Clear error messaging
   - Auto-correction suggestions

3. **State Errors**
   - URL parameter validation
   - State restoration fallbacks
   - Default state recovery

### Error UI Components

```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
}
```

## Testing Strategy

### Unit Testing

1. **Component Testing**
   - Search input validation
   - Filter state management
   - URL parameter handling
   - Responsive behavior

2. **Hook Testing**
   - Search debouncing
   - Filter state updates
   - URL synchronization
   - Error handling

### Integration Testing

1. **Search Flow Testing**
   - End-to-end search scenarios
   - Filter combinations
   - Page navigation with state
   - Cross-page consistency

2. **Responsive Testing**
   - Mobile layout validation
   - Tablet breakpoint behavior
   - Desktop functionality
   - No horizontal scroll verification

### Performance Testing

1. **Search Performance**
   - Query response times
   - Filter application speed
   - Large result set handling
   - Memory usage optimization

2. **Rendering Performance**
   - Component re-render optimization
   - Virtual scrolling for large lists
   - Image lazy loading
   - Bundle size analysis

## Responsive Design Strategy

### Breakpoint System

```scss
$breakpoints: (
  "mobile": 320px,
  "tablet": 768px,
  "desktop": 1024px,
  "wide": 1440px,
);
```

### Layout Adaptations

1. **Mobile (320px - 767px)**
   - Stacked filter layout
   - Collapsible filter panels
   - Full-width search bar
   - Touch-optimized controls

2. **Tablet (768px - 1023px)**
   - Side-by-side filter groups
   - Expandable filter sections
   - Hybrid navigation
   - Optimized touch targets

3. **Desktop (1024px+)**
   - Sidebar filter panels
   - Inline filter controls
   - Hover interactions
   - Keyboard shortcuts

### Horizontal Scroll Prevention

1. **Container Management**
   - Max-width constraints
   - Overflow handling
   - Flexible grid systems
   - Content wrapping

2. **Component Sizing**
   - Responsive image sizing
   - Flexible text containers
   - Adaptive button groups
   - Dynamic column counts

## State Management Architecture

### Context Providers

```typescript
// Search Context
interface SearchContextValue {
  searchState: SearchState;
  updateQuery: (query: string) => void;
  updateFilters: (filters: Partial<Record<string, any>>) => void;
  clearFilters: () => void;
  performSearch: () => Promise<void>;
}

// Filter Context
interface FilterContextValue {
  activeFilters: Record<string, any>;
  filterConfig: FilterConfiguration;
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
}

// Sidebar Context
interface SidebarContextValue {
  sidebarState: SidebarState;
  loadSidebarContent: (
    pageType: string,
    pageContext: Record<string, any>
  ) => Promise<void>;
  trackInteraction: (interaction: SidebarInteraction) => void;
  updateContent: (content: SidebarContent[]) => void;
  clearContent: () => void;
}
```

### URL State Synchronization

```typescript
interface URLStateManager {
  // Sync state to URL
  syncToURL: (state: SearchState) => void;

  // Restore state from URL
  restoreFromURL: () => SearchState;

  // Handle browser navigation
  handlePopState: (event: PopStateEvent) => void;

  // Validate URL parameters
  validateURLParams: (params: URLSearchParams) => boolean;
}
```

## Performance Optimization

### Search Optimization

1. **Debouncing Strategy**
   - 300ms delay for search input
   - 100ms delay for filter changes
   - Immediate response for clear actions

2. **Caching Strategy**
   - Search result caching (5 minutes)
   - Filter option caching (30 minutes)
   - User preference caching (session)

3. **API Optimization**
   - Request deduplication
   - Batch filter updates
   - Pagination optimization
   - Prefetch next page

### Rendering Optimization

1. **Component Memoization**
   - React.memo for pure components
   - useMemo for expensive calculations
   - useCallback for event handlers

2. **Virtual Scrolling**
   - Large result set handling
   - Dynamic item height
   - Smooth scrolling experience

3. **Code Splitting**
   - Lazy load filter components
   - Dynamic import for heavy features
   - Route-based splitting

## Sidebar Content Management

### Content Strategy by Page Type

1. **Search Page Sidebar**
   - Primary: Advertisement banners (top priority)
   - Secondary: Popular listings across all categories
   - Tertiary: Featured categories for discovery

2. **Category Page Sidebar**
   - Primary: Category-specific advertisement banners
   - Secondary: Related categories and subcategories
   - Tertiary: Popular listings within the current category

3. **Blog Page Sidebar**
   - Primary: Blog-focused advertisement banners
   - Secondary: Related blog posts and popular articles
   - Tertiary: Blog categories and tag cloud

### Content Prioritization System

```typescript
interface ContentPriority {
  ads: {
    weight: 100;
    maxSlots: 3;
    positions: ["top", "middle", "bottom"];
  };

  relatedContent: {
    weight: 80;
    maxSlots: 2;
    positions: ["middle", "bottom"];
  };

  categories: {
    weight: 60;
    maxSlots: 1;
    positions: ["bottom"];
  };
}
```

### Dynamic Content Loading

1. **Context-Aware Loading**
   - Load content based on current page type and context
   - Refresh content when page context changes
   - Cache content for performance optimization

2. **Fallback Content Strategy**
   - Display default content when specific content unavailable
   - Graceful degradation for failed content loads
   - Hide sidebar sections when no content available

## Accessibility Implementation

### Keyboard Navigation

1. **Search Components**
   - Tab order management
   - Enter key submission
   - Escape key clearing
   - Arrow key navigation

2. **Filter Components**
   - Focus management
   - Keyboard shortcuts
   - Screen reader support
   - ARIA labels

3. **Sidebar Components**
   - Keyboard navigation through sidebar content
   - Skip links for sidebar sections
   - Focus management for interactive elements

### Screen Reader Support

1. **Announcements**
   - Search result counts
   - Filter state changes
   - Loading states
   - Error messages
   - Sidebar content updates

2. **ARIA Implementation**
   - Proper role attributes
   - Live regions for updates
   - Descriptive labels
   - State indicators
   - Sidebar content labeling

## Migration Strategy

### Phase 1: Core Components (Week 1-2)

- Create UniversalSearchBar
- Implement FilterManager
- Set up SearchContext and FilterContext
- Create UniversalPageLayout and UniversalSidebar
- Basic responsive layout

### Phase 2: Search Page Integration (Week 3-4)

- Migrate search page with simplified filters
- Implement sidebar with ads and popular content
- Create AdBanner and RelatedContent components
- URL state management for search

### Phase 3: Category and Blog Integration (Week 5-6)

- Update category pages with UnifiedListingSearch and sidebar
- Create UnifiedBlogSearch with sidebar integration
- Migrate blog pages with contextual sidebar content
- Cross-page consistency testing

### Phase 4: Universal Integration (Week 7-8)

- Integrate UniversalSearchBar into header and hero
- Complete responsive design implementation
- Performance optimization and caching
- Accessibility improvements

### Phase 5: Testing and Optimization (Week 9-10)

- Comprehensive testing across all pages
- Bug fixes and edge case handling
- Final accessibility audit
- Documentation and cleanup

## Security Considerations

### Input Validation

1. **Search Query Sanitization**
   - XSS prevention
   - SQL injection protection
   - Input length limits
   - Special character handling

2. **Filter Validation**
   - Type checking
   - Range validation
   - Enum value verification
   - Malicious input detection

### API Security

1. **Request Validation**
   - Parameter sanitization
   - Rate limiting
   - Authentication checks
   - CORS configuration

2. **Data Protection**
   - Sensitive data filtering
   - PII protection
   - Audit logging
   - Error message sanitization
