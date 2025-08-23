import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function linkUserToSanity(supabaseUserId, sanityClient) {
  // Get user data from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', supabaseUserId)
    .single();
  
  if (error) throw error;
  
  // Get seller profile if exists
  let sellerProfile = null;
  if (user.role === 'seller' || user.role === 'admin') {
    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', supabaseUserId)
      .single();
      
    sellerProfile = profile;
  }
  
  // Format user info for Sanity
  const userInfo = {
    name: sellerProfile?.username || user.email.split('@')[0],
    phone: user.phone,
    whatsapp: sellerProfile?.whatsapp_number,
    avatar: sellerProfile?.avatar_url,
    isVerified: sellerProfile?.is_verified || false,
    isTopSeller: sellerProfile?.is_top_seller || false
  };
  
  return userInfo;
}
