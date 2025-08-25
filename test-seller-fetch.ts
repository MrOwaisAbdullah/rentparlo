import { getSellerProfileByUsername } from './lib/supabase-queries';

async function testSellerFetch() {
  console.log('Testing seller profile fetch...');
  
  try {
    // Try to fetch a seller profile (replace 'test-username' with an actual username)
    const seller = await getSellerProfileByUsername('test-username');
    console.log('Seller data:', seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
  }
}

testSellerFetch();