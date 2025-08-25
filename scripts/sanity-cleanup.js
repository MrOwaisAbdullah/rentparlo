/**
 * =====================================================
 * RentParlo.pk Sanity Cleanup Script
 * =====================================================
 * This script removes all existing data from Sanity to prepare for fresh seeding
 * 
 * ⚠️  IMPORTANT SEEDING ORDER  ⚠️
 * 1. First run the Supabase seeding script to create users in auth.users
 * 2. Then run this cleanup script to remove any existing Sanity data
 * 3. Finally run the Sanity seeding script
 * 
 * Run this using Sanity CLI: npx sanity exec scripts/sanity-cleanup.js --with-user-token
 */

import { createClient } from '@sanity/client'

// Create client with explicit token configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

/**
 * Delete all draft documents
 */
async function deleteDraftDocuments() {
  console.log('🗑️  Deleting all draft documents...')
  
  try {
    // Fetch all draft documents
    const query = `*[defined(_originalId)] { _id }`
    const documents = await client.fetch(query)
    
    if (documents.length === 0) {
      console.log('   No draft documents found')
      return 0
    }
    
    console.log(`   Found ${documents.length} draft documents`)
    
    // Delete documents in batches to avoid timeouts
    let deletedCount = 0
    const batchSize = 50
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      const transaction = client.transaction()
      
      batch.forEach(doc => {
        transaction.delete(doc._id)
      })
      
      try {
        await transaction.commit({ visibility: 'async' })
        deletedCount += batch.length
        console.log(`   ✅ Successfully deleted batch of ${batch.length} draft documents (${deletedCount}/${documents.length})`)
      } catch (batchError) {
        console.error(`   ❌ Failed to delete batch of draft documents:`, batchError.message)
        // Try to delete individually if batch fails
        for (const doc of batch) {
          try {
            await client.delete(doc._id)
            deletedCount++
            console.log(`   ✅ Successfully deleted draft document ${doc._id} (${deletedCount}/${documents.length})`)
          } catch (individualError) {
            console.error(`   ❌ Failed to delete draft document ${doc._id}:`, individualError.message)
          }
        }
      }
    }
    
    console.log(`   ✅ Successfully deleted ${deletedCount} draft documents`)
    return deletedCount
    
  } catch (error) {
    console.error('   ❌ Failed to delete draft documents:', error.message)
    return 0
  }
}

/**
 * Delete all documents of a specific type
 */
async function deleteDocumentsByType(type) {
  console.log(`🗑️  Deleting all documents of type: ${type}`)
  
  try {
    // Fetch all documents of this type
    const query = `*[_type == "${type}"] { _id }`
    const documents = await client.fetch(query)
    
    if (documents.length === 0) {
      console.log(`   No ${type} documents found`)
      return 0
    }
    
    console.log(`   Found ${documents.length} ${type} documents`)
    
    // Delete documents in batches to avoid timeouts
    let deletedCount = 0
    const batchSize = 50
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      const transaction = client.transaction()
      
      batch.forEach(doc => {
        transaction.delete(doc._id)
      })
      
      try {
        await transaction.commit({ visibility: 'async' })
        deletedCount += batch.length
        console.log(`   ✅ Successfully deleted batch of ${batch.length} ${type} documents (${deletedCount}/${documents.length})`)
      } catch (batchError) {
        console.error(`   ❌ Failed to delete batch of ${type} documents:`, batchError.message)
        // Try to delete individually if batch fails
        for (const doc of batch) {
          try {
            await client.delete(doc._id)
            deletedCount++
            console.log(`   ✅ Successfully deleted ${type} document ${doc._id} (${deletedCount}/${documents.length})`)
          } catch (individualError) {
            console.error(`   ❌ Failed to delete ${type} document ${doc._id}:`, individualError.message)
          }
        }
      }
    }
    
    console.log(`   ✅ Successfully deleted ${deletedCount} ${type} documents`)
    return deletedCount
    
  } catch (error) {
    console.error(`   ❌ Failed to delete ${type} documents:`, error.message)
    return 0
  }
}

/**
 * Delete all images that are no longer referenced
 */
async function deleteUnusedAssets() {
  console.log('🖼️  Deleting unused image assets...')
  
  try {
    // This query finds all image assets that are not referenced by any document
    const unusedAssetsQuery = `*[_type == "sanity.imageAsset" && !defined(*[references(^._id)][0])]`
    const unusedAssets = await client.fetch(unusedAssetsQuery)
    
    if (unusedAssets.length === 0) {
      console.log('   No unused assets found')
      return 0
    }
    
    console.log(`   Found ${unusedAssets.length} unused assets`)
    
    // Delete unused assets in batches to avoid timeouts
    let deletedCount = 0
    const batchSize = 50
    
    for (let i = 0; i < unusedAssets.length; i += batchSize) {
      const batch = unusedAssets.slice(i, i + batchSize)
      const transaction = client.transaction()
      
      batch.forEach(asset => {
        transaction.delete(asset._id)
      })
      
      try {
        await transaction.commit({ visibility: 'async' })
        deletedCount += batch.length
        console.log(`   ✅ Successfully deleted batch of ${batch.length} unused assets (${deletedCount}/${unusedAssets.length})`)
      } catch (batchError) {
        console.error(`   ❌ Failed to delete batch of unused assets:`, batchError.message)
        // Try to delete individually if batch fails
        for (const asset of batch) {
          try {
            await client.delete(asset._id)
            deletedCount++
            console.log(`   ✅ Successfully deleted asset ${asset._id} (${deletedCount}/${unusedAssets.length})`)
          } catch (individualError) {
            console.error(`   ❌ Failed to delete asset ${asset._id}:`, individualError.message)
          }
        }
      }
    }
    
    console.log(`   ✅ Successfully deleted ${deletedCount} unused assets`)
    return deletedCount
    
  } catch (error) {
    console.error('   ❌ Failed to delete unused assets:', error.message)
    return 0
  }
}

/**
 * Main cleanup function
 */
async function cleanupSanity() {
  console.log('🧹 Starting Sanity cleanup process...\n')
  
  const deletionStats = {
    drafts: 0,
    reviews: 0,
    listings: 0,
    blogs: 0,
    banners: 0,
    categories: 0,
    assets: 0
  }
  
  try {
    // Delete draft documents first
    deletionStats.drafts = await deleteDraftDocuments()
    
    // Wait a moment for references to clear
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Delete in reverse dependency order
    // Reviews first (they reference listings)
    deletionStats.reviews = await deleteDocumentsByType('review')
    
    // Then listings (they reference categories)
    deletionStats.listings = await deleteDocumentsByType('listing')
    
    // Blog posts (they reference categories)
    deletionStats.blogs = await deleteDocumentsByType('blog')
    
    // Banners (independent)
    deletionStats.banners = await deleteDocumentsByType('banner')
    
    // Categories last (referenced by listings and blogs)
    deletionStats.categories = await deleteDocumentsByType('category')
    
    // Wait a moment for references to clear
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Clean up unused assets
    deletionStats.assets = await deleteUnusedAssets()
    
    console.log('\n🎉 Cleanup completed successfully!')
    console.log('\nDeletion Summary:')
    console.log(`- Drafts: ${deletionStats.drafts}`)
    console.log(`- Reviews: ${deletionStats.reviews}`)
    console.log(`- Listings: ${deletionStats.listings}`)
    console.log(`- Blog Posts: ${deletionStats.blogs}`)
    console.log(`- Banners: ${deletionStats.banners}`)
    console.log(`- Categories: ${deletionStats.categories}`)
    console.log(`- Unused Assets: ${deletionStats.assets}`)
    
    const totalDeleted = Object.values(deletionStats).reduce((sum, count) => sum + count, 0)
    console.log(`\nTotal documents/assets deleted: ${totalDeleted}`)
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Execute cleanup
cleanupSanity()