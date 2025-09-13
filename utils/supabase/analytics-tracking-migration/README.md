# RentParLo.pk Analytics Tracking Migration

This directory contains the necessary SQL files to migrate an existing RentParLo.pk database to support the comprehensive analytics tracking system.

## Files Included

1. **`analytics-tracking-schema-changes.sql`** - Complete schema definition with all changes
2. **`analytics-tracking-migration.sql`** - Incremental migration script that can be applied to existing databases
3. **`README.md`** - This file with instructions

## Migration Options

### Option 1: Fresh Installation (Recommended for new setups)

If you're setting up a new RentParLo.pk instance or starting with a clean database, use the complete schema file:

```bash
# Apply the complete schema
psql -f utils/supabase/analytics-tracking-schema-changes.sql
```

### Option 2: Migration of Existing Database (Recommended for existing setups)

If you have an existing RentParLo.pk database with data that you want to upgrade, use the migration script:

```bash
# Apply the incremental migration
psql -f utils/supabase/analytics-tracking-migration.sql
```

## What This Migration Does

### 1. Schema Modifications

- **Adds `guest_id` column** to the `users` table for persistent anonymous user tracking
- **Makes `listing_id` nullable** in `analytics_events` table to allow profile view tracking
- **Adds `metadata` column** to `analytics_events` table for flexible event data storage
- **Adds unique constraint** for `guest_id` (excluding NULLs)

### 2. New Tables

- **`banner_impressions`** - Tracks advertisement displays with detailed context
- **`banner_clicks`** - Tracks advertisement clicks with detailed context
- **`banner_performance_daily`** - Daily aggregated statistics for banner performance

### 3. Indexes

Comprehensive indexes for all new tables to optimize query performance:
- Banner impressions indexes (13 indexes)
- Banner clicks indexes (12 indexes)
- Daily performance indexes (4 indexes)

### 4. Functions

- **`calculate_banner_ctr`** - Calculates click-through rate for banners
- **`get_banner_analytics_summary`** - Returns summary analytics for banners with filtering options

### 5. Documentation

- Detailed comments for all new columns and tables
- Clear documentation of purpose and usage

## Prerequisites

Before running the migration, ensure you have:

1. **Supabase CLI** installed and configured
2. **PostgreSQL 12+** or compatible database
3. **Appropriate database permissions** to create tables, indexes, and functions
4. **Backup** of your existing database (recommended)

## Running the Migration

### Using Supabase CLI

```bash
# Connect to your Supabase database
supabase link --project-ref YOUR_PROJECT_ID

# Apply the migration
supabase db push
```

### Using psql

```bash
# Connect to your database
psql -h YOUR_DB_HOST -d YOUR_DB_NAME -U YOUR_USERNAME

# Apply the migration
\i utils/supabase/analytics-tracking-migration.sql
```

### Using Database GUI

1. Open your preferred database management tool (pgAdmin, DBeaver, etc.)
2. Connect to your RentParLo.pk database
3. Open the `analytics-tracking-migration.sql` file
4. Execute the entire script

## Verification

After running the migration, you can verify the changes by checking:

```sql
-- Check that new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('banner_impressions', 'banner_clicks', 'banner_performance_daily');

-- Check that new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'guest_id';

-- Check that indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('banner_impressions', 'banner_clicks', 'banner_performance_daily');

-- Check that functions exist
SELECT proname FROM pg_proc WHERE proname IN ('calculate_banner_ctr', 'get_banner_analytics_summary');
```

## Post-Migration Steps

1. **Update Application Code** - Ensure your application uses the new tracking functions
2. **Test Tracking** - Verify that all tracking events are being recorded correctly
3. **Monitor Performance** - Check database performance after implementing tracking
4. **Set Up Analytics Dashboard** - Create dashboards to visualize the new analytics data

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:
   - Ensure you're connecting with a user that has appropriate permissions
   - You may need to run the migration as a superuser

2. **Column Already Exists**:
   - The migration script checks for existing columns and won't recreate them
   - This is normal and indicates the migration is working correctly

3. **Index Already Exists**:
   - The migration script checks for existing indexes and won't recreate them
   - This is normal and indicates the migration is working correctly

4. **Function Already Exists**:
   - The migration script uses `CREATE OR REPLACE` to update existing functions
   - This is normal and ensures you have the latest version

### Getting Help

If you encounter issues during the migration:

1. **Check Database Logs** - Look for error messages in your database logs
2. **Verify Prerequisites** - Ensure you meet all prerequisites listed above
3. **Contact Support** - Reach out to the RentParLo.pk development team for assistance

## Rollback (If Needed)

If you need to rollback the migration:

1. **Drop New Tables**:
   ```sql
   DROP TABLE IF EXISTS banner_performance_daily;
   DROP TABLE IF EXISTS banner_clicks;
   DROP TABLE IF EXISTS banner_impressions;
   ```

2. **Remove New Columns**:
   ```sql
   ALTER TABLE analytics_events DROP COLUMN IF EXISTS metadata;
   ALTER TABLE users DROP COLUMN IF EXISTS guest_id;
   ```

3. **Drop Indexes**:
   ```sql
   DROP INDEX IF EXISTS idx_users_guest_id_unique;
   -- Drop other indexes as needed
   ```

4. **Drop Functions**:
   ```sql
   DROP FUNCTION IF EXISTS calculate_banner_ctr;
   DROP FUNCTION IF EXISTS get_banner_analytics_summary;
   ```

**Note**: This rollback process will result in data loss for any analytics events recorded after the migration.

## Support

For questions or issues with this migration, please contact:

- **Development Team**: dev@rentparlo.pk
- **Support**: support@rentparlo.pk

## Version Information

- **Version**: 1.0.0
- **Release Date**: September 2025
- **Compatible With**: RentParLo.pk v2.0+

This migration represents a significant enhancement to the RentParLo.pk analytics capabilities and is designed to provide comprehensive tracking of user interactions with listings, seller profiles, and advertisements.