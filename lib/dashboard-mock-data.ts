// Mock data utilities for dashboard development
import {
  SellerProfile,
  SellerAnalytics,
  UserSubscription,
  ActivityEvent,
  SellerTier,
  VerificationStatus,
  AnalyticsData,
  TimeRange,
  OverviewMetrics,
  TrendData,
  GeographicData,
  DeviceData,
  ConversionData,
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
  const totalViews = 12450;
  const totalContacts = 342;
  const conversionRate = (totalContacts / totalViews) * 100;

  return {
    sellerId: "seller-123",
    totalViews,
    totalContacts,
    totalWhatsAppClicks: 189,
    totalShares: 67,
    totalSaves: 234,
    uniqueVisitors: 8920,
    conversionRate,
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

  return listings.map((title, index) => {
    const views = Math.floor(Math.random() * 2000) + 500;
    const contacts = Math.floor(Math.random() * 50) + 10;
    const conversionRate = views > 0 ? (contacts / views) * 100 : 0;

    return {
      listingId: `listing-${index}`,
      title,
      views,
      contacts,
      whatsappClicks: Math.floor(Math.random() * 30) + 5,
      shares: Math.floor(Math.random() * 15) + 2,
      saves: Math.floor(Math.random() * 25) + 5,
      conversionRate,
      avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastActivity: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  });
}

export function createMockAnalyticsData(timeRange: TimeRange): AnalyticsData {
  const totalViews = Math.floor(Math.random() * 10000) + 5000;
  const totalContacts =
    Math.floor(totalViews * 0.03) + Math.floor(Math.random() * 50);
  const conversionRate = (totalContacts / totalViews) * 100;

  const overview: OverviewMetrics = {
    totalViews,
    totalContacts,
    conversionRate,
    avgSessionDuration: Math.floor(Math.random() * 200) + 120,
    bounceRate: Math.random() * 40 + 25,
    uniqueVisitors:
      Math.floor(totalViews * 0.7) + Math.floor(Math.random() * 1000),
  };

  const trends: TrendData[] = generateMockTrendData(timeRange);
  const listings = generateMockListingAnalytics();
  const geographic: GeographicData[] = generateMockGeographicData();
  const devices: DeviceData[] = generateMockDeviceData();

  const conversions: ConversionData = {
    totalViews,
    totalContacts,
    conversionRate,
    conversionsBySource: [
      {
        source: "Direct",
        conversions: Math.floor(totalContacts * 0.4),
        rate: 2.8,
      },
      {
        source: "Search",
        conversions: Math.floor(totalContacts * 0.35),
        rate: 3.2,
      },
      {
        source: "Social",
        conversions: Math.floor(totalContacts * 0.15),
        rate: 1.9,
      },
      {
        source: "Referral",
        conversions: Math.floor(totalContacts * 0.1),
        rate: 4.1,
      },
    ],
  };

  return {
    overview,
    trends,
    listings,
    geographic,
    devices,
    conversions,
  };
}

function generateMockTrendData(timeRange: TimeRange): TrendData[] {
  const data: TrendData[] = [];
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);
  const daysDiff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    const baseViews = Math.floor(Math.random() * 300) + 100;
    const baseContacts =
      Math.floor(baseViews * 0.03) + Math.floor(Math.random() * 10);

    data.push({
      date: date.toISOString().split("T")[0],
      views: baseViews,
      contacts: baseContacts,
      conversions:
        Math.floor(baseContacts * 0.8) + Math.floor(Math.random() * 3),
    });
  }

  return data;
}

function generateMockGeographicData(): GeographicData[] {
  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Faisalabad",
    "Rawalpindi",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Hyderabad",
    "Bahawalpur",
    "Sargodha",
    "Sukkur",
    "Larkana",
  ];

  const totalViews = Math.floor(Math.random() * 10000) + 5000;
  let remainingViews = totalViews;

  return cities
    .map((city, index) => {
      const isLast = index === cities.length - 1;
      const views = isLast
        ? remainingViews
        : Math.floor(
            Math.random() * (remainingViews / (cities.length - index))
          ) + 50;
      remainingViews -= views;

      const contacts =
        Math.floor(views * 0.03) + Math.floor(Math.random() * 10);
      const percentage = (views / totalViews) * 100;

      return {
        city,
        views,
        contacts,
        percentage,
      };
    })
    .sort((a, b) => b.views - a.views);
}

function generateMockDeviceData(): DeviceData[] {
  const totalViews = Math.floor(Math.random() * 10000) + 5000;

  const mobileViews =
    Math.floor(totalViews * 0.65) +
    Math.floor(Math.random() * totalViews * 0.1);
  const desktopViews =
    Math.floor(totalViews * 0.25) +
    Math.floor(Math.random() * totalViews * 0.1);
  const tabletViews = totalViews - mobileViews - desktopViews;

  return [
    {
      device: "mobile",
      views: mobileViews,
      contacts:
        Math.floor(mobileViews * 0.025) + Math.floor(Math.random() * 20),
      percentage: (mobileViews / totalViews) * 100,
    },
    {
      device: "desktop",
      views: desktopViews,
      contacts:
        Math.floor(desktopViews * 0.035) + Math.floor(Math.random() * 15),
      percentage: (desktopViews / totalViews) * 100,
    },
    {
      device: "tablet",
      views: tabletViews,
      contacts: Math.floor(tabletViews * 0.02) + Math.floor(Math.random() * 10),
      percentage: (tabletViews / totalViews) * 100,
    },
  ];
}
