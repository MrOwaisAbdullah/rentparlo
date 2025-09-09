import { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { bannerId, placement, bannerSize, targetUrl, ...trackingData } = await request.json()
    
    if (!bannerId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Banner ID is required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Get Supabase client
    const supabase = await createClient()
    
    // Get user and session information
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    
    // Get IP address and user agent
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || ''
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''
    
    // Insert click data into Supabase
    const { error } = await supabase
      .from('banner_clicks')
      .insert([{
        banner_id: bannerId,
        placement: placement,
        banner_size: bannerSize,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        target_url: targetUrl,
        ...trackingData,
        created_at: new Date().toISOString()
      }])
    
    if (error) {
      console.error("Error tracking banner click:", error)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to track banner click"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Also update the main banners API for backward compatibility
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/banners`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bannerId, type: "click" })
      })

      const data = await response.json()
    } catch (updateError) {
      console.error("Error updating banner stats in Sanity:", updateError)
      // Continue even if Sanity update fails
    }
    
    return new Response(
      JSON.stringify({
        success: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    console.error("Error tracking banner click:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to track banner click"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  }
}