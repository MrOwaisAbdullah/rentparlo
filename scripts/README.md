# Database Scripts

This directory contains scripts to manage the subscription packages in the database.

## Scripts

### 1. insert-subscription-packages.sql
SQL script to insert or update subscription packages in the database.

### 2. check-subscription-packages.sql
SQL script to check what subscription packages exist in the database.

### 3. ensure-subscription-packages.js
Node.js script to ensure subscription packages are properly inserted into the database.

### 4. test-db-connection.js
Simple script to test database connection and query subscription packages.

## How to Run

### SQL Scripts
Run these scripts in your Supabase SQL editor:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the script content
4. Run the query

### Node.js Scripts
Run these scripts from the command line:
```bash
node scripts/ensure-subscription-packages.js
```

Make sure to set the required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

If you're seeing the error "Cannot coerce the result to a single JSON object", it means the query is not finding any subscription packages. This can happen if:

1. The packages haven't been inserted into the database
2. The package names don't match exactly (case-sensitive)
3. There's an issue with the database connection

To fix this:
1. Run the `insert-subscription-packages.sql` script in your Supabase SQL editor
2. Or run the `ensure-subscription-packages.js` script
3. Verify the packages exist by running `check-subscription-packages.sql`