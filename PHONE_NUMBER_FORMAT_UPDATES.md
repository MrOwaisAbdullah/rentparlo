# Phone Number Format Validation Updates

## Issue
The phone number and WhatsApp number validation patterns were only accepting the format `03XXXXXXXXX` but should also accept `+923XXXXXXXXX` format.

## Changes Made

### 1. Profile Form Validation (`components/profile/user-profile-form.tsx`)
- Updated regex pattern from `/^(\+92|0)?[0-9]{10}$/` to `/^(\+92|0)?3[0-9]{9}$/`
- This ensures numbers start with either +92 or 0 followed by 3 and then 9 digits

### 2. Database Constraints (`utils/supabase/schema.sql`)
- Updated phone validation constraint from `^03[0-9]{2}[0-9]{7}$` to `^(\+92|0)?3[0-9]{9}$`
- Added WhatsApp validation constraint with same pattern: `^(\+92|0)?3[0-9]{9}$`

### 3. Onboarding Form (Already Correct)
- The onboarding form was already using the correct pattern: `/^(\+92|0)?3[0-9]{9}$/`

## Validation Pattern Explanation
The new regex pattern `^(\+92|0)?3[0-9]{9}$` accepts:
- Optional country code: `(\+92|0)?` - either +92 or 0, or neither
- Required prefix: `3` - must start with 3
- Required digits: `[0-9]{9}` - exactly 9 more digits
- Total of 10 digits after the prefix

## Examples of Valid Numbers
- `03262283140`
- `+923262283140`
- `3262283140`

## Files Modified
- `components/profile/user-profile-form.tsx` - Updated form validation
- `utils/supabase/schema.sql` - Updated database constraints

## Testing
The updated validation has been tested with both formats to ensure:
1. Both +923XXXXXXXXX and 03XXXXXXXXX formats are accepted
2. Invalid formats are properly rejected
3. Existing functionality remains unaffected