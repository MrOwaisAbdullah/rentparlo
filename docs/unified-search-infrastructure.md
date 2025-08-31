# Unified Search Infrastructure

This document describes the core infrastructure components for the unified search and filter system.

## Overview

The unified search infrastructure provides a centralized, reusable system for managing search queries, filters, and results across all pages in the application. It includes:

- **SearchContext**: Manages search state, queries, and results
- **FilterContext**: Handles filter configuration and active filters
- **URLStateManager**: Synchronizes search state with URL parameters
- **TypeScript Interfaces**: Comprehensive type definitions for all components

## Components

### 1. SearchContext (`contexts/search-context.tsx`)

Provides centralized search state management with the following features:

- Query management
- Result handling with pagination
- Loading and error states
- View mode and sorting preferences
- URL synchronization
- Browser navigation support

**Usage:**

```tsx
import { SearchProvider, useSearch } from "@/contexts/search-context";

function App() {
  return (
    <SearchProvider>
      <SearchComponent />
    </SearchProvider>
  );
}

function SearchComponent() {
  const { searchState, updateQuery, performSearch } = useSearch();
  // Use search functionality
}
```

### 2. FilterContext (`contexts/filter-context.tsx`)

Manages filter configuration and active filter state:

- Centralized filter management
- Dynamic filter configuration
- Individual and bulk filter clearing
- Filter validation and type safety

**Usage:**

```tsx
import { FilterProvider, useFilters } from "@/contexts/filter-context";

function App() {
  return (
    <FilterProvider>
      <FilterComponent />
    </FilterProvider>
  );
}

function FilterComponent() {
  const { activeFilters, setFilter, clearAllFilters } = useFilters();
  // Use filter functionality
}
```

### 3. UnifiedSearchProvider (`contexts/unified-search-provider.tsx`)

Combines both SearchProvider and FilterProvider for easier usage:

```tsx
import { UnifiedSearchProvider } from "@/contexts/unified-search-provider";

function App() {
  return (
    <UnifiedSearchProvider>
      <YourComponents />
    </UnifiedSearchProvider>
  );
}
```

### 4. URLStateManager (`lib/url-state-manager.ts`)

Handles URL synchronization and browser navigation:

- Syncs search state to URL parameters
- Restores state from URL on page load
- Validates URL parameters
- Handles browser back/forward navigation

**Usage:**

```tsx
import { URLStateManager } from "@/lib/url-state-manager";

const urlManager = URLStateManager.getInstance();

// Sync state to URL
urlManager.syncToURL(searchState);

// Restore from URL
const restoredState = urlManager.restoreFromURL();
```

## Hooks

### useUnifiedSearch()

Combined hook that provides access to both search and filter functionality:

```tsx
import { useUnifiedSearch } from "@/hooks/use-unified-search";

function SearchComponent() {
  const {
    // Search state
    searchState,
    updateQuery,
    performSearch,

    // Filter state
    activeFilters,
    setFilter,
    clearAllFilters,

    // Utilities
    hasActiveFilters,
    isLoading,
    hasResults,
  } = useUnifiedSearch();
}
```

### useUnifiedSearchState()

Read-only access to search and filter state:

```tsx
import { useUnifiedSearchState } from "@/hooks/use-unified-search";

function ResultsDisplay() {
  const { query, results, isLoading, activeFilters, hasActiveFilters } =
    useUnifiedSearchState();
}
```

### useDebouncedSearch()

Provides debounced search functionality:

```tsx
import { useDebouncedSearch } from "@/hooks/use-unified-search";

function SearchInput() {
  const { debouncedUpdateQuery } = useDebouncedSearch(300);

  const handleInputChange = (value: string) => {
    debouncedUpdateQuery(value); // Debounced by 300ms
  };
}
```

## Type Definitions

All types are defined in `types/search.ts` and exported through `types/index.ts`:

### Core Types

- `SearchState`: Complete search state structure
- `SearchResult`: Individual search result item
- `ListingFilters`: Filters specific to listing searches
- `BlogFilters`: Filters specific to blog searches
- `FilterConfiguration`: Complete filter configuration structure

### Filter Types

- `FilterConfig`: Base filter configuration
- `SelectFilter`: Dropdown/select filter
- `RangeFilter`: Numeric range filter
- `MultiSelectFilter`: Multiple selection filter
- `BooleanFilter`: Checkbox filter
- `DateRangeFilter`: Date range filter

### Context Types

- `SearchContextValue`: Search context interface
- `FilterContextValue`: Filter context interface
- `URLStateManager`: URL state management interface

## URL Parameter Mapping

The system automatically maps search state to URL parameters:

| State Property  | URL Parameter      | Example                      |
| --------------- | ------------------ | ---------------------------- |
| query           | q                  | `?q=laptop`                  |
| category filter | category           | `?category=electronics`      |
| price filters   | minPrice, maxPrice | `?minPrice=100&maxPrice=500` |
| pagination      | page               | `?page=2`                    |
| view mode       | view               | `?view=list`                 |
| sort order      | sort               | `?sort=price-low`            |

## Filter Configuration

Default filter configurations are provided for both listings and blog content:

### Listing Filters

- Category (select)
- Location (select with nested areas)
- Price Range (range)
- Condition (select)
- Availability (select)
- Price Type (select)

### Blog Filters

- Category (select)
- Tags (multiselect)
- Language (select)
- Featured (checkbox)
- Date Range (date)

## Error Handling

The system includes comprehensive error handling:

- Network request failures
- URL parameter validation
- State restoration errors
- Search operation errors

All errors are captured in the search state and can be displayed to users.

## Performance Features

- **Debounced Search**: Prevents excessive API calls
- **Request Deduplication**: Avoids duplicate requests
- **State Caching**: Maintains state during navigation
- **Lazy Loading**: Supports pagination and infinite scroll

## Browser Support

- Modern browsers with History API support
- Graceful degradation for older browsers
- Server-side rendering compatible
- Mobile browser optimized

## Next Steps

This infrastructure is ready for use in building the actual search components:

1. **UniversalSearchBar**: Header and hero search component
2. **UnifiedListingSearch**: Comprehensive listing search
3. **UnifiedBlogSearch**: Blog-specific search
4. **FilterManager**: Centralized filter management UI

All components can now use this infrastructure for consistent, maintainable search functionality.
