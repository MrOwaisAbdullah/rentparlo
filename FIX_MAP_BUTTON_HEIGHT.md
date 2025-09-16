# Fix Map Button Height Issue on Mobile

## Issue
The map button on the seller profile page had a very low height on mobile devices, making it difficult to tap and visually inconsistent with other contact buttons.

## Root Cause
The map button had inconsistent styling compared to other contact buttons:
1. Different padding values for mobile and desktop (`p-4 sm:p-3`)
2. No explicit height constraint
3. Inconsistent text sizing

## Solution
Updated the map button styling to be consistent with other contact buttons in the seller profile.

## Changes Made

### components/seller/map-button.tsx
1. **Unified padding**: Changed from `p-4 sm:p-3` to `p-3` for consistent padding on all devices
2. **Explicit height**: Added `h-12` to match the height of other contact buttons
3. **Consistent text sizing**: Added `text-sm sm:text-base` for proper text sizing
4. **Removed redundant classes**: Removed `sm:h-12` since `h-12` already applies to all screen sizes

## Technical Details

### Before:
```tsx
<button
  className={`flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 p-4 sm:p-3 font-medium text-white hover:bg-purple-700 ${className}`}
>
  <MapPin className="w-4 h-4" />
  View Location
</button>
```

### After:
```tsx
<button
  className={`flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 p-3 font-medium text-white hover:bg-purple-700 h-12 ${className}`}
>
  <MapPin className="w-4 h-4" />
  <span className="text-sm sm:text-base">View Location</span>
</button>
```

## Benefits
1. **Consistent height**: Map button now has the same height (48px) as other contact buttons
2. **Better mobile UX**: Easier to tap with proper sizing
3. **Visual consistency**: All contact buttons now have uniform appearance
4. **Responsive design**: Proper sizing across all device sizes

## Testing
The fix was tested to ensure:
- Map button height matches WhatsApp and Call buttons
- Button is easily tappable on mobile devices
- Visual consistency across different screen sizes
- No layout issues in the seller contact section