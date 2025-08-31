import { createSellerProfile, getSellerProfileByUsername } from './lib/supabase-queries';

async function testSellerProfileCreation() {
  console.log('Testing seller profile creation...');
  
  try {
    // First check if the seller profile already exists
    const existingProfile = await getSellerProfileByUsername('seller-66666666');
    if (existingProfile) {
      console.log('Seller profile already exists:', existingProfile.username);
      return;
    }
    
    console.log('Seller profile does not exist, creating one...');
    
    // Test creating a seller profile for the missing username
    const testProfile = {
      id: '66666666-6666-6666-6666-666666666666',
      username: 'seller-66666666',
      email: 'seller-66666666@example.com',
      is_verified: false,
      tier: 'basic' as const,
      tier_points: 0,
      tier_last_updated: new Date().toISOString(),
      verification_status: 'pending' as const,
      verification_documents: {
        cnic_front: null,
        cnic_back: null,
        business_license: null
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdProfile = await createSellerProfile(testProfile);
    
    if (createdProfile) {
      console.log('Seller profile created successfully:', createdProfile.username);
    } else {
      console.log('Failed to create seller profile');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSellerProfileCreation();