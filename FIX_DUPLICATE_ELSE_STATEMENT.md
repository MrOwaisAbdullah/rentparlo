# Fix Duplicate Else Statement Syntax Error

## Issue

Build Error: Expression expected

The data-integration.ts file had a duplicate `} else {` statement that was causing a syntax error.

## Root Cause

There was a duplicate `} else {` statement in the code:
```typescript
} else {
} else {
  console.log('No seller found for listing with supabaseId:', listing.supabaseId);
}
```

This is invalid JavaScript/TypeScript syntax as you cannot have two consecutive `else` statements.

## Solution

Removed the duplicate `} else {` statement, keeping only one valid `else` block.

## Changes Made

### lib/data-integration.ts

#### Before
```typescript
} else {
} else {
  console.log('No seller found for listing with supabaseId:', listing.supabaseId); // Debugging
}
```

#### After
```typescript
} else {
  console.log('No seller found for listing with supabaseId:', listing.supabaseId); // Debugging
}
```

## Technical Details

### Error Location
- **Line 210**: Duplicate `} else {` statement causing "Expression expected" error

### Code Structure

#### Before (Invalid)
```javascript
// Invalid syntax with duplicate else
if (condition) {
  // ...
} else {
} else {  // ← This is invalid
  // ...
}
```

#### After (Valid)
```javascript
// Valid syntax with single else
if (condition) {
  // ...
} else {
  // ...
}
```

## Benefits

1. **Fixed Syntax Error**: Eliminated the "Expression expected" error preventing successful build
2. **Restored Valid JavaScript**: Code now follows proper JavaScript/TypeScript syntax rules
3. **Maintained Logic**: Preserved the intended conditional logic flow
4. **Improved Code Quality**: Clean, readable code without syntax errors

## Testing

The fix was verified to ensure:
- Syntax error is resolved
- Conditional logic remains intact
- No regression in data integration functionality
- Successful build with proper syntax
- All seller profile creation logic works correctly