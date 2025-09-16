# Fix Billing History Double Card Issue

## Issue
The billing history was displaying with a double card wrapper because:
1. The BillingHistory component was wrapped in a Card
2. The DataTable component used inside BillingHistory was also wrapped in a Card
3. This created a nested card structure that looked visually incorrect

## Solution
Modified the BillingHistory component to remove the outer Card wrapper and only use the Card provided by the DataTable component.

## Changes Made

### components/dashboard/billing-history.tsx
- Removed the outer Card wrapper that was wrapping the DataTable component
- Kept the Card wrapper only for the "No Billing History" state
- This ensures that when there is data, only the DataTable's Card is used
- When there is no data, the "No Billing History" message is still properly wrapped in a Card

## Technical Details

### Before:
```tsx
<div className="space-y-6">
  <Card>  // Outer card (unnecessary)
    <CardHeader>
      <CardTitle>Billing History</CardTitle>
    </CardHeader>
    <CardContent>
      <DataTable ... />  // DataTable already has its own Card wrapper
    </CardContent>
  </Card>
</div>
```

### After:
```tsx
<div className="space-y-6">
  <DataTable ... />  // Only DataTable's Card wrapper
</div>
```

### Exception:
When there is no billing history, we still wrap the "No Billing History" message in a Card for proper styling:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Billing History</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-center py-8">
      {/* No billing history message */}
    </div>
  </CardContent>
</Card>
```

## Benefits
1. Eliminated the double card visual issue
2. Maintained proper styling for both data and empty states
3. Simplified the component structure
4. Improved visual consistency with other dashboard components