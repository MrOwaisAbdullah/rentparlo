# Device Performance Pie Chart Mobile Fix

## Issue
The device performance pie chart was not fully visible on mobile devices due to its size being too large for the container.

## Solution
Made the following changes to `components/dashboard/advanced-charts.tsx`:

1. **Added useIsMobile hook import**:
   - Added `useIsMobile` import from "@/hooks/use-mobile"

2. **Implemented responsive pie chart sizing**:
   - Modified the DeviceBreakdown component to use the useIsMobile hook
   - Adjusted the pie chart's innerRadius and outerRadius based on screen size:
     - Mobile: innerRadius=40, outerRadius=80
     - Desktop: innerRadius=60, outerRadius=120

## Technical Details
The changes ensure that the pie chart is appropriately sized for mobile devices while maintaining its full size on desktop screens. The responsive sizing prevents the chart from being cut off or overflowing its container on smaller screens.

## Files Modified
- `components/dashboard/advanced-charts.tsx`:
  - Added useIsMobile import
  - Updated DeviceBreakdown component to use useIsMobile hook
  - Made pie chart radius values responsive to screen size