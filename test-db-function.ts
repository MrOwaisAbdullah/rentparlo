import { createClient } from './utils/supabase/server';

async function testDbFunction() {
  try {
    const supabase = await createClient();
    
    // Test the get_seller_analytics function
    const { data, error } = await supabase.rpc('get_seller_analytics', { 
      seller_id: '00000000-0000-0000-0000-000000000000' // Test with a dummy seller ID
    });
    
    console.log('Database function result:', data);
    console.log('Database function error:', error);
  } catch (error) {
    console.error('Error testing database function:', error);
  }
}

testDbFunction();