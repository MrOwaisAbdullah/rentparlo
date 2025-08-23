// Mock search functionality
import type { Listing } from "@/types"
import { MOCK_LISTINGS } from "./listings"

export interface SearchParams {
  query?: string
  city?: string
  category?: string
  minPrice?: string
  maxPrice?: string
}

export async function getSearchResults(params: SearchParams) {
  // Mock implementation - in real app this would call your search API
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Filter mock results based on parameters
  let results = [...MOCK_LISTINGS]

  // Filter by category
  if (params.category && params.category !== "all") {
    results = results.filter(listing => 
      listing.category.title.toLowerCase().includes(params.category!.toLowerCase())
    )
  }

  // Filter by city
  if (params.city) {
    results = results.filter(listing => 
      listing.location.city.toLowerCase().includes(params.city!.toLowerCase())
    )
  }

  // Filter by query
  if (params.query) {
    results = results.filter(listing => 
      listing.title.toLowerCase().includes(params.query!.toLowerCase()) ||
      (listing.description && 
       Array.isArray(listing.description) && 
       listing.description.some(block => 
         block.children && 
         block.children.some(child => 
           child.text && child.text.toLowerCase().includes(params.query!.toLowerCase())
         )
       )
      )
    )
  }

  // Filter by price range
  if (params.minPrice) {
    const minPrice = parseInt(params.minPrice)
    results = results.filter(listing => listing.price >= minPrice)
  }
  
  if (params.maxPrice) {
    const maxPrice = parseInt(params.maxPrice)
    results = results.filter(listing => listing.price <= maxPrice)
  }

  return {
    results: results.slice(0, 10), // Limit to 10 results
    total: results.length,
    page: 1,
    totalPages: Math.ceil(results.length / 10),
  }
}