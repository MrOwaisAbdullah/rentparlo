// Mock data utilities for dashboard development
import {
  SellerProfile,
  SellerAnalytics,
  UserSubscription,
  ActivityEvent,
  SellerTier,
  VerificationStatus,
} from "@/types/dashboard";

export function createMockSellerProfile(): SellerProfile {
  return {
    id: "seller-123",
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    phone: "+92-300-1234567",
    avatar: "/placeholder-user.jpg",
    tier: createMockSellerTier(),
    tierPoints: 1250,
    verificationStatus: createMockVerificationStatus(),
    responseRate: 92.5,
    avgRating: 4.7,
    totalRatings: 156,
    joinedAt: "2023-06-15T10:00:00Z",
  };
}

export function createMockSellerTier(): SellerTier {
  return {
    name: "Gold",
    level: 3,
    minPoints: 1000,
    maxPoints: 2500,
    benefits: [
      "Priority listing placement",
      "Advanced analytics",
      "Featured listing slots",
      "Priority customer support",
    ],
  };
}

export function createMockVerificationStatus(): VerificationStatus {
  return {
    isVerified: true,
    phoneVerified: true,
    emailVerified: true,
    documentVerified: true,
    businessVerified: false,
  };
}

export function createMockSellerAnalytics(): SellerAnalytics {
  return {
    sellerId: "seller-123",
    totalViews: 12450,
    totalContacts: 342,
    totalWhatsAppClicks: 189,
    totalShares: 67,
    totalSaves: 234,
    uniqueVisitors: 8920,
    conversionRate: 2.75,
    avgSessionDuration: 145, // seconds
    bounceRate: 34.2,
    topCities: [
      { city: "Karachi", views: 4200, contacts: 120, percentage: 33.7 },
      { city: "Lahore", views: 3100, contacts: 89, percentage: 24.9 },
      { city: "Islamabad", views: 2800, contacts: 76, percentage: 22.5 },
      { city: "Faisalabad", views: 1200, contacts: 32, percentage: 9.6 },
      { city: "Rawalpindi", views: 1150, contacts: 25, percentage: 9.2 },
    ],
    topDevices: [
      { device: "mobile", views: 8715, contacts: 239, percentage: 70.0 },
      { device: "desktop", views: 2490, contacts: 71, percentage: 20.0 },
      { device: "tablet", views: 1245, contacts: 32, percentage: 10.0 },
    ],
    timeSeriesData: generateMockTimeSeriesData(),
    listingPerformance: generateMockListingAnalytics(),
    totalListings: 12,
    activeListings: 10,
    totalListings: 12,
    activeListings: 10,
  };
}

export function createMockUserSubscription(): UserSubscription {
  return {
    id: "sub-123",
    userId: "seller-123",
    packageId: "pkg-pro",
    status: "active",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T00:00:00Z",
    autoRenew: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  };
}

export function createMockRecentActivity(): ActivityEvent[] {
  const activities: ActivityEvent[] = [];
  const types = ["view", "contact", "whatsapp", "share", "save"] as const;
  const listings = [
    "BMW 3 Series - Luxury Car Rental",
    "Canon EOS R5 - Professional Camera",
    'MacBook Pro 16" - Latest Model',
    "Wedding Hall - Grand Ballroom",
    "Apartment in DHA - 2 Bedroom",
  ];
  const cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"];
  const devices = ["mobile", "desktop", "tablet"];

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 48));

    activities.push({
      id: `activity-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      listingId: `listing-${i % 5}`,
      listingTitle: listings[i % listings.length],
      timestamp: timestamp.toISOString(),
      userLocation: cities[Math.floor(Math.random() * cities.length)],
      deviceType: devices[Math.floor(Math.random() * devices.length)],
    });
  }

  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function generateMockTimeSeriesData() {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 500) + 200,
      contacts: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
}

function generateMockListingAnalytics() {
  const listings = [
    "BMW 3 Series - Luxury Car Rental",
    "Canon EOS R5 - Professional Camera",
    'MacBook Pro 16" - Latest Model',
    "Wedding Hall - Grand Ballroom",
    "Apartment in DHA - 2 Bedroom",
  ];

  return listings.map((title, index) => ({
    listingId: `listing-${index}`,
    title,
    views: Math.floor(Math.random() * 2000) + 500,
    contacts: Math.floor(Math.random() * 50) + 10,
    whatsappClicks: Math.floor(Math.random() * 30) + 5,
    shares: Math.floor(Math.random() * 15) + 2,
    saves: Math.floor(Math.random() * 25) + 5,
    conversionRate: Math.random() * 5 + 1,
    avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
    createdAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    lastActivity: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
}
