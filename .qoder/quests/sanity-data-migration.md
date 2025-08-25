# Sanity Data Migration Design Document

## 1. Overview

This document outlines the design and implementation plan for migrating Sanity CMS data to address several key issues:

1. Replace placeholder images with actual sample images from the `public/samples` directory
2. Update categories to match the actual categories defined in `lib/categories.ts`
3. Modify the listing description field from Portable Text to a simple text field
4. Deploy the updated Sanity schema

The migration will involve updating the Sanity schema, modifying the seeding scripts to use real data, and then clearing and re-seeding the CMS with the corrected data.

## 2. Current Issues

### 2.1 Image Issues
- Current seeding script uses placeholder images instead of actual product images
- Sample images exist in `public/samples` but are not being utilized properly

### 2.2 Category Issues
- Current seeding script creates its own categories instead of using the actual categories from `lib/categories.ts`
- Need to align Sanity categories with the frontend category system

### 2.3 Schema Issues
- Listing description field is currently a Portable Text field (array of blocks)
- Requirement is to change it to a simple text field for easier management

## 3. Solution Architecture

### 3.1 Image Migration Process
```
[Sample Images in public/samples] 
        ↓
[Image Upload Helpers] 
        ↓
[Sanity Asset Upload] 
        ↓
[Listing Creation with Real Images]
```

### 3.2 Category Migration Process
```
[lib/categories.ts Data]
        ↓
[Category Schema Mapping]
        ↓
[Sanity Category Creation]
```

### 3.3 Schema Migration Process
```
[Listing Schema Update]
        ↓
[Sanity Schema Deployment]
        ↓
[Data Migration/Recreation]
```

## 4. Detailed Implementation Plan

### 4.1 Schema Modification

#### 4.1.1 Update Listing Schema
Modify `sanity/SchemaTypes/listing.ts` to change the description field:

```typescript
// Current implementation (lines 30-36)
defineField({
  name: 'description',
  title: 'Description',
  type: 'array',
  of: [{type: 'block'}],
  validation: Rule => Rule.required().min(1),
})

// New implementation
defineField({
  name: 'description',
  title: 'Description',
  type: 'text',
  validation: Rule => Rule.required().min(50).max(2000),
})
```

#### 4.1.2 Deploy Updated Schema
Use Sanity CLI to deploy the updated schema:
```bash
npx sanity schema extract
npx sanity schema deploy
```

### 4.2 Image Handling Improvements

#### 4.2.1 Update Image Mapping
Modify `scripts/image-upload-helpers.js` to properly map categories to sample images. The updated mapping should align with the categories in `lib/categories.ts`:

```javascript
const imageSets = {
  'Automobiles': [
    samplesDir + '/car (1).jpg',
    samplesDir + '/car (2).jpg',
    samplesDir + '/car (3).jpg',
    samplesDir + '/car (4).jpg',
    samplesDir + '/car (5).jpg',
    samplesDir + '/car (6).jpg'
  ],
  'Medical': [
    samplesDir + '/medical (1).jpg',
    samplesDir + '/medical (2).jpg',
    samplesDir + '/medical (3).jpg',
    samplesDir + '/medical (4).jpg',
    samplesDir + '/medical (5).jpg',
    samplesDir + '/medical (6).jpg'
  ],
  'Camera': [
    samplesDir + '/camera (1).jpg',
    samplesDir + '/camera (2).jpg',
    samplesDir + '/camera (1).png',
    samplesDir + '/camera (1).webp'
  ],
  'Generators': [
    samplesDir + '/generator (1).jpg',
    samplesDir + '/generator (2).jpg',
    samplesDir + '/generator (3).jpg',
    samplesDir + '/generator (4).jpg',
    samplesDir + '/generator (5).jpg'
  ],
  'Wedding Couture': [
    // Currently no specific images available, use placeholder logic
  ],
  'Events': [
    // Currently no specific images available, use placeholder logic
  ],
  'Construction': [
    // Currently no specific images available, use placeholder logic
    samplesDir + '/generator (1).png'
  ],
  'Studio': [
    // Currently no specific images available, use placeholder logic
  ],
  'Advertisements': [
    // Currently no specific images available, use placeholder logic
  ]
}
```

### 4.3 Category Alignment

#### 4.3.1 Update Category Creation
Modify `scripts/sanity-seed.js` to use categories from `lib/categories.ts` instead of hardcoded categories:

```javascript
// Import categories from lib/categories.ts
import { CATEGORIES } from '../lib/categories.js'

// Create categories based on the imported data
const categoryData = CATEGORIES.map((category) => ({
  _type: 'category',
  title: category.title,
  slug: { current: category.slug },
  description: category.description,
  order: category.order,
  popular: category.popular || false
}))
```

### 4.4 Listing Description Update

#### 4.4.1 Update Listing Creation
Modify `scripts/sanity-seed.js` to use simple text descriptions instead of Portable Text blocks:

```javascript
// Current implementation (example from lines 245-255)
description: [
  {
    _type: 'block',
    _key: generateKey('desc_block'),
    children: [{ 
      _type: 'span', 
      _key: generateKey('desc_span'),
      text: 'Professional grade camera perfect for photography and videography projects. High resolution sensor with excellent low light performance. Includes 24-70mm f/2.8 lens, battery charger, and carrying case.' 
    }]
  }
]

// New implementation
description: 'Professional grade camera perfect for photography and videography projects. High resolution sensor with excellent low light performance. Includes 24-70mm f/2.8 lens, battery charger, and carrying case. Perfect for weddings, events, and professional shoots. Equipment is well-maintained and comes with a full warranty.'
```

## 5. Migration Workflow

### 5.1 Pre-Migration Steps
1. Backup existing Sanity data
2. Validate Supabase user data exists
3. Verify environment variables are set correctly

### 5.2 Migration Steps

#### Step 1: Reset Existing Data
```bash
npm run reset:sanity
```

#### Step 2: Update Sanity Schema
1. Modify `sanity/SchemaTypes/listing.ts` to change description field
2. Deploy updated schema:
   ```bash
   npx sanity schema deploy
   ```

#### Step 3: Seed Updated Data
```bash
npm run seed:sanity
```

### 5.3 Post-Migration Validation
1. Verify all categories are created correctly
2. Verify listings have real images instead of placeholders
3. Verify listing descriptions are simple text fields
4. Test frontend display of new data

## 6. Data Models

### 6.1 Updated Listing Schema
```typescript
export default defineType({
  name: 'listing',
  title: 'Listing',
  type: 'document',
  fields: [
    // ... other fields
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required().min(50).max(2000),
    }),
    // ... other fields
  ]
})
```

### 6.2 Category Mapping
| Current Sanity Category | New Category from lib/categories.ts |
|-------------------------|------------------------------------|
| Camera & Photography    | Camera                             |
| Automobiles             | Automobiles                        |
| Medical Equipment       | Medical                            |
| Construction Tools      | Construction                       |
| Electronics             | (Not in new categories)            |
| Home Appliances         | (Not in new categories)            |
| Sports Equipment        | (Not in new categories)            |
| Musical Instruments     | (Not in new categories)            |

## 7. Migration Script Modifications

### 7.1 Updated sanity-seed.js
Key changes needed:
1. Import categories from `lib/categories.ts`
2. Update image mapping to use actual sample images
3. Change description field from Portable Text to simple text
4. Update category references in listings

### 7.2 Updated image-upload-helpers.js
Key changes needed:
1. Update `getImagePathsForCategory` to match new category names
2. Ensure all sample images in `public/samples` are properly mapped

## 8. Testing Plan

### 8.1 Schema Validation
- [ ] Verify listing schema deploys successfully
- [ ] Verify category schema is unchanged
- [ ] Verify no validation errors in Studio
- [ ] Verify the description field is now of type 'text' instead of 'array'

### 8.2 Data Validation
- [ ] Verify all 9 categories from `lib/categories.ts` are created
- [ ] Verify listings have real images from `public/samples`
- [ ] Verify listing descriptions are simple text (not blocks)
- [ ] Verify category references in listings are correct
- [ ] Verify all image assets are properly uploaded and referenced
- [ ] Verify no orphaned assets remain in the dataset

### 8.3 Frontend Validation
- [ ] Verify category pages display correctly
- [ ] Verify listing detail pages display correctly
- [ ] Verify images load properly
- [ ] Verify search and filtering work as expected
- [ ] Verify listing descriptions display correctly without formatting issues
- [ ] Verify all categories from `lib/categories.ts` appear in the navigation

### 8.4 Performance Validation
- [ ] Verify seeding process completes within reasonable time
- [ ] Verify no rate limiting issues with image uploads
- [ ] Verify asset cleanup removes unused images
- [ ] Verify frontend performance is not degraded by image loading

## 9. Rollback Plan

If migration fails:
1. Revert schema changes to `sanity/SchemaTypes/listing.ts`
2. Redeploy original schema:
   ```bash
   npx sanity schema deploy
   ```
3. Run original seeding script:
   ```bash
   npm run seed:sanity
   ```

## 10. Performance Considerations

1. Image uploads should be batched to avoid API rate limits
2. Asset cleanup should remove unused images to save storage
3. Seeding process should provide progress indicators for long-running operations
4. Error handling should be robust to prevent partial data states

## 10. Error Handling and Troubleshooting

### Common Issues and Solutions
1. **Schema Deployment Failures**:
   - Check that all required fields have proper validation rules
   - Ensure no circular references in document relationships
   - Verify all referenced document types exist

2. **Image Upload Failures**:
   - Verify file paths in `public/samples` are correct
   - Check that image files are not corrupted
   - Ensure Sanity API token has asset upload permissions

3. **Data Seeding Failures**:
   - Verify Supabase users exist before seeding Sanity data
   - Check that category references match created categories
   - Ensure environment variables are properly set

4. **Frontend Display Issues**:
   - Verify GROQ queries match updated schema
   - Check that frontend components handle text descriptions instead of Portable Text
   - Ensure image components properly render uploaded assets

## 11. Security Considerations

1. Ensure Sanity API token has appropriate permissions
2. Validate all file paths to prevent directory traversal
3. Sanitize all text inputs to prevent injection attacks
4. Verify uploaded assets are properly referenced to prevent orphaned files

## 12. Conclusion

This migration process will resolve the key issues with the current Sanity data:

1. **Improved Data Quality**: Real product images will replace placeholder images, providing a better user experience
2. **Consistency**: Categories will align with the frontend implementation, ensuring consistency across the platform
3. **Simplified Management**: Text descriptions will be easier to manage than Portable Text blocks
4. **Better Performance**: Proper image handling and asset cleanup will improve performance

The migration should be performed during a maintenance window to minimize impact on users. After completion, all frontend functionality should be thoroughly tested to ensure compatibility with the updated schema.