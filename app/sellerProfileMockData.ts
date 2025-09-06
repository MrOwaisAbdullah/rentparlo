import { Seller, Listing, SellerAnalytics } from '@/types';

// Mock seller data for the profile page
export const mockSeller: Seller = {
  id: 'seller-123',
  email: 'john.seller@example.com',
  phone: '+92-300-1234567',
  role: 'seller' as const,
  created_at: '2023-01-15T10:00:00Z',
  last_login: '2024-01-15T14:30:00Z',
  is_verified: true,
  guest_id: 'guest-456',
  city: 'Lahore',
  state: 'Punjab',
  country: 'Pakistan',
  active: true,
  email_verified: true,
  whatsapp_consent: true,
  notification_preferences: {
    email: true,
    sms: false,
    push: true
  },
  preferred_language: 'en' as const,
  profile: {
    id: 'seller-123',
    username: 'premium_electronics',
    business_name: 'Premium Electronics Store',
    verification_documents: {
      cnic_front: 'doc1.jpg',
      cnic_back: 'doc2.jpg',
      business_license: 'license.pdf'
    },
    owner_cnic: '12345-1234567-1',
    address_line1: 'Shop 45, Electronics Market, Lahore',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Premium Electronics',
    is_verified: true,
    is_top_seller: true,
    tier: 'gold' as const,
    tier_points: 1250,
    tier_last_updated: '2024-01-01T00:00:00Z',
    verification_status: 'approved' as const,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  listingCount: 24
};

// Mock listings for different sections
export const mockHotRentalListings: Listing[] = [
  {
    _id: 'listing-1',
    _type: 'listing' as const,
    _createdAt: '2024-01-10T10:00:00Z',
    title: 'iPhone 15 Pro Max - Latest Model',
    slug: { current: 'iphone-15-pro-max-latest' },
    description: 'Brand new iPhone 15 Pro Max available for rent. Perfect for photography and professional use.',
    priceType: 'daily' as const,
    createdAt: '2024-01-10T10:00:00Z',
    price: 2500,
    priceWeekly: 15000,
    priceMonthly: 50000,
    category: {
      _ref: 'cat-electronics',
      title: 'Electronics'
    },
    images: [
      {
        asset: {
          url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
          metadata: { lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ' }
        }
      }
    ],
    location: {
      city: 'Lahore',
      area: 'Gulberg'
    },
    condition: 'new' as const,
    availability: { isAvailable: true },
    specifications: [
      { key: 'Brand', value: 'Apple' },
      { key: 'Model', value: 'iPhone 15 Pro Max' },
      { key: 'Storage', value: '256GB' }
    ],
    rentalRules: ['Minimum 1 day rental', 'Security deposit required'],
    status: 'active' as const,
    supabaseId: 'seller-123',
    isFeatured: true,
    created_at: '2024-01-10T10:00:00Z',
    badges: ['hot', 'featured', 'verified']
  },
  {
    _id: 'listing-2',
    _type: 'listing' as const,
    _createdAt: '2024-01-08T10:00:00Z',
    title: 'MacBook Pro M3 - Professional Grade',
    slug: { current: 'macbook-pro-m3-professional' },
    description: 'High-performance MacBook Pro with M3 chip. Ideal for video editing and development work.',
    priceType: 'daily' as const,
    createdAt: '2024-01-08T10:00:00Z',
    price: 3500,
    priceWeekly: 20000,
    priceMonthly: 70000,
    category: {
      _ref: 'cat-electronics',
      title: 'Electronics'
    },
    images: [
      {
        asset: {
          url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
          metadata: { lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ' }
        }
      }
    ],
    location: {
      city: 'Lahore',
      area: 'DHA'
    },
    condition: 'like-new' as const,
    availability: { isAvailable: true },
    specifications: [
      { key: 'Brand', value: 'Apple' },
      { key: 'Processor', value: 'M3 Pro' },
      { key: 'RAM', value: '16GB' }
    ],
    rentalRules: ['Minimum 3 days rental', 'Professional use only'],
    status: 'active' as const,
    supabaseId: 'seller-123',
    isFeatured: true,
    created_at: '2024-01-08T10:00:00Z',
    badges: ['hot', 'new']
  }
];

export const mockHotRentalProductsListings: Listing[] = [
  {
    _id: 'listing-3',
    _type: 'listing' as const,
    _createdAt: '2024-01-05T10:00:00Z',
    title: 'Canon EOS R5 - Professional Camera',
    slug: { current: 'canon-eos-r5-professional' },
    description: 'High-end mirrorless camera perfect for professional photography and videography.',
    priceType: 'daily' as const,
    createdAt: '2024-01-05T10:00:00Z',
    price: 4000,
    priceWeekly: 25000,
    priceMonthly: 90000,
    category: {
      _ref: 'cat-electronics',
      title: 'Electronics'
    },
    images: [
      {
        asset: {
          url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop',
          metadata: { lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ' }
        }
      }
    ],
    location: {
      city: 'Lahore',
      area: 'Model Town'
    },
    condition: 'like-new' as const,
    availability: { isAvailable: true },
    specifications: [
      { key: 'Brand', value: 'Canon' },
      { key: 'Model', value: 'EOS R5' },
      { key: 'Resolution', value: '45MP' }
    ],
    rentalRules: ['Professional use only', 'Insurance required'],
    status: 'active' as const,
    supabaseId: 'seller-123',
    isFeatured: false,
    created_at: '2024-01-05T10:00:00Z',
    badges: ['new', 'verified']
  }
];

export const mockRentalProductsListings: Listing[] = [
  {
    _id: 'listing-4',
    _type: 'listing' as const,
    _createdAt: '2024-01-03T10:00:00Z',
    title: 'DJI Mavic Pro 3 - Drone',
    slug: { current: 'dji-mavic-pro-3-drone' },
    description: 'Professional drone with 4K camera. Perfect for aerial photography and videography.',
    priceType: 'daily' as const,
    createdAt: '2024-01-03T10:00:00Z',
    price: 3000,
    priceWeekly: 18000,
    priceMonthly: 65000,
    category: {
      _ref: 'cat-electronics',
      title: 'Electronics'
    },
    images: [
      {
        asset: {
          url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop',
          metadata: { lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ' }
        }
      }
    ],
    location: {
      city: 'Lahore',
      area: 'Johar Town'
    },
    condition: 'good' as const,
    availability: { isAvailable: true },
    specifications: [
      { key: 'Brand', value: 'DJI' },
      { key: 'Model', value: 'Mavic Pro 3' },
      { key: 'Flight Time', value: '46 minutes' }
    ],
    rentalRules: ['Pilot license required', 'No-fly zones prohibited'],
    status: 'active' as const,
    supabaseId: 'seller-123',
    isFeatured: false,
    created_at: '2024-01-03T10:00:00Z',
    badges: ['verified']
  }
];

export const mockSellerAnalytics: SellerAnalytics = {
  totalListings: 24,
  activeListings: 22,
  totalViews: 15420,
  totalContactClicks: 892,
  totalWhatsAppClicks: 634,
  topListings: [
    {
      _id: 'listing-1',
      title: 'iPhone 15 Pro Max - Latest Model',
      views: 2340,
      contactClicks: 156
    },
    {
      _id: 'listing-2', 
      title: 'MacBook Pro M3 - Professional Grade',
      views: 1890,
      contactClicks: 134
    }
  ],
  viewsByDay: [
    { date: '2024-01-10', views: 234 },
    { date: '2024-01-11', views: 189 },
    { date: '2024-01-12', views: 267 },
    { date: '2024-01-13', views: 198 },
    { date: '2024-01-14', views: 245 }
  ]
};

// Props for the root component
export const mockRootProps = {
  params: {
    username: 'premium_electronics'
  }
};