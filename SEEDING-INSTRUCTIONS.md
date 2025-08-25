# RentParLo.pk Database Seeding Instructions

This document provides step-by-step instructions for seeding the RentParLo.pk database with sample data.

## Prerequisites

Before running the seeding scripts, ensure you have:

1. A running Supabase project
2. Environment variables configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Seeding Process

### Step 1: Apply Schema Updates

The seller_profiles table needs to be updated with two new columns: `country` and `business_type`.

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Pakistan';
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
```

### Step 2: Run the Seeding Script

After applying the schema updates, run the seeding script:

```bash
node scripts/supabase-seed-fixed.js
```

This script will:
- Create users in the `auth.users` table
- Insert user records into the `public.users` table
- Create seller profiles with the new columns
- Set up subscription packages
- Add sample data for analytics, support tickets, etc.

### Alternative: Step-by-Step Seeding

If you prefer to run the seeding process step by step:

```bash
node scripts/step-by-step-seed.js
```

This script will:
1. Create users in `auth.users` and `public.users`
2. Create seller profiles (without the new columns if schema updates haven't been applied)

## Verification

To verify that the required users exist in `auth.users`:

```bash
node scripts/validate-users.js
```

## Troubleshooting

### Foreign Key Constraint Errors

If you encounter errors like:
```
ERROR: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) is not present in table "users".
```

This means you're trying to insert records into `public.users` without first creating the corresponding users in `auth.users`. Always run the seeding script which handles this automatically.

### Schema Update Issues

If you get errors about missing columns when inserting seller profiles:

1. Make sure you've applied the schema updates as described in Step 1
2. If you've already run the seeding script without the schema updates, you can still apply the schema updates and run the script again - it will update existing records

### Connection Issues

If you get connection errors:

1. Verify that your Supabase URL and service role key are correct in `.env.local`
2. Ensure your Supabase project is running and accessible
3. Check that your network connection is stable

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

### Additional Data
- Subscription packages
- User subscriptions
- Analytics events
- Support tickets
- Seller tier history

## Resetting Data

To reset all data:

```bash
node scripts/reset-all.js
```

This script will:
- Delete all data from Supabase tables
- Run the Sanity cleanup script (if you have Sanity set up)

## Important Notes

1. **Order Matters**: The seeding script handles dependencies automatically, but if running manually, always create users in `auth.users` before inserting into `public.users`
2. **User IDs**: The sample user IDs are hardcoded and must match between scripts
3. **Environment**: These scripts are designed for development environments only
4. **Schema Updates**: The schema updates are optional but recommended for complete functionality