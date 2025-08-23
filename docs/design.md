## 3. Design Document

# 🎨 RentParlo.pk - UI/UX Design Specification

## 1. Introduction

### 1.1 Design Principles
1. **Pakistan-First**: Designed specifically for Pakistani users and context
2. **Performance-First**: Optimized for low-bandwidth connections common in Pakistan
3. **Trust-First**: Visual cues that build trust and safety
4. **Mobile-First**: Designed for mobile with progressive enhancement
5. **Clarity-First**: Clear information hierarchy and visual cues

### 1.2 Design System Overview
- **Base**: Tailwind CSS v4 with custom configuration
- **Components**: Shadcn/ui extended with custom components
- **Typography**: Nunito (primary), Urdu Nastaliq Web (for Urdu content)
- **Colors**: 
  - Primary: #4F46E5 (Indigo)
  - Secondary: #7C3AED (Violet)
  - Accent: #10B981 (Emerald)
  - Background: #F9FAFB (Light Gray)
- **Spacing**: 4px baseline grid
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1280px)

## 2. Core UI Components

### 2.1 Layout Components

#### Header
- **Logo**: Left-aligned, links to homepage
- **Global Search Bar**: 
  - City dropdown (default: "Karachi")
  - Keyword input (placeholder: "Try 'DSLR camera'...")
  - Search button with icon
- **Navigation**: 
  - Category bar (8 icons with labels)
  - Register/Sign-in buttons (right-aligned)
  - Seller dashboard shortcut (when logged in as seller)
- **Sticky Behavior**: Fixed position on scroll
- **Mobile Adaptation**: 
  - Hamburger menu for categories
  - Simplified search (icon triggers full search bar)

#### Footer
- **Quick Links**: 
  - About Us, Contact, Blog, Advertise, Help Center
- **Categories**: Top 8 categories with links
- **Social Media**: WhatsApp, Facebook, Instagram, Twitter
- **Newsletter**: Brevo-powered form with email input and submit button
- **App Badges**: Google Play and App Store download badges
- **Copyright**: "© 2023 RentParlo.pk. All rights reserved."

### 2.2 Navigation & Search

#### Category Bar
- **Design**: Horizontal scrollable bar (mobile), inline grid (desktop)
- **Items**: 8 categories with icon + label
Categories
1- Automobiles
2- Mediacal Equipment
3- Camera
4- Genrators
5- Wedding Couture
6- Events
7- Construction Equipment
8- ADS 
9- Studio.
- **Interaction**: 
  - Active category highlighted with primary color
  - Smooth scroll on mobile
  - Hover effects on desktop

#### Global Search Bar
- **City Dropdown**: 
  - Default: "Karachi"
  - Options: Major Pakistani cities
  - Icon: MapPin
- **Keyword Input**: 
  - Placeholder: "What are you looking to rent?"
  - Auto-suggestions
- **Search Button**: 
  - Primary color background
  - Icon: Search
- **Mobile Adaptation**: 
  - Collapsed to icon by default
  - Expands to full search on tap

### 2.3 Listing Components

#### Listing Card (Standard)
- **Image**: Top, 16:9 aspect ratio, lazy-loaded
- **Badges**: Category (top-right corner)
- **Title**: Two-line max, bold font
- **Rating**: Star rating + review count
- **Price**: Bold, primary color
- **Location**: City + neighborhood (if available)
- **Hover State**: Slight shadow elevation
- **Mobile Adaptation**: 
  - Larger touch targets
  - Simplified information hierarchy

#### Listing Card (Featured)
- **All standard card elements**
- **Additional Elements**:
  - "Featured" ribbon (top-left)
  - Higher image quality
  - Priority placement in search
  - Verified seller badge (if applicable)
  - Top Seller badge (if applicable)
- **Visual Distinction**: 
  - Slightly elevated shadow
  - Border accent color

#### Listing Detail Page
- **Desktop Layout**:
  - Left (65%): 
    - Hero image swiper
    - Thumbnail gallery
    - Title, rating, reviews count
    - Specifications table
    - Rental rules
    - Similar listings slider
  - Right (35%): 
    - Sticky seller card (photo, badges, contact info)
    - Price block (hourly/daily/weekly/monthly)
    - CTA buttons (Call, WhatsApp, Map)
    - Ad banner (300x250)
- **Mobile Layout**:
  - Hero swiper (full-width)
  - Collapsible sections (description, specs, rules)
  - Fixed bottom bar: Call • WhatsApp • Map
  - Ad banner below fold

### 2.4 Seller Components

#### Seller Card
- **Avatar**: Circular, prominent placement
- **Name**: Bold, with tier badge
- **Stats**: 
  - Number of listings
  - Response rate
  - Verification status
- **Badges**: 
  - Verification badge
  - Tier badge (Basic, Bronze, Silver, Gold, Platinum, Diamond)
  - Top Seller badge (if applicable)
- **CTA Buttons**: 
  - Call
  - WhatsApp
  - View Profile
- **Mobile Adaptation**: 
  - Larger buttons
  - Simplified stats display

#### Seller Profile Page
- **Header**: 
  - Cover image
  - Avatar (large)
  - Name with tier badge
  - Location and rating
  - Action buttons (Share, Follow, Message)
- **Desktop Layout**:
  - Left (25%): 
    - Sticky seller stats
    - Ad banner
  - Right (75%): 
    - About section
    - Listings grid (filterable)
    - Reviews section
- **Mobile Layout**:
  - Profile header
  - Action tabs (Listings, Reviews, About)
  - Infinite scroll listings
  - Fixed bottom bar: Call • WhatsApp • Map

### 2.5 Review Components

#### Review Card
- **Avatar**: Circular, left-aligned
- **Rating**: Star display (4.8 format)
- **Title**: Bold, prominent
- **Comment**: Two-line max, ellipsis overflow
- **Product**: Italic, smaller font
- **Location**: City (if available)
- **Helpful Button**: "Was this helpful?" with count
- **Images**: Up to 2 small preview images
- **Status**: "Verified Rental" badge if applicable

#### Review Form
- **Rating Selector**: 5-star interactive component
- **Title Input**: Short, required
- **Comment Input**: Text area, required
- **Image Upload**: Up to 5 images
- **Submit Button**: Disabled until required fields filled
- **Validation**: Real-time feedback for requirements

### 2.6 Forms & Inputs

#### Sign-up Form
- **Role Selection**: 
  - User/Seller toggle
  - Visual differentiation of options
- **Common Fields**:
  - Name
  - Email
  - Phone
  - Password
  - City dropdown
- **Seller-Specific Fields**:
  - Business name (optional)
  - CNIC number (with format validation)
  - Address fields
  - Document uploads (CNIC front/back)
- **Validation**: 
  - Real-time feedback
  - Clear error messages
  - Zod-based validation

#### Listing Creation Form
- **Multi-step Flow**:
  - Step 1: Category and basic info
  - Step 2: Photos and description
  - Step 3: Pricing and availability
  - Step 4: Specifications and rules
- **Image Upload**: 
  - Drag and drop
  - Hotspot capability
  - Preview thumbnails
- **Price Fields**:
  - Hourly (optional)
  - Daily (required)
  - Weekly (optional)
  - Monthly (optional)
- **Location Selector**:
  - City dropdown
  - Area/neighborhood input

### 2.7 Advertising Components

#### Ad Banner
- **Sizes**:
  - Leaderboard (728x90)
  - Medium Rectangle (300x250)
  - Large Rectangle (336x280)
  - Half Page (300x600)
  - Mobile Banner (320x50)
- **Behavior**:
  - Lazy-loaded
  - Impression tracking
  - Click tracking
  - Responsive sizing
- **Placement**:
  - Homepage top
  - Homepage middle
  - Category sidebar
  - Search results top
  - Listing sidebar
  - Mobile banner

#### Ad Placement Map
- **Interactive Preview**:
  - Desktop and mobile views
  - Toggle between placements
  - Real-time preview of ad sizes
- **Pricing Information**:
  - Cost per placement
  - Available dates
  - Performance metrics
- **Call-to-Action**:
  - "Book This Placement" button
  - Contact form for inquiries

## 3. Design Tokens

### 3.1 Color Palette

#### Primary Colors
```css
--primary: #4F46E5;       /* Indigo */
--primary-dark: #4338CA;
--primary-light: #818CF8;
--primary-contrast: #FFFFFF;

--secondary: #7C3AED;     /* Violet */
--secondary-dark: #6D28D9;
--secondary-light: #A78BFA;
--secondary-contrast: #FFFFFF;

--accent: #10B981;       /* Emerald */
--accent-dark: #059669;
--accent-light: #34D399;
--accent-contrast: #FFFFFF;
```

#### Neutral Colors
```css
--background: #F9FAFB;
--surface: #FFFFFF;
--border: #E5E7EB;
--text: #1F2937;
--text-muted: #6B7280;
--text-inverse: #FFFFFF;
```

#### Status Colors
```css
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;
```

### 3.2 Typography

#### Font Stack
```css
--font-sans: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
--font-urdu: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', sans-serif;
```

#### Type Scale
| Size | Mobile | Desktop | Usage |
|------|--------|---------|-------|
| h1 | 2rem (32px) | 2.5rem (40px) | Page titles |
| h2 | 1.75rem (28px) | 2rem (32px) | Section titles |
| h3 | 1.5rem (24px) | 1.75rem (28px) | Subsection titles |
| h4 | 1.25rem (20px) | 1.5rem (24px) | Card titles |
| body | 1rem (16px) | 1rem (16px) | Main content |
| small | 0.875rem (14px) | 0.875rem (14px) | Captions, meta |
| tiny | 0.75rem (12px) | 0.75rem (12px) | Helper text |
```

### 3.3 Spacing System

#### Base Unit
- 1 unit = 4px
- All spacing is multiples of 4px

#### Common Spacing Values
| Token | Value | Usage |
|-------|-------|-------|
| space-0 | 0px | No spacing |
| space-1 | 4px | Small padding/margin |
| space-2 | 8px | Standard spacing |
| space-3 | 12px | Medium spacing |
| space-4 | 16px | Section padding |
| space-5 | 20px | Large spacing |
| space-6 | 24px | Major section padding |
| space-8 | 32px | Container padding |
| space-10 | 40px | Page section spacing |
| space-12 | 48px | Hero section spacing |
```

### 3.4 Component Tokens

#### Buttons
```css
--button-padding: space-3 space-4;
--button-radius: 6px;
--button-font-weight: 600;
--button-transition: all 0.2s ease;

/* Primary */
--button-primary-bg: var(--primary);
--button-primary-text: var(--primary-contrast);
--button-primary-hover: var(--primary-dark);

/* Secondary */
--button-secondary-bg: transparent;
--button-secondary-text: var(--primary);
--button-secondary-border: 1px solid var(--primary);
--button-secondary-hover: rgba(79, 70, 229, 0.1);
```

#### Cards
```css
--card-padding: space-4;
--card-radius: 12px;
--card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--card-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--card-border: 1px solid var(--border);
```

#### Forms
```css
--input-height: 48px;
--input-padding: 0 space-3;
--input-radius: 8px;
--input-border: 1px solid var(--border);
--input-focus-border: 2px solid var(--primary);
--input-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```

## 4. Responsive Design Strategy

### 4.1 Breakpoints
| Name | Width | Usage |
|------|-------|-------|
| mobile | < 768px | Mobile-first design |
| tablet | 768px - 1023px | Tablet optimization |
| desktop | ≥ 1024px | Desktop experience |
| wide | ≥ 1440px | Large screens |

### 4.2 Responsive Patterns

#### 1. Progressive Disclosure
- Mobile: Essential information only
- Desktop: Additional details and features
- Example: Listing detail page sidebar

#### 2. Stack to Grid
- Mobile: Vertical stacking
- Desktop: Grid layouts
- Example: Category cards, listing grids

#### 3. Touch Target Sizing
- Minimum 48x48px touch targets
- Adequate spacing between interactive elements
- Larger controls for critical actions

#### 4. Content Prioritization
- Critical information first
- Secondary information progressively revealed
- Hidden elements on mobile revealed through gestures

### 4.3 Mobile-Specific Patterns

#### Fixed Bottom Navigation
- Always visible on mobile
- Contains primary actions
- Example: Call • WhatsApp • Map on listing pages

#### Bottom Sheets
- Replaces modals on mobile
- Slides up from bottom
- Example: Filter drawer on search pages

#### Swipe Navigation
- Horizontal swiping for related content
- Example: Image gallery, similar listings

## 5. Performance Optimization

### 5.1 Image Optimization
- **Format**: WebP for modern browsers, fallback to JPEG
- **Sizes**: Multiple sizes for different breakpoints
- **Loading**: Lazy loading with native `loading="lazy"`
- **Placeholders**: Blur-up technique with LQIP
- **CDN**: Sanity image optimization parameters

### 5.2 Skeleton Loading
- **Purpose**: Perceived performance improvement
- **Implementation**:
  - Gray placeholders with animation
  - Shape matching final content
  - Duration matching expected load time
- **Usage**:
  - Listing grids
  - Profile pages
  - Search results

### 5.3 Caching Strategy
- **Static Assets**: Long-term caching (1 year)
- **Dynamic Content**: Short-term caching (1 minute)
- **API Responses**: Vary by content type
- **ISR**: For public pages with revalidate=60

### 5.4 Resource Loading
- **Critical CSS**: Inlined in head
- **Non-critical JS**: Async/defer loading
- **Code Splitting**: By route and component
- **Font Optimization**: Font-display: swap

## 6. Accessibility Considerations

### 6.1 Color & Contrast
- Minimum contrast ratio of 4.5:1 for text
- Color not used as sole information indicator
- Sufficient contrast for interactive elements

### 6.2 Keyboard Navigation
- Logical tab order
- Visible focus states
- Skip navigation links
- Accessible modal dialogs

### 6.3 Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Landmark roles for page sections
- Accessible form controls

### 6.4 Urdu Language Support
- Nastaliq font stack for Urdu content
- Right-to-left layout where needed
- Language attribute on Urdu content
- Bilingual content toggle

## 7. Design Implementation Plan

### 7.1 Component Development Order
1. **Foundation**: Design tokens, theme configuration
2. **Layout**: Header, footer, containers
3. **Navigation**: Category bar, search components
4. **Content**: Listing cards, seller cards
5. **Forms**: Authentication, listing creation
6. **Specialized**: Ad banners, review components
7. **Dashboard**: Seller and admin components

### 7.2 Design System Documentation
- Storybook integration
- Component usage guidelines
- Props documentation
- Example implementations
- Accessibility notes

### 7.3 Handoff Process
- Figma design files with variants
- Component specifications
- Design token exports
- Interactive prototypes
- Accessibility audit results