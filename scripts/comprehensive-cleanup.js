/**
 * Comprehensive cleanup script that handles references properly
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create client with explicit token configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production', // Hardcode to production dataset
  apiVersion: '2025-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function deleteAllDocuments() {
  console.log('Deleting all documents from production dataset...')
  
  try {
    // Get all document types in reverse dependency order
    // Delete reviews first (they reference listings)
    console.log('Deleting all review documents...')
    const reviews = await client.fetch('*[_type == "review"] { _id }')
    for (const review of reviews) {
      try {
        await client.delete(review._id)
        console.log(`Deleted review document ${review._id}`)
      } catch (error) {
        console.error(`Failed to delete review document ${review._id}:`, error.message)
      }
    }
    
    // Then listings (they reference categories)
    console.log('Deleting all listing documents...')
    const listings = await client.fetch('*[_type == "listing"] { _id }')
    for (const listing of listings) {
      try {
        await client.delete(listing._id)
        console.log(`Deleted listing document ${listing._id}`)
      } catch (error) {
        console.error(`Failed to delete listing document ${listing._id}:`, error.message)
      }
    }
    
    // Then blog posts (they reference categories)
    console.log('Deleting all blog documents...')
    const blogs = await client.fetch('*[_type == "blog"] { _id }')
    for (const blog of blogs) {
      try {
        await client.delete(blog._id)
        console.log(`Deleted blog document ${blog._id}`)
      } catch (error) {
        console.error(`Failed to delete blog document ${blog._id}:`, error.message)
      }
    }
    
    // Then banners (independent)
    console.log('Deleting all banner documents...')
    const banners = await client.fetch('*[_type == "banner"] { _id }')
    for (const banner of banners) {
      try {
        await client.delete(banner._id)
        console.log(`Deleted banner document ${banner._id}`)
      } catch (error) {
        console.error(`Failed to delete banner document ${banner._id}:`, error.message)
      }
    }
    
    // Finally categories (referenced by listings and blogs)
    console.log('Deleting all category documents...')
    const categories = await client.fetch('*[_type == "category"] { _id }')
    for (const category of categories) {
      try {
        await client.delete(category._id)
        console.log(`Deleted category document ${category._id}`)
      } catch (error) {
        console.error(`Failed to delete category document ${category._id}:`, error.message)
      }
    }
    
    console.log('All documents deleted successfully from production dataset!')
  } catch (error) {
    console.error('Failed to delete documents:', error)
  }
}

deleteAllDocuments()