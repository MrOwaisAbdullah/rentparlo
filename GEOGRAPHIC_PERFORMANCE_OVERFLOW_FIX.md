# Geographic Performance Mobile Overflow Fix

## Issue
The geographic performance component was overflowing on mobile devices, causing layout issues and making it difficult to view the data.

## Solution
Made the following changes to `components/dashboard/advanced-charts.tsx`:

1. **Added useIsMobile hook to GeographicHeatmap component**:
   - Added `const isMobile = useIsMobile();` to detect mobile devices

2. **Implemented horizontal scrolling for mobile**:
   - Wrapped the content in a scrollable container when on mobile devices
   - Added `overflow-x-auto -mx-4 px-4` classes to create a horizontal scroll container
   - Added `min-w-[500px]` class to ensure content has enough width to scroll
   - Maintained normal layout on desktop devices

## Technical Details
The changes ensure that:
1. On mobile devices, the geographic performance data is wrapped in a horizontally scrollable container
2. The container has negative margins (-mx-4) to extend to the card edges and padding (px-4) to maintain content spacing
3. A minimum width of 500px is set for the content to ensure there's enough to scroll
4. On desktop devices, the normal layout is maintained without any scrolling

## Files Modified
- `components/dashboard/advanced-charts.tsx`:
  - Added useIsMobile hook to GeographicHeatmap component
  - Implemented responsive horizontal scrolling for mobile devices