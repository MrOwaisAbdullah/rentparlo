# RentParlo.pk Google OAuth Authentication Fixes - Complete Solution

## Issues Identified and Fixed

### 1. **Incorrect Redirect URLs in OAuth Functions**
**Problem**: Both `signInWithGoogle` and `signUpWithGoogle` were using incorrect redirect URLs that caused all users to be sent through the onboarding flow, even existing users.

**Root Cause**: 
- Both functions were using `type=signup` parameter in redirect URLs
- `signInWithGoogle` should use clean redirect URL without `type=signup`
- `signUpWithGoogle` should use redirect URL with `type=signup` parameter

**Fix Applied**:
- Updated `signInWithGoogle` to use clean redirect URL: `${siteUrl}/auth/callback`
- Kept `signUpWithGoogle` with `type=signup` parameter: `${siteUrl}/auth/callback?type=signup`
- Added robust site URL determination using `VERCEL_URL` with fallbacks

### 2. **Missing Unique Constraints in Database**
**Problem**: Critical user information (email, phone, CNIC, username) was not properly constrained to be unique, allowing duplicate registrations.

**Fix Applied**:
- Added unique constraints for email and phone in `users` table (excluding NULLs)
- Added unique constraints for CNIC and username in `seller_profiles` table
- Added format validation for Pakistani phone numbers and CNIC numbers
- Added unique constraint for guest_id in `users` table

### 3. **Sanity API Token Permissions**
**Problem**: Document upload was failing with "Insufficient permissions; permission 'create' required" error.

**Fix Applied**:
- Updated Sanity client to use correct environment variable (`SANITY_API_TOKEN`)
- Ensured proper write permissions for the API token

### 4. **Seller Profile Creation Issues**
**Problem**: Seller profile creation was not properly initializing verification documents.

**Fix Applied**:
- Updated seller profile creation to properly initialize `verification_documents` as empty JSON object `{}`
- Fixed CNIC format validation to be more specific for Pakistani format

### 5. **Validation Schema Issues**
**Problem**: Validation schema had syntax errors due to escaped characters.

**Fix Applied**:
- Fixed regex patterns in validation schema
- Removed incorrect `\n` characters that were causing syntax errors

### 6. **Production Environment URL Issues**
**Problem**: Google OAuth was redirecting to localhost instead of production domain.

**Fix Applied**:
- Added robust site URL detection using `VERCEL_URL` with fallbacks
- Updated OAuth redirect URLs to use proper environment detection
- Created verification guide for production deployment

### 7. **Interface Definition Issues**
**Problem**: OAuth functions were returning incorrect types.

**Fix Applied**:
- Added `redirectUrl` to `ActionResult` interface
- Fixed function return types to match interface

## Key Code Changes

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
  // Use VERCEL_URL in production, fallback to NEXT_PUBLIC_SITE_URL, then localhost
  const siteUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`, // CORRECT!
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

-- Guest ID uniqueness (excluding NULLs)
CREATE UNIQUE INDEX idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- Seller phone uniqueness (excluding NULLs)
CREATE UNIQUE INDEX idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;

-- Seller email uniqueness (excluding NULLs)
CREATE UNIQUE INDEX idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;
```

### 3. **Added Format Validation**
```sql
-- Format validation for Pakistani phone numbers
ALTER TABLE public.users ADD CONSTRAINT valid_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}$');
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}$');

-- Format validation for email addresses
ALTER TABLE public.users ADD CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Format validation for CNIC numbers
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic_format CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}$');
```

### 4. **Fixed Sanity API Integration**
```typescript
// Before (incorrect):
token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN!,

// After (correct):
token: process.env.SANITY_API_TOKEN!,
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

5. ✅ **Production Environment URL Handling**:
   - OAuth correctly uses production domain in deployed environments
   - OAuth correctly uses localhost in development environments
   - No more redirect_uri_mismatch errors

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
# For production deployments:
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# Or rely on VERCEL_URL in Vercel deployments
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

## Production Deployment Checklist

Before deploying to production:
- [ ] `NEXT_PUBLIC_SITE_URL` is set to your production domain
- [ ] Supabase Auth Google provider has correct redirect URLs
- [ ] Google Cloud Console has correct authorized redirect URIs
- [ ] Code uses the updated site URL determination logic
- [ ] Environment variables are properly configured in production

## Files Modified

1. `app/auth/login/actions.ts` - Fixed OAuth redirect URLs and function return types
2. `utils/supabase/schema.sql` - Added unique constraints and format validation
3. `app/api/verification/documents/route.ts` - Fixed Sanity API token usage
4. `app/api/profile/seller/route.ts` - Fixed verification documents initialization
5. `lib/validations/auth.ts` - Fixed validation schema syntax errors
6. `docs/google-oauth-fixes-complete.md` - This documentation

These fixes ensure that RentParlo.pk's Google OAuth authentication works correctly for both new user registration and existing user login, with proper unique constraint enforcement and clear error messaging, and correct redirect behavior in both development and production environments.