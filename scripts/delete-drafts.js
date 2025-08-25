/**
 * Script to delete all draft documents from Sanity
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

async function deleteDraftDocuments() {
  console.log('Deleting all draft documents...')
  
  try {
    // Fetch all draft documents
    const query = `*[defined(_originalId)] { _id }`
    const documents = await client.fetch(query)
    
    if (documents.length === 0) {
      console.log('No draft documents found')
      return
    }
    
    console.log(`Found ${documents.length} draft documents`)
    
    // Delete documents one by one
    let deletedCount = 0
    for (const doc of documents) {
      try {
        await client.delete(doc._id)
        deletedCount++
        console.log(`Deleted draft document ${doc._id} (${deletedCount}/${documents.length})`)
      } catch (error) {
        console.error(`Failed to delete draft document ${doc._id}:`, error.message)
      }
    }
    
    console.log(`Deleted ${deletedCount} draft documents`)
  } catch (error) {
    console.error('Failed to delete draft documents:', error)
  }
}

deleteDraftDocuments()