import React from 'react';
import { SellerProfileContent } from '@/components/seller/seller-profile-content';

// Mock seller data
const mockSeller = {
  id: 'test-seller-id',
  username: 'test-seller',
  business_name: 'Test Business',
  email: 'test@example.com',
  phone: '+923001234567',
  city: 'Karachi',
  is_verified: true,
  tier: 'gold',
  tier_points: 1500,
  verification_status: 'approved',
  response_time_avg: 3600,
  customer_rating: 4.8,
  total_reviews: 25,
  total_sales: 50,
  created_at: '2023-01-01T00:00:00Z',
  active: true,
  country: 'Pakistan'
};

// Mock listings data
const mockListings = [
  {
    _id: 'listing-1',
    title: 'Test Listing 1',
    price: 1000,
    category: {
      title: 'Electronics'
    }
  },
  {
    _id: 'listing-2',
    title: 'Test Listing 2',
    price: 2000,
    category: {
      title: 'Furniture'
    }
  }
];

// Mock analytics data
const mockAnalytics = {
  totalViews: 1000,
  totalContactClicks: 50,
  totalWhatsAppClicks: 30,
  totalListings: 10,
  activeListings: 8
};

export default function TestSellerComponent() {
  return (
    <div>
      <h1>Testing Seller Profile Component</h1>
      <SellerProfileContent 
        seller={mockSeller}
        listings={mockListings}
        analytics={mockAnalytics}
      />
    </div>
  );
}