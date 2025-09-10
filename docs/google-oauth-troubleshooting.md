# Google OAuth Troubleshooting Guide

## Common Issues and Solutions

### 1. Redirect URI Mismatch
**Problem**: Google OAuth fails with "redirect_uri_mismatch" error
**Solution**: 
1. Ensure `NEXT_PUBLIC_SITE_URL` in `.env` matches your actual domain
2. In Google Cloud Console, add these redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)
3. In Supabase Auth settings, ensure redirect URIs match

### 2. All Users Sent to Onboarding
**Problem**: Existing users are forced through onboarding flow
**Solution**: 
- Fixed `signInWithGoogle` function to not include `type=signup` parameter
- Improved callback logic to distinguish between new and existing users

### 3. Environment Variables Not Set
**Problem**: Google OAuth buttons don't appear or fail silently
**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
- Restart development server after adding these variables

### 4. Supabase Auth Provider Not Enabled
**Problem**: "Google provider not enabled" error
**Solution**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Google" provider
3. Enter Google Client ID and Secret
4. Add redirect URLs

## Testing Steps

1. **Local Development Testing**:
   - Ensure `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Click Google OAuth button
   - Should redirect to Google auth page
   - After authentication, should redirect back to `/auth/callback`

2. **Production Testing**:
   - Ensure `NEXT_PUBLIC_SITE_URL` matches your production domain
   - Test both signup and signin flows
   - Verify existing users skip onboarding

## Supabase Configuration

In Supabase Dashboard → Authentication → Settings:
- Enable Google provider
- Add Client ID and Secret
- Add redirect URLs:
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
3. Note Client ID and Secret for `.env.local`

## Environment Variables Required

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site URL (critical for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: See OAuth redirect flow
3. **Check Supabase Logs**: Monitor auth events
4. **Enable Detailed Logging**: Uncomment logging lines in auth actions

## Common Error Messages and Fixes

- "redirect_uri_mismatch": Check redirect URIs in Google Cloud Console and Supabase
- "invalid_client": Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- "access_denied": User cancelled OAuth flow (normal behavior)
- "popup_closed_by_user": User closed Google popup (normal behavior)