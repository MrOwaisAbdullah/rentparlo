# CNIC Format Validation Updates

## Issue
The CNIC validation was only accepting the formatted version (XXXXX-XXXXXXX-X) but should also accept the unformatted version (XXXXXXXXXXXXX).

## Changes Made

### 1. Onboarding Form Validation (`components/auth/onboarding-direct.tsx`)
- Updated regex pattern from `/^\d{5}-\d{7}-\d{1}$/` to `/^(\d{5}-\d{7}-\d{1}|\d{13})$/`
- Error message updated to reflect both formats: "CNIC must be in format XXXXX-XXXXXXX-X or XXXXXXXXXXXXX"

### 2. Database Constraints (`utils/supabase/schema.sql`)
- Updated CNIC validation constraint from `^[0-9]{5}-[0-9]{7}-[0-9]{1}$` to `^([0-9]{5}-[0-9]{7}-[0-9]{1}|[0-9]{13})$`
- Updated comment to reflect both formats: "Validates Pakistani CNIC format (XXXXX-XXXXXXX-X or XXXXXXXXXXXXX)"

## Validation Pattern Explanation
The new regex pattern `^(\d{5}-\d{7}-\d{1}|\d{13})$` accepts:
- Either the formatted version: `\d{5}-\d{7}-\d{1}` (5 digits, dash, 7 digits, dash, 1 digit)
- Or the unformatted version: `\d{13}` (13 consecutive digits)

## Examples of Valid CNIC Numbers
- `42301-3699222-3` (formatted)
- `4230136992223` (unformatted)

## Files Modified
- `components/auth/onboarding-direct.tsx` - Updated form validation
- `utils/supabase/schema.sql` - Updated database constraint

## Testing
The updated validation has been tested with both formats to ensure:
1. Both formatted and unformatted CNIC numbers are accepted
2. Invalid formats are properly rejected
3. Existing functionality remains unaffected