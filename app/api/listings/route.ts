/**
 * =====================================================
 * Listing Management API Route
 * =====================================================
 * Handles CRUD operations for listings in Sanity CMS
 * with Supabase authentication and user validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { client as sanityClient } from '@/lib/sanity'
import { 
  createListing, 
  updateListing, 
  deleteListing,
  getListingsByCategory,
  searchListings
} from '@/lib/sanity-queries'
import { validateListingData } from '@/lib/data-integration'
import { getUserActiveSubscription } from '@/lib/supabase-queries'
import { EnhancedUserSubscription } from '@/types'

// GET - Fetch listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city') || ''
    const area = searchParams.get('area') || ''
    const condition = searchParams.get('condition') || ''
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '0')
    const sort = searchParams.get('sort') || 'featured'
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sellerId = searchParams.get('sellerId') // For seller's own listings

    // Build search parameters
    const searchParams_obj = {
      query,
      category,
      city,
      area,
      condition,
      minPrice,
      maxPrice,
      offset,
      limit
    }

    // Fetch listings from Sanity
    const listings = await searchListings(searchParams_obj)

    // Filter by seller if requested
    const filteredListings = sellerId 
      ? listings.filter(listing => listing.supabaseId === sellerId)
      : listings

    // Sort results
    let sortedListings = [...filteredListings]
    switch (sort) {
      case 'price-low':
        sortedListings.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedListings.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        sortedListings.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        break
      case 'featured':
      default:
        sortedListings.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        })
    }

    return NextResponse.json({
      success: true,
      data: {
        listings: sortedListings,
        total: filteredListings.length,
        filters: searchParams_obj
      }
    })

  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is a seller
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'seller' && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only sellers can create listings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate listing data
    const validation = validateListingData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    // Check subscription limits
    const subscription: EnhancedUserSubscription | null = await getUserActiveSubscription(user.id)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Active subscription required to create listings' },
        { status: 403 }
      )
    }

    // Count current active listings
    const currentListings = await searchListings({
      query: '',
      category: '',
      city: '',
      condition: '',
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 1000
    })

    const userListings = currentListings.filter(
      listing => listing.supabaseId === user.id && listing.status === 'active'
    )

    // Access max_listings from the subscription package data
    const maxListings = subscription.subscription_packages?.max_listings || 0;
    
    if (userListings.length >= maxListings) {
      return NextResponse.json(
        { 
          error: `Listing limit reached. Your current plan allows ${maxListings} listings.`,
          currentCount: userListings.length,
          maxAllowed: maxListings
        },
        { status: 403 }
      )
    }

    // Prepare listing data for Sanity
    const listingData = {
      ...body,
      supabaseId: user.id,
      status: 'pending', // Start as pending for review
      published: false,
      isFeatured: false, // Can be set later based on subscription
      isVerified: false, // Requires admin approval
      _type: 'listing'
    }

    // Generate slug if not provided
    if (!listingData.slug) {
      const slugBase = listingData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 80)
      
      listingData.slug = {
        current: `${slugBase}-${Date.now()}`
      }
    }

    // Create listing in Sanity
    const newListing = await createListing(listingData)

    if (!newListing) {
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newListing
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

// PUT - Update existing listing
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, ...updates } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Get existing listing to check ownership
    const existingListing = await sanityClient.getDocument(listingId)
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check ownership (sellers can only edit their own listings)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (existingListing.supabaseId !== user.id && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only edit your own listings' },
        { status: 403 }
      )
    }

    // Validate updated data
    const mergedData = { ...existingListing, ...updates }
    const validation = validateListingData(mergedData)
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    // Update listing in Sanity
    const updatedListing = await updateListing(listingId, {
      ...updates,
      _updatedAt: new Date().toISOString()
    })

    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedListing
    })

  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE - Delete listing
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('id')

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Get existing listing to check ownership
    const existingListing = await sanityClient.getDocument(listingId)
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check ownership
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (existingListing.supabaseId !== user.id && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      )
    }

    // Delete listing from Sanity
    const result = await deleteListing(listingId)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}