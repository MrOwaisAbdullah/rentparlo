# RentParlo.pk Authentication and Profile System Analysis

## 1. Authentication Flow and Data Storage Architecture

RentParlo.pk uses a dual-backend architecture:
- **Supabase** for authentication, relational data, and business logic
- **Sanity.io** for content management, including verification documents

This separation allows for specialized handling of different data types while maintaining strong links between systems.

## 2. User Details Storage

### Supabase Storage (`public.users` table)
User details are stored in the `public.users` table in Supabase, with a foreign key relationship to `auth.users(id)`:

**Key Fields:**
- `id` (UUID) - Primary key, references `auth.users.id`
- `email` (TEXT) - User's email address
- `name` (TEXT) - User's full name
- `phone` (TEXT) - User's phone number
- `role` (TEXT) - User role (`user`, `seller`, `admin`)
- `city` (TEXT) - User's city
- `country` (TEXT) - User's country (default: 'Pakistan')
- `profile_image_url` (TEXT) - URL to profile image stored in Sanity
- `is_verified` (BOOLEAN) - General verification status
- `email_verified` (BOOLEAN) - Email verification status
- `onboarding_completed` (BOOLEAN) - Whether onboarding is completed
- `notification_preferences` (JSONB) - User's notification preferences
- `preferred_language` (TEXT) - User's preferred language (`en` or `ur`)
- `last_login` (TIMESTAMPTZ) - Timestamp of last login
- `login_count` (INTEGER) - Number of times user has logged in

### Authentication Methods
1. **Email/Password Registration** - Uses the `signUp` function in `app/auth/login/actions.ts`
2. **Google OAuth** - Uses the `signUpWithGoogle` function in `app/auth/login/actions.ts`

## 3. Seller Details Storage

### Supabase Storage (`public.seller_profiles` table)
Seller-specific details are stored in the `public.seller_profiles` table, with a foreign key relationship to `public.users(id)`:

**Key Fields:**
- `id` (UUID) - Primary key, references `public.users.id`
- `username` (TEXT) - Unique seller username
- `business_name` (TEXT) - Seller's business name
- `owner_cnic` (TEXT) - Seller's CNIC number (unique, validated format)
- `address_line1` (TEXT) - Seller's business address
- `city` (TEXT) - Seller's city
- `phone` (TEXT) - Seller's phone number
- `email` (TEXT) - Seller's email address
- `avatar_url` (TEXT) - URL to seller's avatar image
- `is_verified` (BOOLEAN) - Seller verification status
- `is_top_seller` (BOOLEAN) - Whether seller is a top seller
- `tier` (TEXT) - Seller tier (`basic`, `bronze`, `silver`, `gold`, `platinum`)
- `tier_points` (INTEGER) - Points for seller tier calculation
- `verification_status` (TEXT) - Verification status (`pending`, `approved`, `rejected`)
- `verification_documents` (JSONB) - References to Sanity document IDs for uploaded docs
- `customer_rating` (DECIMAL) - Seller's average customer rating
- `total_reviews` (INTEGER) - Total number of reviews received

## 4. Verification Document Storage

### Dual Storage Approach
Verification documents are stored using a dual approach:

1. **Sanity Storage** - Actual document files (images/PDFs) are stored in Sanity as `verificationDocument` type
2. **Supabase References** - References to these documents are stored in the `verification_documents` JSONB field in `public.seller_profiles`

### Sanity Schema (`verificationDocument`)
The `verificationDocument` schema in Sanity includes:
- `sellerId` - Supabase user ID of the seller
- `documentType` - Type of document (`cnic_front`, `cnic_back`, `business_license`, `bank_statement`)
- `fileName` - Original file name
- `fileAsset` - Reference to the uploaded file
- `fileSize` - File size in bytes
- `mimeType` - File MIME type
- `uploadedAt` - Upload timestamp
- `verificationStatus` - Status of verification (`pending`, `under_review`, `approved`, `rejected`, `resubmit_required`)
- `rejectionReason` - Reason for rejection (if applicable)
- `verifiedBy` - Admin who verified the document
- `verifiedAt` - Timestamp of verification
- `metadata` - Additional metadata about the document
- `autoExtracted` - Data automatically extracted from the document

### Verification Process
1. Seller uploads documents through the verification interface
2. Files are uploaded directly to Sanity
3. A `verificationDocument` record is created in Sanity with metadata
4. Reference to the document is stored in the seller's `verification_documents` field in Supabase
5. Admins can review documents in Sanity and update the verification status
6. Status changes are reflected in both Sanity and Supabase

## 5. Profile Creation and Update Process

### New User Registration
1. User registers via email/password or Google OAuth
2. Supabase auth user is created
3. User profile is created in `public.users` using the `create_user_profile_after_signup` SECURITY DEFINER function
4. If user selects seller role, seller profile is created in `public.seller_profiles` using the `create_seller_profile_after_signup` function

### Onboarding Process
1. New users are directed to the onboarding flow at `/auth/welcome`
2. Users provide additional details (name, phone, city, etc.)
3. For sellers, business information (business name, CNIC, address) is collected
4. Profile is updated with `onboarding_completed = true`

### Profile Updates
Users can update their profile information through:
- Profile API routes (`/api/profile`)
- Direct updates to Supabase tables with proper RLS policies

## 6. Key Security Features

1. **Row Level Security (RLS)** - Strict enforcement in Supabase to ensure users can only access their own data
2. **SECURITY DEFINER Functions** - Special functions that bypass RLS for initial profile creation
3. **Rate Limiting** - Implemented on sign-in and sign-up actions to prevent brute-force attacks
4. **Input Validation** - Zod schemas for robust validation of all form data
5. **Password Security** - Supabase handles automatic password hashing

This architecture provides a robust, secure, and scalable system for managing user and seller profiles while maintaining the flexibility to store complex verification documents in Sanity.