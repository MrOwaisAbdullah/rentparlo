// Mock data and functions for listings
export interface Listing {
  id: string
  _id: string
  title: string
  slug: string
  price: number
  pricePerHour?: number
  category: string
  categoryTitle: string
  images: string[]
  location: {
    city: string
    area?: string
  }
  description: string
  specifications: Record<string, string>
  rentalRules?: string[]
  availability?: {
    isAvailable: boolean
  }
  owner: {
    name: string
    avatar: string
    rating: number
    reviewCount: number
    tier: "basic" | "bronze" | "silver" | "gold" | "platinum" | "diamond"
    verified: boolean
    responseTime: string
    joinedDate: string
  }
  ownerInfo?: {
    name: string
    avatar?: string
    tier: string
  }
  featured?: boolean
  condition: string
  rating: number
  reviewCount: number
}

// Mock listings data
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    _id: "1",
    title: "Canon EOS R5 Professional Camera with 24-70mm Lens",
    slug: "canon-eos-r5-professional-camera",
    price: 8000,
    pricePerHour: 500,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/camera-rental-banner.png"],
    location: { city: "Karachi", area: "DHA" },
    description:
      "Professional grade camera perfect for photography and videography projects. High resolution sensor with excellent low light performance.",
    specifications: {
      Brand: "Canon",
      Resolution: "45MP",
      Video: "8K RAW",
      "Lens Mount": "RF Mount",
      "ISO Range": "100-51200",
    },
    owner: {
      name: "Ahmed Photography",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviewCount: 127,
      tier: "gold",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022",
    },
    ownerInfo: {
      name: "Ahmed Photography",
      tier: "gold",
    },
    featured: true,
    condition: "excellent",
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: "2",
    _id: "2",
    title: "BMW 3 Series 2022 - Luxury Sedan for Events",
    slug: "bmw-3-series-luxury-sedan",
    price: 15000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "Gulberg" },
    description: "Luxury sedan perfect for special events and occasions. Comfortable interior with premium features.",
    specifications: {
      Engine: "2.0L Turbo",
      "Fuel Type": "Petrol",
      Transmission: "Automatic",
      Seating: "5 Persons",
      Year: "2022",
    },
    owner: {
      name: "Elite Car Rentals",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 89,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Elite Car Rentals",
      tier: "platinum",
    },
    featured: true,
    condition: "new",
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "3",
    _id: "3",
    title: "MacBook Pro M3 16-inch for Creative Work",
    slug: "macbook-pro-m3-creative-work",
    price: 3500,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Islamabad", area: "F-7" },
    description:
      "High-performance laptop ideal for creative professionals. Fast processing with excellent display quality.",
    specifications: {
      Processor: "Apple M3",
      RAM: "32GB",
      Storage: "1TB SSD",
      Display: "16-inch Retina",
      Year: "2024",
    },
    owner: {
      name: "Tech Rentals Hub",
      avatar: "/placeholder.svg",
      rating: 4.6,
      reviewCount: 45,
      tier: "silver",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "Tech Rentals Hub",
      tier: "silver",
    },
    condition: "excellent",
    rating: 4.6,
    reviewCount: 45,
  },
  {
    id: "4",
    _id: "4",
    title: "Sony A7IV Camera with 70-200mm Lens",
    slug: "sony-a7iv-camera-telephoto",
    price: 6500,
    pricePerHour: 400,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Karachi", area: "Clifton" },
    description: "Professional camera with telephoto lens for events and portraits. Excellent image stabilization.",
    specifications: {
      Brand: "Sony",
      Resolution: "33MP",
      Lens: "70-200mm f/2.8",
      Stabilization: "5-axis IBIS",
      Video: "4K 60p",
    },
    owner: {
      name: "Pro Camera Rentals",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviewCount: 156,
      tier: "gold",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Pro Camera Rentals",
      tier: "gold",
    },
    featured: true,
    condition: "good",
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: "5",
    _id: "5",
    title: "Honda Civic 2023 - Reliable Daily Rental",
    slug: "honda-civic-daily-rental",
    price: 8000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "Model Town" },
    description: "Reliable and fuel-efficient car for daily rentals. Perfect for city driving with modern features.",
    specifications: {
      Engine: "1.5L Turbo",
      Mileage: "15 km/l",
      Seating: "5 Persons",
      Transmission: "CVT",
      Year: "2023",
    },
    owner: {
      name: "City Car Rentals",
      avatar: "/placeholder.svg",
      rating: 4.4,
      reviewCount: 78,
      tier: "bronze",
      verified: true,
      responseTime: "4 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "City Car Rentals",
      tier: "bronze",
    },
    condition: "good",
    rating: 4.4,
    reviewCount: 78,
  },
  {
    id: "6",
    _id: "6",
    title: "iPad Pro 12.9 with Apple Pencil for Design",
    slug: "ipad-pro-design-tablet",
    price: 2500,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Karachi", area: "Gulshan" },
    description: "Professional tablet perfect for digital art and design work. Includes Apple Pencil and keyboard.",
    specifications: {
      Screen: "12.9 inch",
      Storage: "256GB",
      Accessories: "Apple Pencil",
      Processor: "M2 Chip",
      Year: "2023",
    },
    owner: {
      name: "Digital Design Hub",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviewCount: 92,
      tier: "gold",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022",
    },
    ownerInfo: {
      name: "Digital Design Hub",
      tier: "gold",
    },
    featured: true,
    condition: "excellent",
    rating: 4.8,
    reviewCount: 92,
  },
  {
    id: "7",
    _id: "7",
    title: "Gaming PC RTX 4080 - High Performance Setup",
    slug: "gaming-pc-rtx-4080",
    price: 5000,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "Johar Town" },
    description: "High-end gaming PC for streaming and content creation. Latest graphics card with RGB lighting.",
    specifications: {
      GPU: "RTX 4080",
      CPU: "Intel i7-13700K",
      RAM: "32GB DDR5",
      Storage: "1TB SSD",
      Year: "2023",
    },
    owner: {
      name: "Gaming Gear Rentals",
      avatar: "/placeholder.svg",
      rating: 4.5,
      reviewCount: 112,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Gaming Gear Rentals",
      tier: "platinum",
    },
    featured: true,
    condition: "excellent",
    rating: 4.5,
    reviewCount: 112,
  },
  {
    id: "8",
    _id: "8",
    title: "DJI Mavic 3 Pro Drone with 4K Camera",
    slug: "dji-mavic-3-pro-drone",
    price: 4500,
    pricePerHour: 300,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Islamabad", area: "Blue Area" },
    description: "Professional drone for aerial photography and videography. Advanced obstacle avoidance system.",
    specifications: {
      Camera: "4K 60fps",
      "Flight Time": "43 minutes",
      Range: "15 km",
      Year: "2023",
    },
    owner: {
      name: "Sky Vision Rentals",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviewCount: 134,
      tier: "gold",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022",
    },
    ownerInfo: {
      name: "Sky Vision Rentals",
      tier: "gold",
    },
    featured: true,
    condition: "good",
    rating: 4.7,
    reviewCount: 134,
  },
  {
    id: "9",
    _id: "9",
    title: "Sony PlayStation 5 with VR Headset",
    slug: "ps5-vr-gaming-console",
    price: 3000,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Karachi", area: "North Nazimabad" },
    description: "Latest gaming console with VR capabilities for entertainment.",
    specifications: {
      Console: "Sony PlayStation 5",
      "VR Headset": "Included",
      Year: "2022",
    },
    owner: {
      name: "Game Zone Rentals",
      avatar: "/placeholder.svg",
      rating: 4.6,
      reviewCount: 99,
      tier: "silver",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "Game Zone Rentals",
      tier: "silver",
    },
    featured: true,
    condition: "excellent",
    rating: 4.6,
    reviewCount: 99,
  },
  {
    id: "10",
    _id: "10",
    title: "Professional Audio Recording Setup",
    slug: "audio-recording-studio-setup",
    price: 6000,
    category: "Electronics",
    categoryTitle: "Electronics",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "DHA" },
    description: "Complete audio recording setup for podcasts and music production.",
    specifications: {
      Microphone: "Rode NT-USB",
      "Audio Interface": "Focusrite Scarlett 2i2",
      Year: "2023",
    },
    owner: {
      name: "Sound Studio Rentals",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 101,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Sound Studio Rentals",
      tier: "platinum",
    },
    featured: true,
    condition: "new",
    rating: 4.9,
    reviewCount: 101,
  },
  {
    id: "11",
    _id: "11",
    title: "Toyota Corolla 2023 - Economy Car",
    slug: "toyota-corolla-economy-rental",
    price: 6000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Karachi", area: "Saddar" },
    description: "Fuel-efficient and reliable car for city driving.",
    specifications: {
      Engine: "1.5L",
      "Fuel Type": "Petrol",
      Transmission: "Manual",
      Seating: "5 Persons",
      Year: "2023",
    },
    owner: {
      name: "Budget Car Rentals",
      avatar: "/placeholder.svg",
      rating: 4.3,
      reviewCount: 67,
      tier: "bronze",
      verified: true,
      responseTime: "5 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "Budget Car Rentals",
      tier: "bronze",
    },
    condition: "excellent",
    rating: 4.3,
    reviewCount: 67,
  },
  {
    id: "12",
    _id: "12",
    title: "Mercedes C-Class 2022 - Luxury Sedan",
    slug: "mercedes-c-class-luxury",
    price: 18000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Islamabad", area: "F-6" },
    description: "Premium luxury sedan for special occasions and business meetings.",
    specifications: {
      Engine: "3.0L V6",
      "Fuel Type": "Petrol",
      Transmission: "Automatic",
      Seating: "5 Persons",
      Year: "2022",
    },
    owner: {
      name: "Luxury Motors",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 120,
      tier: "diamond",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Luxury Motors",
      tier: "diamond",
    },
    featured: true,
    condition: "excellent",
    rating: 4.9,
    reviewCount: 120,
  },
  {
    id: "13",
    _id: "13",
    title: "Suzuki Alto 2023 - Compact City Car",
    slug: "suzuki-alto-compact-car",
    price: 4500,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "Faisal Town" },
    description: "Perfect compact car for navigating busy city streets.",
    specifications: {
      Engine: "1.2L",
      "Fuel Type": "Petrol",
      Transmission: "Manual",
      Seating: "5 Persons",
      Year: "2023",
    },
    owner: {
      name: "City Drive Rentals",
      avatar: "/placeholder.svg",
      rating: 4.4,
      reviewCount: 88,
      tier: "bronze",
      verified: true,
      responseTime: "4 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "City Drive Rentals",
      tier: "bronze",
    },
    condition: "excellent",
    rating: 4.4,
    reviewCount: 88,
  },
  {
    id: "14",
    _id: "14",
    title: "Audi A4 2023 - Premium Business Car",
    slug: "audi-a4-premium-business",
    price: 16000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Karachi", area: "Defence" },
    description: "Sophisticated sedan perfect for business professionals.",
    specifications: {
      Engine: "2.0L Turbo",
      "Fuel Type": "Petrol",
      Transmission: "Automatic",
      Seating: "5 Persons",
      Year: "2023",
    },
    owner: {
      name: "Executive Car Rentals",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviewCount: 105,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Executive Car Rentals",
      tier: "platinum",
    },
    featured: true,
    condition: "excellent",
    rating: 4.7,
    reviewCount: 105,
  },
  {
    id: "15",
    _id: "15",
    title: "Toyota Hiace Van - Group Transportation",
    slug: "toyota-hiace-group-van",
    price: 12000,
    category: "Vehicles",
    categoryTitle: "Vehicles",
    images: ["/placeholder-8i3ps.png"],
    location: { city: "Lahore", area: "Liberty" },
    description: "Spacious van perfect for group travel and family trips.",
    specifications: {
      Capacity: "7 Seats",
      Length: "4.8 meters",
      Transmission: "Automatic",
      Year: "2023",
    },
    owner: {
      name: "Family Travel Rentals",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviewCount: 110,
      tier: "gold",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022",
    },
    ownerInfo: {
      name: "Family Travel Rentals",
      tier: "gold",
    },
    featured: true,
    condition: "excellent",
    rating: 4.8,
    reviewCount: 110,
  },
  {
    id: "16",
    _id: "16",
    title: "Nikon Z9 Professional Camera Body",
    slug: "nikon-z9-professional-camera",
    price: 9000,
    pricePerHour: 600,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Islamabad", area: "G-9" },
    description: "Top-tier professional camera for commercial photography.",
    specifications: {
      Brand: "Nikon",
      Resolution: "50MP",
      Video: "8K RAW",
      "Lens Mount": "Z Mount",
      Year: "2023",
    },
    owner: {
      name: "Capital Camera Rentals",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 130,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Capital Camera Rentals",
      tier: "platinum",
    },
    featured: true,
    condition: "new",
    rating: 4.9,
    reviewCount: 130,
  },
  {
    id: "17",
    _id: "17",
    title: "Canon 5D Mark IV with 85mm Portrait Lens",
    slug: "canon-5d-mark-iv-portrait",
    price: 7000,
    pricePerHour: 450,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Karachi", area: "Bahadurabad" },
    description: "Perfect setup for portrait and wedding photography.",
    specifications: {
      Brand: "Canon",
      Resolution: "20MP",
      Lens: "85mm f/1.2",
      Year: "2023",
    },
    owner: {
      name: "Wedding Photo Rentals",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviewCount: 125,
      tier: "gold",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022",
    },
    ownerInfo: {
      name: "Wedding Photo Rentals",
      tier: "gold",
    },
    featured: true,
    condition: "excellent",
    rating: 4.8,
    reviewCount: 125,
  },
  {
    id: "18",
    _id: "18",
    title: "Sony FX3 Cinema Camera for Video Production",
    slug: "sony-fx3-cinema-camera",
    price: 12000,
    pricePerHour: 800,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Lahore", area: "MM Alam Road" },
    description: "Professional cinema camera for film and video production.",
    specifications: {
      Brand: "Sony",
      Resolution: "8K",
      Features: "4K/8K RAW recording",
      Year: "2023",
    },
    owner: {
      name: "Film Production Rentals",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 140,
      tier: "diamond",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Film Production Rentals",
      tier: "diamond",
    },
    featured: true,
    condition: "excellent",
    rating: 4.9,
    reviewCount: 140,
  },
  {
    id: "19",
    _id: "19",
    title: "Fujifilm X-T5 with 16-80mm Lens Kit",
    slug: "fujifilm-xt5-lens-kit",
    price: 5500,
    pricePerHour: 350,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Karachi", area: "Korangi" },
    description: "Versatile mirrorless camera perfect for travel photography.",
    specifications: {
      Brand: "Fujifilm",
      Resolution: "26MP",
      Lens: "16-80mm f/2.8",
      Year: "2023",
    },
    owner: {
      name: "Travel Photo Gear",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviewCount: 115,
      tier: "silver",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "Travel Photo Gear",
      tier: "silver",
    },
    featured: true,
    condition: "excellent",
    rating: 4.7,
    reviewCount: 115,
  },
  {
    id: "20",
    _id: "20",
    title: "GoPro Hero 12 Action Camera Bundle",
    slug: "gopro-hero-12-action-bundle",
    price: 2500,
    pricePerHour: 200,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Islamabad", area: "I-8" },
    description: "Complete action camera setup for adventure and sports filming.",
    specifications: {
      Camera: "GoPro Hero 12",
      Features: "4K recording, waterproof",
      Year: "2023",
    },
    owner: {
      name: "Adventure Gear Rentals",
      avatar: "/placeholder.svg",
      rating: 4.6,
      reviewCount: 95,
      tier: "bronze",
      verified: true,
      responseTime: "4 hours",
      joinedDate: "2023",
    },
    ownerInfo: {
      name: "Adventure Gear Rentals",
      tier: "bronze",
    },
    featured: true,
    condition: "excellent",
    rating: 4.6,
    reviewCount: 95,
  },
  {
    id: "21",
    _id: "21",
    title: "Blackmagic Pocket Cinema Camera 6K Pro",
    slug: "blackmagic-pocket-6k-pro",
    price: 10000,
    pricePerHour: 650,
    category: "Cameras",
    categoryTitle: "Cameras",
    images: ["/camera-rental-banner.png"],
    location: { city: "Lahore", area: "Cavalry Ground" },
    description: "Professional cinema camera with 6K recording capabilities.",
    specifications: {
      Brand: "Blackmagic Design",
      Resolution: "6K",
      Features: "4K recording, external monitor",
      Year: "2023",
    },
    owner: {
      name: "Pro Video Solutions",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 135,
      tier: "platinum",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021",
    },
    ownerInfo: {
      name: "Pro Video Solutions",
      tier: "platinum",
    },
    featured: true,
    condition: "excellent",
    rating: 4.9,
    reviewCount: 135,
  },
]

export async function getHomepageListings(): Promise<Listing[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_LISTINGS.filter((listing) => listing.featured)
}

export async function getListingWithAnalytics(slug: string) {
  const listing = MOCK_LISTINGS.find((l) => l.slug === slug)
  return {
    listing: listing || null,
    analytics: {
      views: Math.floor(Math.random() * 1000) + 100,
      inquiries: Math.floor(Math.random() * 50) + 10,
    },
  }
}

export async function getSimilarProducts(listingId: string, listing: Listing) {
  return MOCK_LISTINGS.filter((l) => l._id !== listingId && l.categoryTitle === listing.categoryTitle).slice(0, 4)
}

export function getAllListings(): Listing[] {
  return MOCK_LISTINGS
}

export interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  condition?: string
  location?: string
  query?: string
}

export function getFilteredListings(filters: SearchFilters): Listing[] {
  let filtered = MOCK_LISTINGS

  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((listing) => listing.categoryTitle.toLowerCase() === filters.category?.toLowerCase())
  }

  if (filters.query) {
    filtered = filtered.filter(
      (listing) =>
        listing.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.query!.toLowerCase()),
    )
  }

  if (filters.location) {
    filtered = filtered.filter(
      (listing) =>
        listing.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        listing.location.area?.toLowerCase().includes(filters.location!.toLowerCase()),
    )
  }

  if (filters.priceRange) {
    filtered = filtered.filter(
      (listing) => listing.price >= filters.priceRange![0] && listing.price <= filters.priceRange![1],
    )
  }

  if (filters.condition && filters.condition !== "all") {
    filtered = filtered.filter((listing) => listing.condition === filters.condition)
  }

  return filtered
}
