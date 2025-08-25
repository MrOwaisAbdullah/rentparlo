/**
 * Script to delete all documents from Sanity
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create client with explicit token configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function deleteAllDocuments() {
  console.log('Deleting all documents...')
  
  try {
    // Get all document types
    const types = ['listing', 'category', 'blog', 'banner', 'review']
    
    for (const type of types) {
      console.log(`Deleting all ${type} documents...`)
      
      // Fetch all documents of this type
      const query = `*[_type == "${type}"] { _id }`
      const documents = await client.fetch(query)
      
      if (documents.length === 0) {
        console.log(`No ${type} documents found`)
        continue
      }
      
      console.log(`Found ${documents.length} ${type} documents`)
      
      // Delete documents one by one
      let deletedCount = 0
      for (const doc of documents) {
        try {
          await client.delete(doc._id)
          deletedCount++
          console.log(`Deleted ${type} document ${doc._id} (${deletedCount}/${documents.length})`)
        } catch (error) {
          console.error(`Failed to delete ${type} document ${doc._id}:`, error.message)
        }
      }
      
      console.log(`Deleted ${deletedCount} ${type} documents`)
    }
    
    console.log('All documents deleted successfully!')
  } catch (error) {
    console.error('Failed to delete documents:', error)
  }
}

deleteAllDocuments()