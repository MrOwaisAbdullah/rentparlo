/**
 * =====================================================
 * Analytics Tracking API Route
 * =====================================================
 * Handles tracking of user interactions with listings and platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { trackAnalyticsEvent } from '@/lib/supabase-queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      listingId, 
      eventType, 
      userId, 
      additionalData 
    } = body

    // Validate required fields
    if (!listingId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId and eventType' },
        { status: 400 }
      )
    }

    // Validate event type
    const validEventTypes = [
      'view', 
      'contact_click', 
      'WhatsApp_click', 
      'share', 
      'save', 
      'search',
      'listing_click',
      'impressions'
    ]

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Get additional context from request
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor 
      ? forwardedFor.split(',')[0] 
      : request.headers.get('x-real-ip') || undefined

    // Determine device type from user agent
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    if (userAgent) {
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
      }
    }

    // Track the analytics event
    const success = await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: eventType,
      user_id: userId || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_type: deviceType,
      city: additionalData?.city,
      referrer: additionalData?.referrer,
      ...additionalData
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to track analytics event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle batch analytics tracking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }

    // Validate each event
    for (const event of events) {
      if (!event.listingId || !event.eventType) {
        return NextResponse.json(
          { error: 'Each event must have listingId and eventType' },
          { status: 400 }
        )
      }
    }

    // Get request context
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor 
      ? forwardedFor.split(',')[0] 
      : request.headers.get('x-real-ip') || undefined

    // Track all events
    const results = await Promise.all(
      events.map(event => 
        trackAnalyticsEvent({
          listing_id: event.listingId,
          event_type: event.eventType,
          user_id: event.userId || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          ...event.additionalData
        })
      )
    )

    const successCount = results.filter(Boolean).length

    return NextResponse.json({
      success: true,
      tracked: successCount,
      total: events.length
    })

  } catch (error) {
    console.error('Batch analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get analytics data for a listing (admin/seller only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const sellerId = searchParams.get('sellerId')

    if (!listingId && !sellerId) {
      return NextResponse.json(
        { error: 'Either listingId or sellerId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user can access analytics (seller can only see their own)
    if (sellerId && sellerId !== user.id) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    let query = supabase
      .from('analytics_events')
      .select('*')

    if (listingId) {
      query = query.eq('listing_id', listingId)
    }

    if (sellerId) {
      query = query.eq('user_id', sellerId)
    }

    // Add date range filter if provided
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Aggregate the data
    const aggregated = {
      totalEvents: data.length,
      eventTypes: {} as Record<string, number>,
      deviceTypes: {} as Record<string, number>,
      dailyStats: {} as Record<string, number>,
      hourlyStats: {} as Record<string, number>
    }

    data.forEach(event => {
      // Count by event type
      aggregated.eventTypes[event.event_type] = 
        (aggregated.eventTypes[event.event_type] || 0) + 1

      // Count by device type
      if (event.device_type) {
        aggregated.deviceTypes[event.device_type] = 
          (aggregated.deviceTypes[event.device_type] || 0) + 1
      }

      // Daily stats
      const date = new Date(event.created_at).toISOString().split('T')[0]
      aggregated.dailyStats[date] = (aggregated.dailyStats[date] || 0) + 1

      // Hourly stats
      const hour = new Date(event.created_at).getHours()
      aggregated.hourlyStats[hour] = (aggregated.hourlyStats[hour] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: aggregated,
      rawEvents: data.slice(0, 100) // Return latest 100 events
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}