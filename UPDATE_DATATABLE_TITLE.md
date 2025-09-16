# Update DataTable Component to Use Custom Titles

## Issue
The DataTable component was hardcoded to display "Data Table" as the card title, which wasn't appropriate for specific use cases like billing history.

## Solution
Modified the DataTable component to accept a customizable title prop, allowing different implementations to provide contextually appropriate titles.

## Changes Made

### 1. types/dashboard.ts
- Updated the DataTableProps interface to include an optional `title` prop
- The title prop defaults to "Data Table" to maintain backward compatibility

### 2. components/dashboard/data-table.tsx
- Modified the DataTable component to accept and use the title prop
- Updated the card header to display the customizable title instead of hardcoded "Data Table"
- Maintained backward compatibility by defaulting to "Data Table" when no title is provided

### 3. components/dashboard/billing-history.tsx
- Updated the BillingHistory component to pass "Billing History" as the title prop to the DataTable
- This ensures the billing history section displays the appropriate title

## Technical Details

### Before:
```tsx
// DataTable always showed "Data Table" as title
<CardTitle>Data Table</CardTitle>
```

### After:
```tsx
// DataTable now accepts customizable title
<CardTitle>{title}</CardTitle>

// BillingHistory passes appropriate title
<DataTable
  data={billingHistory}
  columns={billingColumns}
  title="Billing History"
/>
```

## Benefits
1. **Contextual Titles**: Each DataTable instance can now display a title relevant to its content
2. **Backward Compatibility**: Existing implementations continue to work without changes
3. **Improved UX**: Users see more descriptive titles that match the content
4. **Flexibility**: Other components can now easily customize DataTable titles

## Usage Examples
```tsx
// Billing History
<DataTable title="Billing History" ... />

// User Activity
<DataTable title="User Activity" ... />

// Performance Metrics
<DataTable title="Performance Metrics" ... />

// Default (backward compatible)
<DataTable ... /> // Still shows "Data Table"
```