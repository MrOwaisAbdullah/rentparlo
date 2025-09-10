# Authentication Validation Schema Conflict Fix

## Issue
Received error: `TypeError: userRegistrationSchema.extend is not a function`

## Root Cause
There was a conflict between two validation files:
1. `lib/auth-validation.ts` - Legacy file with schema definitions
2. `lib/validations/auth.ts` - Newer, more comprehensive validation file

The `lib/auth-validation.ts` file was defining `sellerRegistrationSchema` by trying to extend `userRegistrationSchema` using `.extend()`, but there was a conflict with the schema definitions in the other file.

## Solution
Refactored `lib/auth-validation.ts` to:
1. Remove all schema definitions that were causing conflicts
2. Keep only the utility functions that other components depend on
3. Preserve backward compatibility for existing imports

## Files Modified
- `lib/auth-validation.ts` - Removed schema definitions, kept utility functions

## Files Verified
- `lib/validations/auth.ts` - Confirmed correct schema definitions
- All components importing from `lib/auth-validation.ts` - Should continue to work
- All components importing from `lib/validations/auth.ts` - Should continue to work

## Testing
After this fix, the application should:
1. Load the registration page without errors
2. Continue to validate forms using the utility functions
3. Not have conflicts between schema definitions