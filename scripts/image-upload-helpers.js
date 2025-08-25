/**
 * =====================================================
 * Sanity Image Upload Helpers
 * =====================================================
 * Helper functions to upload images from public directory to Sanity
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Use a client with explicit token configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

/**
 * Upload an image file to Sanity
 */
export async function uploadImageToSanity(imagePath, filename = null) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Image file not found: ${imagePath}`)
      return null
    }
    
    const imageBuffer = fs.readFileSync(imagePath)
    const actualFilename = filename || path.basename(imagePath)
    
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: actualFilename
    })
    
    console.log(`✅ Uploaded image: ${actualFilename} -> ${asset._id}`)
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference', 
        _ref: asset._id
      },
      alt: actualFilename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
    }
    
  } catch (error) {
    console.error(`❌ Failed to upload image ${imagePath}:`, error.message)
    // Return a placeholder instead of null to prevent breaking the UI
    return {
      _type: 'image',
      asset: null,
      alt: 'Placeholder image'
    }
  }
}

/**
 * Upload multiple images for a listing
 */
export async function uploadListingImages(imagePaths) {
  const uploadedImages = []
  
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i]
    const uploadedImage = await uploadImageToSanity(imagePath)
    
    if (uploadedImage && uploadedImage.asset) {
      // Add _key for array items
      uploadedImage._key = `img_${Date.now()}_${i}`
      uploadedImages.push(uploadedImage)
    }
  }
  
  // If no images were uploaded successfully, add a placeholder
  if (uploadedImages.length === 0) {
    uploadedImages.push({
      _type: 'image',
      _key: `img_placeholder_${Date.now()}`,
      asset: null,
      alt: 'Placeholder image'
    })
  }
  
  return uploadedImages
}

/**
 * Get predefined image sets for different categories
 */
export function getImagePathsForCategory(category) {
  const publicDir = process.cwd() + '/public'
  const samplesDir = publicDir + '/samples'
  
  const imageSets = {
    'Camera': [
      samplesDir + '/camera (1).jpg',
      samplesDir + '/camera (2).jpg',
      samplesDir + '/camera (1).png',
      samplesDir + '/camera (1).webp'
    ],
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
    'Generators': [
      samplesDir + '/generator (1).jpg',
      samplesDir + '/generator (2).jpg',
      samplesDir + '/generator (3).jpg',
      samplesDir + '/generator (4).jpg',
      samplesDir + '/generator (5).jpg'
    ],
    'Wedding Couture': [
      publicDir + '/placeholder-1m49r.png',
      publicDir + '/placeholder-4jelk.png',
      publicDir + '/placeholder-51mt1.png'
    ],
    'Events': [
      publicDir + '/placeholder-8i3ps.png',
      publicDir + '/placeholder-eamrm.png'
    ],
    'Construction': [
      samplesDir + '/generator (1).png',
      publicDir + '/placeholder-1m49r.png',
      publicDir + '/placeholder-4jelk.png'
    ],
    'Studio': [
      publicDir + '/placeholder-51mt1.png',
      publicDir + '/placeholder-8i3ps.png'
    ],
    'Advertisements': [
      publicDir + '/placeholder-eamrm.png',
      publicDir + '/placeholder-1m49r.png'
    ]
  }
  
  // Filter to only existing files
  const categoryImages = imageSets[category] || []
  return categoryImages.filter(imagePath => fs.existsSync(imagePath))
}

/**
 * Upload banner images
 */
export async function uploadBannerImages() {
  const publicDir = process.cwd() + '/public'
  const bannerImages = [
    publicDir + '/camera-rental-banner.png',
    publicDir + '/bmw-3-series-luxury-car.png', 
    publicDir + '/electronics-store-banner.png',
    publicDir + '/modern-rental-pakistan.png'
  ]
  
  const uploadedBanners = []
  
  for (const imagePath of bannerImages) {
    if (fs.existsSync(imagePath)) {
      const uploadedImage = await uploadImageToSanity(imagePath)
      if (uploadedImage && uploadedImage.asset) {
        uploadedBanners.push(uploadedImage)
      }
    }
  }
  
  return uploadedBanners
}

/**
 * Generate a unique key for array items
 */
export function generateKey(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Add keys to array items that don't have them
 */
export function addKeysToArrayItems(arrayItems, keyPrefix = 'item') {
  return arrayItems.map((item, index) => ({
    ...item,
    _key: item._key || generateKey(`${keyPrefix}_${index}`)
  }))
}