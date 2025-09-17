# Colored Badges for Seller Verification Status and Tier

## Issue
The verification status and tier information in the seller profile section were displayed as plain text without any visual styling or color coding. This made it difficult for users to quickly understand their status at a glance.

## Solution
Added styled badge components with appropriate colors for both verification status and tier information to improve visual clarity and user experience.

## Changes Made

### 1. Updated UserProfileForm Component
Modified `components/profile/user-profile-form.tsx` to:
- Import the existing `Badge` component from `@/components/ui/badge`
- Add helper functions to determine appropriate badge variants based on status values
- Replace plain text displays with styled badges for verification status and tier

### 2. Verification Status Badge Colors
Implemented color coding based on verification status:
- **Approved**: Green badge (default variant)
- **Pending/Under Review**: Yellow badge (secondary variant)
- **Rejected/Resubmit Required**: Red badge (destructive variant)
- **Other/Not Set**: Gray badge (outline variant)

### 3. Tier Badge Colors
Implemented color coding based on seller tier:
- **Platinum/Gold**: Primary color badge (default variant)
- **Silver/Bronze**: Secondary color badge (secondary variant)
- **Basic/Not Set**: Outline badge (outline variant)

### 4. Helper Functions
Added two helper functions:
- `getVerificationBadgeVariant(status: string)` - Returns appropriate badge variant for verification status
- `getTierBadgeVariant(tier: string)` - Returns appropriate badge variant for seller tier

## Implementation Details

### Verification Status Badge
```tsx
<Badge variant={getVerificationBadgeVariant(sellerProfile.verification_status)}>
  {sellerProfile.verification_status ? 
    sellerProfile.verification_status.charAt(0).toUpperCase() + 
    sellerProfile.verification_status.slice(1).replace('_', ' ') : 
    'Not set'}
</Badge>
```

### Tier Badge
```tsx
<Badge variant={getTierBadgeVariant(sellerProfile.tier)}>
  {sellerProfile.tier ? 
    sellerProfile.tier.charAt(0).toUpperCase() + 
    sellerProfile.tier.slice(1) : 
    'Not set'}
</Badge>
```

## Benefits
1. **Improved Visual Hierarchy**: Status information is now more visually prominent
2. **Quick Recognition**: Users can instantly understand their status through color coding
3. **Consistent Design**: Uses existing UI components for a cohesive look and feel
4. **Better UX**: Enhances user experience by making important information more accessible

## Testing
The implementation has been tested with various status values to ensure:
- Correct color coding for all verification statuses
- Appropriate badge styling for all tier levels
- Proper text formatting and capitalization
- Responsive design that works on all screen sizes

## Files Modified
- `components/profile/user-profile-form.tsx` - Added badge components and helper functions