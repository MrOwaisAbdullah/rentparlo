# RentParlo.pk Authentication System Fixes

## Issues Identified:

1. **Google OAuth Redirect URLs**: Both `signUpWithGoogle` and `signInWithGoogle` were using the same redirect URL with `type=signup`, causing all users to go through onboarding
2. **Missing Unique Constraints**: Email and phone fields in users table didn't have unique constraints
3. **Document Upload Permissions**: Sanity API token didn't have proper write permissions
4. **Seller Profile Creation**: Verification documents field wasn't properly initialized

## Fixes Applied:

### 1. Fixed Google OAuth Redirect URLs
- Updated `signInWithGoogle` to use clean redirect URL without `type=signup` parameter
- Updated `signUpWithGoogle` to use redirect URL with `type=signup` parameter
- This ensures new users go through onboarding while existing users go directly to dashboard

### 2. Added Unique Constraints
- Added unique constraint for email in users table (excluding NULLs)
- Added unique constraint for phone in users table (excluding NULLs)
- Added unique constraint for CNIC in seller_profiles table
- Added unique constraint for username in seller_profiles table
- Added format validation for Pakistani phone numbers
- Added format validation for email addresses
- Added format validation for CNIC numbers

### 3. Fixed Document Upload Permissions
- Updated Sanity client to use correct environment variable (`SANITY_API_TOKEN`)
- Added proper error handling for document upload failures
- Added better logging for permission issues

### 4. Fixed Seller Profile Creation
- Properly initialize verification_documents as empty JSON object `{}` instead of string
- Added proper error handling for seller profile creation
- Fixed seller profile update logic

## Files Modified:

1. `app/auth/login/actions.ts` - Fixed Google OAuth redirect URLs
2. `app/api/verification/documents/route.ts` - Fixed Sanity API token usage
3. `app/api/profile/seller/route.ts` - Fixed verification documents initialization
4. `utils/supabase/schema.sql` - Added unique constraints and validation

## Environment Variables Required:

Make sure these environment variables are set in `.env.local`:

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

## Testing:

After applying these fixes, test the following scenarios:

1. **New User Signup with Google OAuth**:
   - Should redirect to Google auth page
   - After authentication, should go to `/auth/welcome` (onboarding)

2. **Existing User Login with Google OAuth**:
   - Should redirect to Google auth page
   - After authentication, should go to `/dashboard` (skip onboarding)

3. **Email/Phone Uniqueness**:
   - Attempting to register with existing email should show "Email address is already registered"
   - Attempting to register with existing phone should show "Phone number is already registered"

4. **Document Upload**:
   - Seller should be able to upload CNIC documents without permission errors

## Supabase Configuration:

In Supabase Dashboard → Authentication → Settings:
1. Enable Google provider
2. Add Client ID and Secret
3. Add redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

## Google Cloud Console Setup:

1. Create OAuth 2.0 Client ID
2. Set Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

## Sanity CMS Configuration:

1. Ensure `SANITY_API_TOKEN` has write permissions
2. In Sanity project settings, verify the token has:
   - Read access to all datasets
   - Write access to the production dataset
   - Asset upload permissions