// Simple script to test database connection and query subscription packages
const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection by fetching subscription packages
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching subscription packages:', error);
      return;
    }

    console.log('Subscription packages found:', data);
    
    // Try to find the Basic package specifically
    const { data: basicPackage, error: basicError } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('name', 'Basic')
      .eq('is_active', true)
      .single();

    if (basicError) {
      console.error('Error fetching Basic package:', basicError);
    } else {
      console.log('Basic package:', basicPackage);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();