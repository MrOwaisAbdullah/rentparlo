import { Seller } from '@/types';

const MOCK_SELLERS: Seller[] = [
    {
      id: "1",
      username: "ahmed-electronics",
      name: "Ahmed Electronics",
      avatar: "/placeholder-eamrm.png",
      coverImage: "/electronics-store-banner.png",
      rating: 4.8,
      reviewCount: 156,
      responseTime: "2 hours",
      memberSince: "2020",
      verified: true,
      tier: "gold",
      phone: "+92 300 1234567",
      whatsapp: "+92 300 1234567",
      location: "Lahore, Punjab",
      description:
        "Professional electronics rental service with over 4 years of experience. We provide high-quality cameras, laptops, and audio equipment for events, photography, and business needs.",
      specialties: ["Cameras", "Audio Equipment", "Laptops", "Event Equipment"],
      totalListings: 45,
      activeListings: 38,
    },
    {
      id: "2",
      username: "karachi-cars",
      name: "Karachi Car Rentals",
      avatar: "/car-rental-owner.png",
      coverImage: "/placeholder-1m49r.png",
      rating: 4.6,
      reviewCount: 89,
      responseTime: "1 hour",
      memberSince: "2019",
      verified: true,
      tier: "platinum",
      phone: "+92 321 9876543",
      whatsapp: "+92 321 9876543",
      location: "Karachi, Sindh",
      description:
        "Reliable car rental service in Karachi offering a wide range of vehicles from economy to luxury cars. Perfect for business trips, family vacations, and special occasions.",
      specialties: ["Sedans", "SUVs", "Luxury Cars", "Wedding Cars"],
      totalListings: 28,
      activeListings: 24,
    },
  ]

  export function getAllSellers(): Seller[] {
    return MOCK_SELLERS;
  }
  
  export function getSellerByUsername(username: string): Seller | undefined {
    return MOCK_SELLERS.find((s) => s.username === username);
  }