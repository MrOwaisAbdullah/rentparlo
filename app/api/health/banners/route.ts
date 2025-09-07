import { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Test 1: Check if banner tables exist by querying their structure
    const tableChecks = [
      { name: 'banner_impressions', query: supabase.from('banner_impressions').select('count').limit(1) },
      { name: 'banner_clicks', query: supabase.from('banner_clicks').select('count').limit(1) },
      { name: 'banner_performance_daily', query: supabase.from('banner_performance_daily').select('count').limit(1) }
    ]
    
    const tableResults = []
    for (const check of tableChecks) {
      try {
        const { error } = await check.query
        if (error) {
          tableResults.push({ table: check.name, status: 'error', message: error.message })
        } else {
          tableResults.push({ table: check.name, status: 'success' })
        }
      } catch (err) {
        tableResults.push({ table: check.name, status: 'error', message: (err as Error).message })
      }
    }
    
    // Test 2: Check if banner functions exist
    let functionCheck = { status: 'unknown', message: '' }
    try {
      const { error } = await supabase.rpc('calculate_banner_ctr', { impressions: 100, clicks: 10 })
      if (error && error.message.includes('function "calculate_banner_ctr" does not exist')) {
        functionCheck = { status: 'error', message: 'Function does not exist' }
      } else {
        functionCheck = { status: 'success' }
      }
    } catch (err) {
      functionCheck = { status: 'error', message: (err as Error).message }
    }
    
    // Test 3: Try to insert and query a test record
    let dataCheck = { status: 'unknown', message: '' }
    const testBannerId = `health-check-${Date.now()}`
    
    try {
      // Insert test impression
      const { error: insertError } = await supabase
        .from('banner_impressions')
        .insert([{
          banner_id: testBannerId,
          placement: 'homepage-top',
          banner_size: 'leaderboard',
          user_id: null,
          guest_id: 'health-check-guest',
          session_ref: null,
          ip_address: '127.0.0.1',
          user_agent: 'Health Check Agent',
          referrer: 'https://health.check',
          city: 'Health Check City',
          device_type: 'desktop',
          browser: 'Health Check Browser',
          os: 'Health Check OS',
          screen_resolution: '1920x1080',
          viewport_size: '1200x800',
          page_url: 'https://health.check/page',
          page_title: 'Health Check Page',
          category_context: 'health-check',
          search_query: 'health check',
          created_at: new Date().toISOString()
        }])
      
      if (insertError) {
        dataCheck = { status: 'error', message: `Insert failed: ${insertError.message}` }
      } else {
        // Query the inserted record
        const { data, error: queryError } = await supabase
          .from('banner_impressions')
          .select('banner_id, placement, banner_size')
          .eq('banner_id', testBannerId)
          .limit(1)
        
        if (queryError) {
          dataCheck = { status: 'error', message: `Query failed: ${queryError.message}` }
        } else if (data && data.length > 0) {
          dataCheck = { status: 'success', data: data[0] }
          
          // Clean up test record
          await supabase
            .from('banner_impressions')
            .delete()
            .eq('banner_id', testBannerId)
        } else {
          dataCheck = { status: 'warning', message: 'No data returned from query' }
        }
      }
    } catch (err) {
      dataCheck = { status: 'error', message: (err as Error).message }
    }
    
    // Overall health check
    const allTablesExist = tableResults.every(result => result.status === 'success')
    const functionExists = functionCheck.status === 'success'
    const dataOperationsWork = dataCheck.status === 'success'
    
    const overallStatus = allTablesExist && functionExists && dataOperationsWork ? 'healthy' : 'unhealthy'
    
    return new Response(
      JSON.stringify({
        success: true,
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: {
          tables: tableResults,
          functions: functionCheck,
          data_operations: dataCheck
        },
        summary: {
          all_tables_exist: allTablesExist,
          functions_exist: functionExists,
          data_operations_work: dataOperationsWork
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      }
    )
  } catch (error) {
    console.error('Banner health check error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        error: 'Internal server error',
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