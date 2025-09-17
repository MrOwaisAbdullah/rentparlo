import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAllListingsBySeller } from '@/lib/sanity-queries'

// GET - Fetch all listings for a specific seller
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      )
    }

    // Fetch all listings for the seller (including pending, active, etc.)
    const listings = await getAllListingsBySeller(sellerId)

    return NextResponse.json({
      success: true,
      data: {
        listings,
        total: listings.length
      }
    })

  } catch (error) {
    console.error('Error fetching seller listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller listings' },
      { status: 500 }
    )
  }
}