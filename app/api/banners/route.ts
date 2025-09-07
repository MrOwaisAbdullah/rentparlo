import { NextRequest } from "next/server"
import { client } from "@/sanity/lib/client"
import { AdBanner } from "@/types"
import { createClient } from "@/utils/supabase/server"

// Define the banner query with proper typing
const bannerQuery = `*[_type == "adBanner" && isActive == true && (startDate <= now() && (endDate == null || endDate >= now()))] | order(displayOrder asc) {
  _id,
  title,
  placement,
  size,
  image,
  mobileImage,
  targetUrl,
  targetLocation,
  targetCategory,
  targetUserType,
  startDate,
  endDate,
  isActive,
  displayOrder,
  clicks
}`

export async function GET(request: NextRequest) {
  try {
    // Fetch active banners from Sanity
    const banners: AdBanner[] = await client.fetch(bannerQuery)
    
    // Filter banners based on query parameters
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get("placement")
    const userType = searchParams.get("userType") || "all"
    
    let filteredBanners = banners
    
    // Filter by placement if specified
    if (placement) {
      filteredBanners = banners.filter(banner => banner.placement === placement)
    }
    
    // Filter by user type
    filteredBanners = filteredBanners.filter(banner => 
      banner.targetUserType === "all" || banner.targetUserType === userType
    )
    
    return new Response(
      JSON.stringify({
        success: true,
        banners: filteredBanners
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      }
    )
  } catch (error) {
    console.error("Error fetching banners:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch banners"
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

// Update banner click count
export async function PUT(request: NextRequest) {
  try {
    const { bannerId, type } = await request.json()
    
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

    if (type === "click") {
      // Update click count in Sanity
      const mutation = {
        mutations: [
          {
            patch: {
              id: bannerId,
              inc: {
                clicks: 1
              }
            }
          }
        ]
      }

      const response = await client.mutate(mutation)
      
      return new Response(
        JSON.stringify({
          success: true,
          data: response
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    } else if (type === "impression") {
      // Update impression count in Sanity (if you have an impressions field)
      // For now, we'll just return success
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
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid type parameter"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }
  } catch (error) {
    console.error("Error updating banner stats:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update banner stats"
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