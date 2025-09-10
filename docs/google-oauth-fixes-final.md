# RentParlo.pk Google OAuth Authentication Fixes Summary

## Issues Identified and Fixed

### 1. **Incorrect Redirect URLs in Google OAuth Functions**
**Problem**: Both `signInWithGoogle` and `signUpWithGoogle` were using the same redirect URL with `type=signup` parameter, causing all users (new and existing) to be sent through the onboarding flow.

**Fix**: 
- Updated `signInWithGoogle` to use clean redirect URL without `type=signup` parameter
- Kept `signUpWithGoogle` with `type=signup` parameter for proper new user flow

**Files Modified**:
- `app/auth/login/actions.ts`

### 2. **Missing Unique Constraints in Database**
**Problem**: Critical user information (email, phone, CNIC, username) was not properly constrained to be unique, allowing duplicate registrations.

**Fix**:
- Added unique constraints for email and phone in `users` table (excluding NULLs)
- Added unique constraints for CNIC and username in `seller_profiles` table
- Added format validation for Pakistani phone numbers and CNIC numbers

**Files Modified**:
- `utils/supabase/schema.sql`

### 3. **Sanity API Token Permissions**
**Problem**: Document upload was failing with "Insufficient permissions; permission 'create' required" error.

**Fix**:
- Updated Sanity client to use correct environment variable (`SANITY_API_TOKEN`)
- Ensured proper write permissions for the API token

**Files Modified**:
- `app/api/verification/documents/route.ts`

### 4. **Seller Profile Creation Issues**
**Problem**: Seller profile creation was not properly initializing verification documents.

**Fix**:
- Updated seller profile creation to properly initialize `verification_documents` as empty JSON object `{}`

**Files Modified**:
- `app/api/profile/seller/route.ts`

### 5. **Validation Schema Issues**
**Problem**: Validation schema had syntax errors due to escaped characters.

**Fix**:
- Fixed regex patterns in validation schema
- Removed incorrect `\n` characters that were causing syntax errors

**Files Modified**:
- `lib/validations/auth.ts`

## Key Changes Made

### 1. **Fixed Google OAuth Redirect Logic**
```typescript
// Before (incorrect):
export async function signInWithGoogle(): Promise<ActionResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`, // WRONG!
    },
  });
}

// After (correct):
export async function signInWithGoogle(): Promise<ActionResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // CORRECT!
    },
  });
}
```

### 2. **Added Database Unique Constraints**
```sql
-- Email uniqueness (excluding NULLs)
CREATE UNIQUE INDEX idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;

-- Phone uniqueness (excluding NULLs)
CREATE UNIQUE INDEX idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;

-- Seller username uniqueness
CREATE UNIQUE INDEX idx_seller_profiles_username_unique ON public.seller_profiles (username);

-- Seller CNIC uniqueness
CREATE UNIQUE INDEX idx_seller_profiles_cnic_unique ON public.seller_profiles (owner_cnic) WHERE owner_cnic IS NOT NULL;

-- Format validation
ALTER TABLE public.users ADD CONSTRAINT valid_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}$');
ALTER TABLE public.users ADD CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic_format CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}$');
```

### 3. **Fixed Sanity API Integration**
```typescript
// Before (incorrect):
token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN!,

// After (correct):
token: process.env.SANITY_API_TOKEN!,
```

### 4. **Fixed Seller Profile Initialization**
```typescript
// Before (incorrect):
verification_documents: '{}', // String instead of JSON object

// After (correct):
verification_documents: {}, // Proper empty JSON object
```

## Testing Verification

The fixes have been verified to work correctly:

1. ✅ **New User Signup Flow**:
   - Click "Continue with Google" on registration page
   - Redirected to Google auth page
   - After authentication, redirected to `/auth/welcome` (onboarding)

2. ✅ **Existing User Signin Flow**:
   - Click "Continue with Google" on login page
   - Redirected to Google auth page
   - After authentication, redirected to `/dashboard` (skip onboarding)

3. ✅ **Unique Constraints Enforcement**:
   - Attempting to register with existing email shows "Email address is already registered"
   - Attempting to register with existing phone shows "Phone number is already registered"
   - Attempting to register as seller with existing username shows "Username is already taken"
   - Attempting to register as seller with existing CNIC shows "CNIC number is already registered"

4. ✅ **Document Upload**:
   - Seller can successfully upload CNIC documents without permission errors

## Configuration Requirements

To ensure continued proper operation, verify these environment variables are set:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token_with_write_permissions

# Site URL (critical for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Configuration

In Supabase Dashboard → Authentication → Settings:
1. Enable "Google" provider
2. Enter Google Client ID and Secret
3. Add redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

## Google Cloud Console Setup

1. Create OAuth 2.0 Client ID
2. Set Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

These fixes ensure that RentParlo.pk's Google OAuth authentication works correctly for both new user registration and existing user login, with proper unique constraint enforcement and clear error messaging.