# RentParlo.pk Database Seeding Guide

This guide explains how to properly seed the RentParlo.pk database with sample data for development and testing.

## Prerequisites

Before running the seeding scripts, ensure you have:

1. A running Supabase project
2. A Sanity project set up
3. Environment variables configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`

## Seeding Process

The seeding process must be done in the correct order to avoid foreign key constraint violations:

### 1. Supabase Database Seeding

First, run the fixed Supabase seeding script which properly creates users in `auth.users` before adding them to `public.users`:

```bash
node scripts/supabase-seed-fixed.js
```

This script will:
- Create users in the `auth.users` table (required for foreign key constraints)
- Insert user records into the `public.users` table
- Create seller profiles
- Set up subscription packages
- Add sample data for analytics, support tickets, etc.

### 2. Sanity CMS Seeding

After Supabase seeding is complete, run the Sanity seeding script:

```bash
npx sanity exec scripts/sanity-seed.js --with-user-token
```

This script will:
- Create categories
- Create listings with proper references to Supabase user IDs
- Create blog posts
- Create banners
- Upload and link real images

## Troubleshooting

### Foreign Key Constraint Errors

If you encounter errors like:
```
ERROR: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) is not present in table "users".
```

This means you're trying to insert records into `public.users` without first creating the corresponding users in `auth.users`. Always run the Supabase seeding script first.

### Sanity Image Upload Issues

If images are not uploading properly:
1. Ensure your Sanity API token has write permissions
2. Check that the image files exist in the `public/images` directory
3. Verify your Sanity project ID and dataset are correct

## Data Structure

The seeding scripts create the following sample data:

### Users
- 1 Admin user
- 5 Seller users
- 3 Regular users

### Seller Profiles
Each seller gets a complete profile with:
- Business information
- Verification status
- Tier levels (bronze, silver, gold, platinum)

### Listings
Sample listings across multiple categories:
- Camera & Photography
- Automobiles
- Medical Equipment
- Electronics
- And more...

### Analytics Data
Sample analytics events to test dashboard functionality.

## Resetting Data

To reset all data:

1. Run the cleanup script:
   ```bash
   npx sanity exec scripts/sanity-cleanup.js --with-user-token
   ```

2. Clear Supabase data using the Supabase dashboard or SQL commands

3. Re-run the seeding scripts in order

## Important Notes

1. **Order Matters**: Always run Supabase seeding before Sanity seeding
2. **User IDs**: The sample user IDs are hardcoded and must match between both scripts
3. **Environment**: These scripts are designed for development environments only
4. **Images**: Sample images should be placed in the `public/images` directory before running Sanity seeding