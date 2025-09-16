# Dashboard Performance Trends Fixes

## Issues Fixed

1. **Performance Trends Chart Zooming Issue**: 
   - Problem: The entire card was zooming/moving instead of just the graph
   - Solution: Modified the MobileChartWrapper component to have a `disableCardWrapper` prop that allows only the chart content to be zoomed/panned without affecting the entire card

2. **Geographic Performance Card**: 
   - Problem: The geographic performance card was unnecessarily wrapped in MobileChartWrapper
   - Solution: Removed the MobileChartWrapper and used a standard Card component since this component doesn't need zooming/panning

3. **Device Performance Card**: 
   - Problem: The device performance card was unnecessarily wrapped in MobileChartWrapper
   - Solution: Removed the MobileChartWrapper and used the component directly since it doesn't need zooming/panning

## Files Modified

1. `components/dashboard/mobile-chart-wrapper.tsx`:
   - Added `disableCardWrapper` prop to allow only the chart content to be zoomed/panned
   - When `disableCardWrapper` is true, the component renders without the Card wrapper and only applies transformations to the chart content

2. `components/dashboard/analytics-dashboard.tsx`:
   - Updated the Performance Trends chart to use the new `disableCardWrapper` prop
   - Removed MobileChartWrapper from Geographic Performance section
   - Removed MobileChartWrapper from Device Performance section

## Technical Details

The key change was to modify the MobileChartWrapper to support a `disableCardWrapper` prop that when set to true:
- Renders the content without the Card wrapper
- Only applies zoom/pan transformations to the chart content itself
- Maintains all other functionality (zoom controls, pan controls, fullscreen, etc.)

This ensures that:
1. Only the chart/graph is zoomed/panned, not the entire card
2. Geographic and device performance cards are not unnecessarily wrapped in mobile-specific containers
3. The user experience is improved by providing precise control over which elements are interactive