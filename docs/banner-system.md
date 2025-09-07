# Advertisement Banner System

This document explains how the advertisement banner system works in RentParLo.pk.

## Overview

The banner system provides a flexible way to display advertisements across different placements and devices. It supports both desktop and mobile banners with different sizes and configurations.

## Banner Placements

The system supports the following banner placements:

1. **Homepage Top** - Above the main content on the homepage
2. **Homepage Middle** - In the middle of the homepage content
3. **Homepage Bottom** - Below the main content on the homepage
4. **Category Sidebar** - In the sidebar of category pages
5. **Search Top** - Above search results
6. **Listing Sidebar** - In the sidebar of individual listing pages
7. **Mobile Banner** - Special banner for mobile devices
8. **Seller Profile** - On seller profile pages

## Banner Sizes

The system supports the following banner sizes:

1. **Leaderboard** - 728x90 pixels (desktop) / 320x50 pixels (mobile)
2. **Medium Rectangle** - 300x250 pixels
3. **Large Rectangle** - 336x280 pixels
4. **Half Page** - 300x600 pixels
5. **Mobile Banner** - 320x50 pixels
6. **Large Banner** - 1400x400 pixels (desktop) / 1024x200 pixels (mobile)

## Components

### EnhancedAdBanner

The main banner component that handles rendering and interaction.

Props:
- `placement` (required) - The banner placement location
- `size` (optional) - The banner size (defaults to placement-specific size)
- `className` (optional) - Additional CSS classes
- `fallbackText` (optional) - Text to show when banner fails to load
- `userType` (optional) - Target user type ("all", "sellers", "new-users")
- `showCloseButton` (optional) - Whether to show close button (defaults to true)

### BannerManager

A wrapper component that manages banner state and analytics.

### MobileBanner

A special component for mobile banners that appears at the bottom of the screen.

## Context

### BannerProvider

Provides banner state management across the application.

### useBanner

Hook to access banner state and functions.

## API Routes

### GET /api/banners

Fetches active banners from Sanity.

Query Parameters:
- `placement` (optional) - Filter by placement
- `userType` (optional) - Filter by user type (defaults to "all")

### POST /api/banners/impression

Tracks banner impressions.

Body:
- `bannerId` (required) - The ID of the banner

### POST /api/banners/click

Tracks banner clicks.

Body:
- `bannerId` (required) - The ID of the banner

## Usage

### Basic Usage

```tsx
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"

export function MyComponent() {
  return (
    <EnhancedAdBanner
      placement="homepage-top"
      className="my-4"
      fallbackText="Advertisement"
    />
  )
}
```

### With User Type Filtering

```tsx
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"

export function MyComponent() {
  return (
    <EnhancedAdBanner
      placement="homepage-top"
      userType="sellers"
      className="my-4"
    />
  )
}
```

## Responsive Design

The banner system automatically adapts to different screen sizes:
- Mobile banners only appear on mobile devices
- Desktop banners are hidden on mobile devices
- Banner sizes adjust based on screen size

## Analytics

The system automatically tracks:
- Banner impressions
- Banner clicks
- User interactions

Data is stored in both the client context and sent to the API for persistent storage.

## Storage

Banner visibility state (for closed banners) is stored in localStorage to persist user preferences across sessions.