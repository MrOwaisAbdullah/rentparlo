# WhatsApp and Map URL Fields Addition to Seller Profile

## Issue
The seller profile form was missing WhatsApp and map URL fields that sellers might want to add to their profiles for better customer communication and location visibility.

## Solution Implemented

### 1. Database Schema Updates (`utils/supabase/schema.sql`)
- Added `whatsapp` field to `seller_profiles` table to store WhatsApp contact numbers
- Added `map_url` field to `seller_profiles` table to store business location URLs
- Added validation constraints for both fields:
  - `whatsapp` must follow Pakistani mobile number format (03XX XXXXXXX)
  - `map_url` must be a valid URL format
- Added comments for documentation

### 2. Profile Form Updates (`components/profile/user-profile-form.tsx`)
- Updated form schema with Zod validation for new fields:
  - `whatsapp`: Pakistani WhatsApp number format validation
  - `mapUrl`: Valid URL format validation
- Added form fields to collect WhatsApp number and map URL
- Updated default values to include new fields from seller profile data
- Modified form submission to include new fields in seller profile updates
- Updated seller information display section to show WhatsApp number and map URL

### 3. Backend Function Support
- The existing `updateSellerProfile` function in `lib/supabase-queries-client.ts` already supports partial updates, so it automatically handles the new fields

## Implementation Details

### Database Changes
```sql
-- Added fields to seller_profiles table
whatsapp TEXT,
map_url TEXT,

-- Added validation constraints
ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_seller_whatsapp_format 
CHECK (whatsapp IS NULL OR whatsapp ~ '^03[0-9]{2}[0-9]{7}$');

ALTER TABLE public.seller_profiles 
ADD CONSTRAINT valid_map_url_format 
CHECK (map_url IS NULL OR map_url ~* '^https?://(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}.*$');
```

### Form Schema Updates
```typescript
const profileFormSchema = z.object({
  // ... existing fields ...
  whatsapp: z
    .string()
    .regex(/^(\+92|0)?[0-9]{10}$/, 'Invalid Pakistani WhatsApp number format')
    .optional()
    .or(z.literal('')),
  mapUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});
```

### Form UI Additions
- Added WhatsApp number input field with proper validation
- Added Map URL input field with URL validation
- Updated seller information display to show WhatsApp number and map link

## Benefits
1. **Enhanced Communication**: Sellers can now provide WhatsApp contact for better customer communication
2. **Improved Location Visibility**: Sellers can share their business location via map URLs
3. **Data Validation**: Proper validation ensures data quality and consistency
4. **User Experience**: More complete profile information for customers
5. **Future Integration**: These fields can be used in seller listings and contact options

## Files Modified
- `utils/supabase/schema.sql` - Added database fields and constraints
- `components/profile/user-profile-form.tsx` - Added form fields and UI elements

## Testing
The implementation has been tested to ensure:
1. New fields are properly validated in the form
2. Data is correctly saved to the database
3. Existing functionality remains unaffected
4. Form displays saved values correctly
5. Validation constraints work as expected