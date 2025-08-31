import { createClient } from '@/utils/supabase/server';

async function testDatabaseQuery() {
  try {
    console.log('Testing database query for analytics events...');
    
    const supabase = await createClient();
    
    // Query the analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error querying analytics events:', error);
      return;
    }
    
    console.log('Recent analytics events:', data);
    
    // Count total events
    const { count, error: countError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting analytics events:', countError);
      return;
    }
    
    console.log(`Total analytics events in database: ${count}`);
    
  } catch (error) {
    console.error('Error in database query test:', error);
  }
}

testDatabaseQuery();