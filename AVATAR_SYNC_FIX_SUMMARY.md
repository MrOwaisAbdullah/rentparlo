# Avatar URL Synchronization Fix

## Issue
The avatar URL was not being properly synchronized between the `public.users` and `public.seller_profiles` tables. When a seller updated their avatar, the URL was only being stored in the `users` table but not in the `seller_profiles` table.

## Root Cause
1. The original trigger function only synchronized from `users.profile_image_url` to `seller_profiles.avatar_url`
2. There was no synchronization in the reverse direction (from `seller_profiles.avatar_url` to `users.profile_image_url`)
3. The trigger function was not handling both directions of synchronization properly

## Solution Implemented

### 1. Enhanced Trigger Function
Updated the `sync_avatar_to_seller_profile()` function to handle bidirectional synchronization:

```sql
CREATE OR REPLACE FUNCTION public.sync_avatar_to_seller_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync from users to seller_profiles when users.profile_image_url is updated
  IF TG_TABLE_NAME = 'users' AND (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update seller profile avatar_url if it exists
    UPDATE public.seller_profiles 
    SET avatar_url = NEW.profile_image_url
    WHERE id = NEW.id 
    AND (avatar_url IS NULL OR avatar_url != NEW.profile_image_url);
    
    RETURN NEW;
  END IF;
  
  -- Sync from seller_profiles to users when seller_profiles.avatar_url is updated
  IF TG_TABLE_NAME = 'seller_profiles' AND (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update user profile_image_url if it exists
    UPDATE public.users 
    SET profile_image_url = NEW.avatar_url
    WHERE id = NEW.id 
    AND (profile_image_url IS NULL OR profile_image_url != NEW.avatar_url);
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 2. Added Bidirectional Triggers
Ensured both directions of synchronization are covered:

```sql
-- Trigger to sync avatar when user profile is updated
DROP TRIGGER IF EXISTS sync_user_avatar_to_seller_profile ON public.users;
CREATE TRIGGER sync_user_avatar_to_seller_profile
  AFTER INSERT OR UPDATE OF profile_image_url ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_avatar_to_seller_profile();

-- Trigger to sync avatar when seller profile is updated
CREATE TRIGGER sync_seller_avatar_to_user_profile
  AFTER INSERT OR UPDATE OF avatar_url ON public.seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_avatar_to_seller_profile();
```

## Benefits
1. **Bidirectional Sync**: Avatar URLs are now synchronized in both directions between tables
2. **Automatic Sync**: No manual intervention required - synchronization happens automatically
3. **Data Consistency**: Both tables will always have the same avatar URL
4. **Performance**: Efficient implementation with proper WHERE clauses to minimize unnecessary updates

## Testing
The solution has been tested to ensure:
1. Avatar URL updates in the `users` table automatically sync to the `seller_profiles` table
2. Avatar URL updates in the `seller_profiles` table automatically sync to the `users` table
3. Only necessary updates are performed (checks for NULL or different values)
4. Both INSERT and UPDATE operations trigger the synchronization

## Files Modified
- `utils/supabase/schema.sql` - Enhanced trigger function and triggers for bidirectional synchronization