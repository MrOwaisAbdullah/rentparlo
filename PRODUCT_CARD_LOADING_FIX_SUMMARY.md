# Instant Loading Feedback for Product Card Clicks

## Issue
Currently, there's no visual feedback when users click on a product card, which can make the app feel unresponsive during navigation to the product detail page.

## Solution
Implemented instant loading feedback that shows a global loader immediately when a user clicks on a product card or related action buttons.

## Changes Made

### 1. Created Loading Context (`contexts/loading-context.tsx`)
- Created a new `LoadingProvider` and `useLoading` hook to manage global loading state
- Implemented a simple loading overlay with spinner and text
- The loading overlay appears immediately when `showLoading()` is called and disappears when `hideLoading()` is called

### 2. Updated Root Providers (`components/providers.tsx`)
- Wrapped the application with `LoadingProvider` to make the loading context available throughout the app

### 3. Updated Listing Card Component (`components/cards/listing-card.tsx`)
- Added `useLoading` hook import
- Integrated `showLoading()` function calls in all click handlers:
  1. Main card click handler (navigates to product detail page)
  2. Share button click handlers (3 different share implementations)
- The loading indicator appears immediately when any of these actions are triggered

## Files Modified
1. `contexts/loading-context.tsx` - New context for managing loading state
2. `components/providers.tsx` - Added LoadingProvider to app wrapper
3. `components/cards/listing-card.tsx` - Added loading feedback to click handlers

## Expected Result
Users will now see immediate visual feedback when they click on:
- Product cards (main navigation to detail page)
- Share buttons on product cards

The loading indicator will appear instantly and remain visible until the next page fully loads, providing a better user experience.

## Testing
The solution should be tested to ensure:
1. Loading indicator appears immediately when clicking product cards
2. Loading indicator appears when clicking share buttons
3. Loading indicator disappears when navigation completes
4. No conflicts with existing functionality
5. Proper performance on mobile devices