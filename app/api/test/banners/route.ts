import { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client
    const supabase = createClient()
    
    // Test banner system by checking if tables exist and are accessible
    const tests = [
      {
        name: "Banner Impressions Table",
        test: async () => {
          const { count, error } = await supabase
            .from('banner_impressions')
            .select('*', { count: 'exact', head: true })
          return { success: !error, error: error?.message }
        }
      },
      {
        name: "Banner Clicks Table",
        test: async () => {
          const { count, error } = await supabase
            .from('banner_clicks')
            .select('*', { count: 'exact', head: true })
          return { success: !error, error: error?.message }
        }
      },
      {
        name: "Banner Performance Daily Table",
        test: async () => {
          const { count, error } = await supabase
            .from('banner_performance_daily')
            .select('*', { count: 'exact', head: true })
          return { success: !error, error: error?.message }
        }
      },
      {
        name: "Banner CTR Function",
        test: async () => {
          const { data, error } = await supabase.rpc('calculate_banner_ctr', { impressions: 1000, clicks: 50 })
          return { success: !error, error: error?.message, result: data }
        }
      }
    ]
    
    const results = []
    let allPassed = true
    
    for (const test of tests) {
      try {
        const result = await test.test()
        results.push({
          name: test.name,
          status: result.success ? 'pass' : 'fail',
          error: result.error,
          result: result.result
        })
        
        if (!result.success) {
          allPassed = false
        }
      } catch (error) {
        results.push({
          name: test.name,
          status: 'error',
          error: (error as Error).message
        })
        allPassed = false
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: allPassed ? 'healthy' : 'issues_detected',
        tests: results,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    console.error('Banner test error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        error: 'Failed to run banner tests',
        timestamp: new Date().toISOString()
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