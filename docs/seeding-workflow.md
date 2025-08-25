# Seeding Workflow Documentation

## Overview

This document explains the proper workflow for seeding the RentParLo.pk application with sample data. The previous seeding approach had issues with foreign key constraints because it tried to insert records into `public.users` without first creating corresponding records in `auth.users`.

## The Problem

The original seeding process failed with errors like:
```
ERROR: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) is not present in table "users".
```

This happened because the `public.users` table has a foreign key constraint that references `auth.users(id)`, meaning every user in `public.users` must first exist in `auth.users`.

## The Solution

We've created new scripts that properly handle this dependency:

1. **[supabase-seed-fixed.js](../scripts/supabase-seed-fixed.js)** - Creates users in `auth.users` first, then adds them to `public.users`
2. **[validate-users.js](../scripts/validate-users.js)** - Checks if required users exist before seeding
3. **[reset-all.js](../scripts/reset-all.js)** - Completely resets both Supabase and Sanity data
4. Updated package.json with new npm scripts for easier execution

## New Seeding Workflow

### 1. Validate Environment
First, ensure your environment variables are set correctly in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `SANITY_API_TOKEN`

### 2. Run Complete Seeding (Recommended)
```bash
npm run seed
```

This runs both Supabase and Sanity seeding in the correct order.

### 3. Run Individual Steps
If you need more control, you can run each step separately:

```bash
# Seed Supabase (creates users in auth.users first)
npm run seed:supabase

# Seed Sanity (creates listings, categories, etc.)
npm run seed:sanity
```

### 4. Validate Users
Before seeding, you can check if required users already exist:
```bash
npm run seed:validate
```

### 5. Reset Everything
To completely reset all data:
```bash
npm run reset
```

Or reset just Sanity data:
```bash
npm run reset:sanity
```

## Script Details

### supabase-seed-fixed.js
- Uses Supabase Admin API to create users in `auth.users`
- Inserts user records into `public.users` with proper foreign key references
- Creates seller profiles, subscriptions, and sample data
- Handles all foreign key dependencies correctly

### sanity-seed.js
- Updated to include a note about the dependency on Supabase users
- Works the same as before but now has the proper user references

### validate-users.js
- Checks if all required user IDs exist in `auth.users`
- Provides clear feedback on which users are missing
- Helps prevent foreign key constraint errors

### reset-all.js
- Completely clears all Supabase data (in correct dependency order)
- Runs the Sanity cleanup script
- Prepares for fresh seeding

## Important Notes

1. **Order Matters**: Always run Supabase seeding before Sanity seeding
2. **Service Role Key**: The Supabase seeding requires the service role key for admin operations
3. **User IDs**: The sample user IDs are hardcoded and must match between scripts
4. **Development Only**: These scripts are designed for development environments only

## Troubleshooting

### Foreign Key Errors
If you still encounter foreign key errors:
1. Run `npm run reset` to clear all data
2. Ensure you're using the service role key, not the anon key
3. Check that your Supabase project URL is correct

### Sanity Seeding Failures
If Sanity seeding fails:
1. Ensure your Sanity API token has write permissions
2. Check that the project ID and dataset are correct
3. Verify that sample images exist in the `public/images` directory

## Future Improvements

Consider implementing:
1. Automated dependency checking between scripts
2. More robust error handling and recovery
3. Progress indicators for long-running operations
4. Backup/restore functionality for development data