## 2. Requirements Document

# 📋 RentParlo.pk - Comprehensive Requirements Specification

## 1. Introduction

### 1.1 Purpose
This document details the functional and non-functional requirements for the RentParlo.pk platform. It serves as the definitive source of truth for all development activities.

### 1.2 Scope
The requirements cover all aspects of the RentParlo.pk platform including:
- User-facing features (web application)
- Seller dashboard
- Admin dashboard
- Content management
- API specifications
- Integration requirements

### 1.3 Target Users
- **Renters**: Individuals looking to rent items
- **Sellers**: Individuals/businesses offering items for rent
- **Admins**: Platform management team
- **Affiliates**: Marketing partners

## 2. Functional Requirements

### 2.1 User Authentication & Profiles

#### 2.1.1 User Registration
- **FR-001**: Users must be able to register using email or social login (Google)
- **FR-002**: Users must provide email, password, phone number, and city during registration
- **FR-003**: Users must verify email address before full account activation
- **FR-004**: Users must select role during registration (renter or seller)
- **FR-005**: Seller registration must include additional fields:
  - Business name (optional)
  - CNIC number (XXXXX-XXXXXXX-X format validation)
  - Address (line 1, line 2)
  - Upload CNIC front/back images (to Sanity)
  - Business license (optional)

#### 2.1.2 User Login
- **FR-006**: Users must be able to log in with email/password
- **FR-007**: Users must be able to log in with Google OAuth
- **FR-008**: Password reset functionality must be available
- **FR-009**: Session management must persist across browser sessions

#### 2.1.3 User Profiles
- **FR-010**: Users must be able to view and edit their profile information
- **FR-011**: Users must be able to update profile picture
- **FR-012**: Users must be able to set notification preferences
- **FR-013**: Users must be able to change password
- **FR-014**: Users must be able to set preferred language (English/Urdu)

### 2.2 Listing Management

#### 2.2.1 Listing Creation
- **FR-015**: Sellers must be able to create new listings
- **FR-016**: Listings must include:
  - Title (min 10 characters, max 100)
  - Description (min 50 characters)
  - Price (daily, with optional hourly, weekly, monthly)
  - Category (required)
  - 1-10 images (with hotspot capability)
  - Location (city and area/neighborhood)
  - Condition (new, like-new, good, fair)
  - Availability (immediately available toggle)
  - Specifications (key-value pairs)
  - Rental rules (list of requirements)
  - Status (active, pending verification, suspended, expired)

#### 2.2.2 Listing Management
- **FR-017**: Sellers must be able to view all their listings
- **FR-018**: Sellers must be able to edit existing listings
- **FR-019**: Sellers must be able to pause/resume listings
- **FR-020**: Sellers must be able to delete listings
- **FR-021**: Sellers must be able to view listing analytics (views, contact clicks)
- **FR-022**: Sellers must be able to mark listings as featured (if package allows)

### 2.3 Search & Discovery

#### 2.3.1 Search Functionality
- **FR-023**: Users must be able to search listings by keyword
- **FR-024**: Users must be able to filter by city and neighborhood
- **FR-025**: Users must be able to filter by price range
- **FR-026**: Users must be able to filter by condition
- **FR-027**: Users must be able to sort results (featured, price low-high, newest)
- **FR-028**: Search must support location-based results (nearest first)

#### 2.3.2 Category Browsing
- **FR-029**: Users must be able to browse listings by category
- **FR-030**: Categories must be hierarchical (parent/child)
- **FR-031**: Category pages must show featured listings first
- **FR-032**: Category pages must support the same filters as search

#### 2.3.3 SEO Landing Pages
- **FR-033**: System must auto-generate location-specific landing pages
  - Example: "Rent camera in Karachi", "Rent car in Lahore"
- **FR-034**: Landing pages must have unique meta tags for SEO
- **FR-035**: Landing pages must show relevant listings based on URL parameters

### 2.4 Listing Details

#### 2.4.1 Listing Presentation
- **FR-036**: Listing page must show high-quality image gallery
- **FR-037**: Listing page must show title, price, and location prominently
- **FR-038**: Listing page must show seller information with verification badges
- **FR-039**: Listing page must show specifications in a structured format
- **FR-040**: Listing page must show rental rules clearly
- **FR-041**: Listing page must show similar items section

#### 2.4.2 Seller Interaction
- **FR-042**: Renters must be able to contact seller via WhatsApp
- **FR-043**: Renters must be able to call seller directly
- **FR-044**: Renters must be able to view seller's location on map
- **FR-045**: Mobile view must have fixed bottom bar with contact options

### 2.5 Seller System

#### 2.5.1 Seller Verification
- **FR-046**: Sellers must submit CNIC for verification
- **FR-047**: Sellers must submit business license (optional for businesses)
- **FR-048**: Admin must be able to approve/reject verification requests
- **FR-049**: Verified sellers must receive "Verified" badge
- **FR-050**: Verification status must be visible on seller profile

#### 2.5.2 Seller Tiers
- **FR-051**: System must calculate seller tier automatically:
  - Basic (0-99 points)
  - Bronze (100-299 points)
  - Silver (300-499 points)
  - Gold (500-749 points)
  - Platinum (750-999 points)
  - Diamond (1000+ points)
- **FR-052**: Tier points calculation:
  - 10 points per contact click (90-day window)
  - 5 points per view (90-day window)
  - 20 points per review (90-day window)
  - 10 points per average rating point
- **FR-053**: Tiers must be displayed on seller profile and listings
- **FR-054**: Admin must be able to manually adjust tiers

#### 2.5.3 Seller Dashboard
- **FR-055**: Dashboard must show listing performance metrics
- **FR-056**: Dashboard must show top performing listings
- **FR-057**: Dashboard must show tier status and requirements
- **FR-058**: Dashboard must show subscription status
- **FR-059**: Dashboard must show support tickets

### 2.6 Subscription System

#### 2.6.1 Subscription Packages
- **FR-060**: System must support multiple subscription packages:
  - Basic (free): 5 listings, basic analytics
  - Pro (PKR 999/month): 20 listings, advanced analytics, featured listings
  - Premium (PKR 1999/month): Unlimited listings, priority support, custom domain
- **FR-061**: Packages must include features:
  - Location boost
  - Priority support
  - Advanced analytics
  - Featured listing capability
  - Listing priority ranking

#### 2.6.2 Subscription Management
- **FR-062**: Sellers must be able to view available packages
- **FR-063**: Sellers must be able to upgrade/downgrade packages
- **FR-064**: System must handle trial periods
- **FR-065**: System must send renewal reminders
- **FR-066**: System must handle payment failures gracefully

### 2.7 Reviews & Ratings

#### 2.7.1 Review System
- **FR-067**: Renters must be able to leave reviews after rental
- **FR-068**: Reviews must include star rating (1-5)
- **FR-069**: Reviews must include title and comment
- **FR-070**: Reviews must support image uploads
- **FR-071**: Reviews must go through moderation (pending → approved/rejected)

#### 2.7.2 Rating Calculation
- **FR-072**: System must calculate average rating for sellers
- **FR-073**: System must display rating prominently on seller profile
- **FR-074**: System must consider recent reviews more heavily

### 2.8 Affiliate Program

#### 2.8.1 Affiliate Management
- **FR-075**: Sellers must be able to create affiliate codes
- **FR-076**: Affiliate codes must support:
  - Percentage discount (5-20%)
  - Fixed amount discount
  - Usage limits
  - Time restrictions
- **FR-077**: System must track affiliate referrals
- **FR-078**: System must show affiliate performance metrics
- **FR-079**: System must handle commission calculations

### 2.9 Support System

#### 2.9.1 Ticket Management
- **FR-080**: Users must be able to create support tickets
- **FR-081**: Tickets must support categories:
  - Technical
  - Billing
  - Verification
  - Listing
  - Other
- **FR-082**: Tickets must support priority levels:
  - Low
  - Medium
  - High
  - Urgent
- **FR-083**: Admin must be able to assign tickets to staff
- **FR-084**: System must send email notifications for ticket updates

#### 2.9.2 WhatsApp Integration
- **FR-085**: Support system must integrate with WhatsApp
- **FR-086**: Clicking "Contact Support" must open WhatsApp chat
- **FR-087**: Support tickets must be created from WhatsApp messages

### 2.10 Advertising System

#### 2.10.1 Ad Management
- **FR-088**: Admin must be able to create ad placements:
  - Homepage top (728x90)
  - Homepage middle (300x250)
  - Category sidebar (300x250)
  - Search results top (728x90)
  - Listing sidebar (300x250)
  - Mobile banner (320x50)
- **FR-089**: Ads must support targeting:
  - Location
  - Category
  - User type
  - Device type
- **FR-090**: System must track ad impressions and clicks
- **FR-091**: System must support scheduled ad campaigns

### 2.11 Admin System

#### 2.11.1 User Management
- **FR-092**: Admin must be able to view all users
- **FR-093**: Admin must be able to ban/suspend users
- **FR-094**: Admin must be able to verify sellers
- **FR-095**: Admin must be able to adjust seller tiers
- **FR-096**: Admin must be able to manage badges

#### 2.11.2 Content Management
- **FR-097**: Admin must be able to manage categories
- **FR-098**: Admin must be able to manage featured listings
- **FR-099**: Admin must be able to manage blog content
- **FR-100**: Admin must be able to manage ad placements

#### 2.11.3 Analytics Dashboard
- **FR-101**: Admin must be able to view platform analytics:
  - User growth
  - Listing growth
  - Category performance
  - Revenue metrics
  - Geographic distribution

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-001**: Homepage must load in < 1.5 seconds on 3G connection
- **NFR-002**: Listing page must load in < 2 seconds on 3G connection
- **NFR-003**: Search results must appear within 1 second of query
- **NFR-004**: Image loading must use lazy loading and placeholders
- **NFR-005**: Critical paths must have skeleton loading states

### 3.2 Reliability
- **NFR-006**: Platform must have 99.5% uptime
- **NFR-007**: Database must have automated backups
- **NFR-008**: Critical transactions must have error handling
- **NFR-009**: System must gracefully handle high traffic periods
- **NFR-010**: Failed operations must have retry mechanisms

### 3.3 Security
- **NFR-011**: All user data must be encrypted at rest and in transit
- **NFR-012**: Passwords must be hashed with bcrypt
- **NFR-013**: User sessions must have expiration
- **NFR-014**: Sensitive operations must require re-authentication
- **NFR-015**: System must have protection against common web vulnerabilities

### 3.4 Usability
- **NFR-016**: Platform must be usable on devices from 320px width
- **NFR-017**: All interactive elements must have proper touch targets
- **NFR-018**: Form validation must provide clear error messages
- **NFR-019**: Platform must support keyboard navigation
- **NFR-020**: Critical paths must have no more than 3 steps

### 3.5 Maintainability
- **NFR-021**: Code must follow consistent style guidelines
- **NFR-022**: Critical components must have unit tests
- **NFR-023**: Documentation must be maintained for all features
- **NFR-024**: System must have proper error logging
- **NFR-025**: Dependencies must be kept up to date

### 3.6 Scalability
- **NFR-026**: System must handle 10,000 MAUs within free tier limits
- **NFR-027**: Database queries must be optimized for performance
- **NFR-028**: Caching strategies must be implemented for frequent requests
- **NFR-029**: System must have monitoring for performance bottlenecks
- **NFR-030**: Architecture must allow for horizontal scaling

## 4. Technical Requirements

### 4.1 Frontend
- **TR-001**: Must use Next.js 14 with App Router
- **TR-002**: Must use TypeScript with strict mode
- **TR-003**: Must use Tailwind CSS v4 with custom theme
- **TR-004**: Must use Shadcn/ui components with customizations
- **TR-005**: Must implement responsive design for all breakpoints
- **TR-006**: Must use ISR for all public pages
- **TR-007**: Must implement proper SEO meta tags
- **TR-008**: Must use React Server Components where appropriate
- **TR-009**: Must implement skeleton loaders for data fetching
- **TR-010**: Must use proper caching strategies

### 4.2 Backend
- **TR-011**: Must use Supabase for database and auth
- **TR-012**: Must use Sanity for content management
- **TR-013**: Must implement proper RLS policies in Supabase
- **TR-014**: Must use Brevo for transactional emails
- **TR-015**: Must implement webhook integrations between systems
- **TR-016**: Must use proper indexing for performance
- **TR-017**: Must implement analytics tracking in Supabase
- **TR-018**: Must use Vercel for hosting
- **TR-019**: Must implement proper error handling
- **TR-020**: Must use Zod for validation

### 4.3 Third-Party Integrations
- **TR-021**: Must integrate Google Maps for location services
- **TR-022**: Must integrate WhatsApp for communication
- **TR-023**: Must integrate Google Analytics 4
- **TR-024**: Must integrate Google Search Console
- **TR-025**: Must integrate Google Tag Manager
- **TR-026**: Must integrate Brevo for email marketing
- **TR-027**: Must integrate payment gateway (to be determined)
- **TR-028**: Must integrate social login providers

## 5. Acceptance Criteria

### 5.1 User Registration
- [ ] User can register with email and password
- [ ] User receives verification email
- [ ] User can verify email address
- [ ] Seller registration collects all required information
- [ ] CNIC validation works correctly

### 5.2 Listing Creation
- [ ] Seller can create a new listing with all required fields
- [ ] Listing images upload correctly to Sanity
- [ ] Listing appears in search results immediately
- [ ] Listing analytics start tracking immediately
- [ ] Seller can edit listing details

### 5.3 Search Functionality
- [ ] Search returns relevant results for keywords
- [ ] Location-based filtering works correctly
- [ ] Price range filtering works correctly
- [ ] Results sort correctly by selected option
- [ ] SEO landing pages load correctly

### 5.4 Seller Dashboard
- [ ] Dashboard shows accurate analytics data
- [ ] Tier calculation works correctly
- [ ] Subscription management works correctly
- [ ] Support tickets can be created and tracked
- [ ] Affiliate codes can be created and tracked

### 5.5 Performance
- [ ] Homepage loads in < 1.5 seconds on 3G
- [ ] Listing page loads in < 2 seconds on 3G
- [ ] Search results appear within 1 second
- [ ] Skeleton loading states provide good UX
- [ ] Images load efficiently with placeholders

## 6. Out of Scope

- Shopping cart functionality
- Checkout/payment processing within platform
- In-app messaging system
- Delivery/logistics management
- Insurance services
- Escrow payment system
- Multi-language content beyond Urdu/English