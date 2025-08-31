import { createClient } from '@/utils/supabase/server';

// Mock function for validation - to be implemented properly
export async function validateListingData(data: any) {
  // Basic validation logic
  if (!data.title || data.title.length < 10) {
    return { valid: false, error: 'Title must be at least 10 characters long' };
  }
  
  if (!data.description || data.description.length < 50) {
    return { valid: false, error: 'Description must be at least 50 characters long' };
  }
  
  if (!data.price || data.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  
  return { valid: true };
}

// Mock function for username availability - to be implemented properly
export async function isUsernameAvailable(username: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
  
  return !data; // If no data, username is available
}

// Mock function for logging auth events - to be implemented properly
export async function logAuthEvent(userId: string, eventType: string, metadata: any = {}) {
  console.log(`Auth event logged: ${eventType} for user ${userId}`, metadata);
  // In a real implementation, this would insert into an events table
  return true;
}

// Mock function for getting seller dashboard data - to be implemented properly
export async function getSellerDashboardData(userId: string) {
  // This would fetch real dashboard data
  return {
    listings: [],
    analytics: {
      totalViews: 0,
      totalContactClicks: 0,
      totalWhatsAppClicks: 0
    },
    subscription: null
  };
}

// Mock function for getting cities - to be implemented properly
export async function getCities() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  
  return data || [];
}