# RentParlo.pk Supabase Schema Updates

This document explains how to apply the authentication enhancements to your Supabase database.

## Files Included

1. `auth-constraints-update.sql` - Standalone SQL script with all authentication enhancements
2. `schema.sql` - Updated main schema file with authentication enhancements included
3. `schema-summary-update.txt` - Updated summary for the schema

## Applying the Updates

### Option 1: Run the Auth Constraints Update Script (Recommended)

1. Open your Supabase SQL Editor
2. Copy and paste the contents of `auth-constraints-update.sql`
3. Run the script

This will:
- Add unique constraints for email, phone, username, and CNIC
- Add format validation for Pakistani phone numbers and CNIC
- Create helper functions for checking uniqueness
- Create enhanced registration functions with validation

### Option 2: Use the Updated Schema File

If you're setting up a new database or want to recreate the entire schema:

1. Open your Supabase SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Run the script

## What's Included in the Updates

### Database Constraints
- Unique constraints for user email and phone numbers
- Unique constraints for seller email and phone numbers
- Unique constraints for seller usernames and CNIC numbers
- Format validation for Pakistani phone numbers (03XX XXXXXXX)
- Format validation for CNIC numbers (XXXXX-XXXXXXX-X)
- Email format validation

### Database Functions
- `check_user_uniqueness()` - Validates email and phone uniqueness
- `check_seller_uniqueness()` - Validates username and CNIC uniqueness
- `register_user_with_validation()` - Enhanced user registration with validation
- `register_seller_with_validation()` - Enhanced seller registration with validation

### Error Handling
All functions now return clear, user-friendly error messages:
- "Email address is already registered"
- "Phone number is already registered"
- "Username is already taken"
- "CNIC number is already registered"
- "Invalid email or phone format"
- "User with this email or phone already exists"
- "Seller with this email, phone, username, or CNIC already exists"

## Testing the Updates

After applying the updates, test the following:

1. Try to register a new user with an existing email - should get "Email address is already registered"
2. Try to register a new user with an existing phone - should get "Phone number is already registered"
3. Try to register a new seller with an existing username - should get "Username is already taken"
4. Try to register a new seller with an existing CNIC - should get "CNIC number is already registered"
5. Try to register with invalid formats - should get appropriate format error messages

## Notes

- The updates use `IF NOT EXISTS` clauses where appropriate to prevent errors if constraints already exist
- The constraints allow NULL values (multiple NULLs are allowed per PostgreSQL UNIQUE constraint behavior)
- All new functions are created with `SECURITY DEFINER` where appropriate
- Comments are added for documentation purposes