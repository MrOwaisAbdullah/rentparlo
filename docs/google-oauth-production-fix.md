# Google OAuth Production Deployment Fix Guide

## Issue
Google OAuth is redirecting to localhost instead of the production domain in deployed versions.

## Root Cause
The `NEXT_PUBLIC_SITE_URL` environment variable is likely still set to `http://localhost:3000` in the production environment.

## Solution

### 1. Update Environment Variables in Production

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Update or add:
   ```
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

#### For other hosting platforms:
Make sure your environment variables include:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Update Supabase OAuth Configuration

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Under Auth Providers, find Google
3. Update Redirect URLs to include your production domain:
   ```
   https://yourdomain.com/auth/callback
   ```

### 3. Update Google Cloud Console

In Google Cloud Console:
1. Go to APIs & Services → Credentials
2. Find your OAuth 2.0 Client ID
3. Update Authorized redirect URIs:
   ```
   https://yourdomain.com/auth/callback
   ```

### 4. Verify Code Implementation

The code now uses a more robust approach to determine the site URL:

```typescript
// Use VERCEL_URL in production, fallback to NEXT_PUBLIC_SITE_URL, then localhost
const siteUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
```

### 5. Testing Steps

1. Deploy your application with the updated environment variables
2. Try to sign in with Google OAuth
3. Verify that you're redirected to Google's OAuth page with the correct redirect URI
4. After authentication, verify you're redirected back to your production domain

### 6. Common Issues and Solutions

#### Issue: "redirect_uri_mismatch" Error
**Solution**: 
- Ensure your Google Cloud Console has the exact redirect URI:
  ```
  https://yourdomain.com/auth/callback
  ```
- Ensure your Supabase Auth settings include the same redirect URI

#### Issue: Still Redirecting to localhost
**Solution**:
- Double-check that `NEXT_PUBLIC_SITE_URL` is set correctly in production
- For Vercel deployments, you can also rely on `VERCEL_URL` environment variable

#### Issue: OAuth Not Working After Changes
**Solution**:
- Clear your browser cache and cookies
- Try in an incognito/private browsing window
- Check browser console for errors
- Check Supabase Auth logs for detailed error messages

### 7. Environment Variable Priority

The application now uses this priority for determining the site URL:
1. `VERCEL_URL` (automatically set by Vercel)
2. `NEXT_PUBLIC_SITE_URL` (manually set environment variable)
3. `http://localhost:3000` (default for local development)

This ensures that the correct URL is used in all environments.

### 8. Verification Checklist

Before deploying:
- [ ] `NEXT_PUBLIC_SITE_URL` is set to your production domain
- [ ] Supabase Auth Google provider has correct redirect URLs
- [ ] Google Cloud Console has correct authorized redirect URIs
- [ ] Code uses the updated site URL determination logic

After deploying:
- [ ] Test Google OAuth sign-in from production domain
- [ ] Test Google OAuth sign-up from production domain
- [ ] Verify redirects work correctly in both flows
- [ ] Check Supabase Auth logs for any errors

This fix should resolve the issue of Google OAuth redirecting to localhost in production environments.