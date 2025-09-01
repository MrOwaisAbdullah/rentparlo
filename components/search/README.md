# UnifiedListingSearch Component

## Overview

The `UnifiedListingSearch` component is a comprehensive, reusable search and filter system for listings that consolidates all search functionality across the RentParLo platform. It provides consistent user experience, eliminates code duplication, and implements proper state management for filters and search queries.

## Features

- **Comprehensive Filtering**: Category, location, price, condition, availability, and price type filters
- **Multiple Layouts**: Full, compact, and minimal layouts for different use cases
- **Responsive Design**: Mobile-first design that prevents horizontal scrolling
- **URL State Management**: Optional URL synchronization for bookmarkable searches
- **External State Management**: Can work with external state management systems
- **View Mode Toggle**: Grid and list view modes
- **Active Filter Display**: Clear visual indication of applied filters with individual clear options
- **Sorting Functionality**: Multiple sorting options with proper state management
- **Debounced Search**: Optimized search input with configurable debouncing
- **Loading States**: Proper loading indicators and error handling

## Usage

### Basic Usage

```tsx
import { UnifiedListingSearch } from "@/components/search/unified-listing-search";

function SearchPage() {
  const categories = [
    { _id: "1", title: "Electronics", slug: "electronics" },
    { _id: "2", title: "Vehicles", slug: "vehicles" },
  ];

  const cities = [
    { id: "1", name: "Karachi", province: "Sindh" },
    { id: "2", name: "Lahore", province: "Punjab" },
  ];

  return <UnifiedListingSearch categories={categories} cities={cities} />;
}
```

### With External State Management

```tsx
function CategoryPage() {
  const [filters, setFilters] = useState({
    category: "electronics",
    city: "",
    // ... other filters
  });

  return (
    <UnifiedListingSearch
      categories={categories}
      cities={cities}
      manageURL={false}
      onFiltersChange={setFilters}
      initialFilters={filters}
    />
  );
}
```

### Minimal Layout (Search Bar Only)

```tsx
function HeaderSearch() {
  return (
    <UnifiedListingSearch
      categories={categories}
      cities={cities}
      layout="minimal"
      showSidebar={false}
    />
  );
}
```

### Compact Layout

```tsx
function EmbeddedSearch() {
  return (
    <UnifiedListingSearch
      categories={categories}
      cities={cities}
      layout="compact"
    />
  );
}
```

## Props

| Prop              | Type                                | Default  | Description                        |
| ----------------- | ----------------------------------- | -------- | ---------------------------------- |
| `categories`      | `Category[]`                        | Required | Array of available categories      |
| `cities`          | `City[]`                            | Required | Array of available cities          |
| `initialFilters`  | `Partial<ListingFilters>`           | `{}`     | Initial filter values              |
| `onFiltersChange` | `(filters: ListingFilters) => void` | -        | Callback when filters change       |
| `onSearch`        | `(query: string) => void`           | -        | Callback when search is performed  |
| `showSidebar`     | `boolean`                           | `true`   | Whether to show the filter sidebar |
| `layout`          | `'full' \| 'compact' \| 'minimal'`  | `'full'` | Layout variant                     |
| `className`       | `string`                            | -        | Additional CSS classes             |
| `manageURL`       | `boolean`                           | `true`   | Whether to manage URL state        |
| `searchParams`    | `SearchParams`                      | -        | External search parameters         |

## Filter Types

The component supports the following filter types:

- **Query**: Text search input
- **Category**: Dropdown selection from available categories
- **Location**: City and area selection with nested dropdowns
- **Condition**: Item condition (new, like-new, good, fair)
- **Availability**: Current availability status
- **Price Type**: Rental period (hourly, daily, weekly, monthly)
- **Price Range**: Min/max price filtering with slider and input controls

## Layouts

### Full Layout

- Complete search interface with header, filters sidebar, and results
- Sticky search header with filter controls
- Active filter badges with individual clear options
- View mode toggle (grid/list)
- Sorting controls

### Compact Layout

- Search bar and filters in main content area
- No sticky header
- Suitable for embedding in other pages

### Minimal Layout

- Search bar only
- No filters or sidebar
- Perfect for header search or simple search widgets

## State Management

The component can work in two modes:

1. **URL Management Mode** (default): Automatically syncs filter state with URL parameters
2. **External State Mode**: Uses provided callbacks for state management

## Responsive Behavior

- **Mobile**: Collapsible filter panels, touch-optimized controls
- **Tablet**: Side-by-side filter groups, expandable sections
- **Desktop**: Full sidebar with all filters visible

## Integration with Existing Components

The component integrates with:

- `SearchFilters`: Enhanced filter component with additional filter types
- `SearchResults`: Existing results display component
- `SearchSort`: Sorting controls component
- `useSearchListings`: Data fetching hook
- `useDebounce`: Search input optimization

## Filter State Structure

```typescript
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
```

## Testing

The component includes comprehensive integration tests covering:

- Basic rendering and functionality
- Search input and form submission
- Filter state management
- URL state synchronization
- External state management
- Layout variations
- Responsive behavior
- View mode toggling
- Error handling

## Performance Optimizations

- Debounced search input (300ms delay)
- Memoized filter calculations
- Optimized re-rendering with React.useCallback
- Efficient URL parameter management
- Lazy loading of filter options

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and roles
- Focus management
- High contrast support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Migration from Existing Components

To migrate from existing search components:

1. Replace `SearchContent` with `UnifiedListingSearch`
2. Update props to match new interface
3. Remove duplicate search logic from page components
4. Update imports and component references

## Examples

See the test files for comprehensive usage examples:

- `__tests__/unified-listing-search-integration.test.tsx`

## Dependencies

- React 18+
- Next.js 13+ (for navigation hooks)
- @tanstack/react-query (for data fetching)
- Radix UI components (for UI primitives)
- Lucide React (for icons)
