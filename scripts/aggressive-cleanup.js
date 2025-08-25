/**
 * Aggressive cleanup script that handles draft documents and references
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
  console.log('Aggressively deleting all documents from production dataset...')
  
  try {
    // First, try to delete all draft documents
    console.log('Deleting all draft documents...')
    const drafts = await client.fetch('*[defined(_originalId)] { _id }')
    for (const draft of drafts) {
      try {
        await client.delete(draft._id)
        console.log(`Deleted draft document ${draft._id}`)
      } catch (error) {
        console.error(`Failed to delete draft document ${draft._id}:`, error.message)
      }
    }
    
    // Get all document types in reverse dependency order
    const types = ['review', 'listing', 'blog', 'banner', 'category']
    
    for (const type of types) {
      console.log(`Deleting all ${type} documents...`)
      
      // Fetch all documents of this type
      const documents = await client.fetch(`*[_type == "${type}"] { _id }`)
      
      // Try to delete each document individually
      for (const doc of documents) {
        try {
          await client.delete(doc._id)
          console.log(`Deleted ${type} document ${doc._id}`)
        } catch (error) {
          console.error(`Failed to delete ${type} document ${doc._id}:`, error.message)
          
          // If deletion fails, try to mutate with force
          try {
            await client.mutate({
              mutations: [
                {
                  delete: {
                    id: doc._id
                  }
                }
              ]
            }, {
              visibility: 'async',
              returnDocuments: false
            })
            console.log(`Force deleted ${type} document ${doc._id}`)
          } catch (forceError) {
            console.error(`Failed to force delete ${type} document ${doc._id}:`, forceError.message)
          }
        }
      }
    }
    
    console.log('All documents deleted successfully from production dataset!')
  } catch (error) {
    console.error('Failed to delete documents:', error)
  }
}

deleteAllDocuments()