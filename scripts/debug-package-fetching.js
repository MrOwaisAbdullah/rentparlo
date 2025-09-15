// Debug script to check subscription package fetching
const { createClient } = require('@supabase/supabase-js');

// Use your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPackageFetching() {
  console.log('Debugging subscription package fetching...');
  
  // Test 1: Exact match query
  console.log('\n1. Testing exact match query:');
  const { data: exactMatch, error: exactError } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('name', 'Basic')
    .eq('is_active', true)
    .single();
    
  console.log('Exact match result:', exactMatch);
  if (exactError) {
    console.log('Exact match error:', exactError);
    
    // Test 2: Case insensitive match
    console.log('\n2. Testing case insensitive match:');
    const { data: ilikeMatch, error: ilikeError } = await supabase
      .from('subscription_packages')
      .select('*')
      .ilike('name', 'Basic')
      .eq('is_active', true)
      .limit(1)
      .single();
      
    console.log('Case insensitive match result:', ilikeMatch);
    if (ilikeError) {
      console.log('Case insensitive match error:', ilikeError);
    }
  }
  
  // Test 3: Get all packages
  console.log('\n3. Fetching all active packages:');
  const { data: allPackages, error: allError } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
    
  console.log('All packages:', allPackages);
  if (allError) {
    console.log('All packages error:', allError);
  }
  
  // Test 4: Exact string match with trimming
  console.log('\n4. Testing trimmed exact match:');
  const { data: trimmedMatch, error: trimmedError } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('name', 'Basic'.trim())
    .eq('is_active', true)
    .single();
    
  console.log('Trimmed match result:', trimmedMatch);
  if (trimmedError) {
    console.log('Trimmed match error:', trimmedError);
  }
}

debugPackageFetching().catch(console.error);