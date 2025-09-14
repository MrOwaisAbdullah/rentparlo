import { Listing } from '@/types'

// Mock data and functions for listings

const MOCK_LISTINGS: Listing[] = [
  // Camera listings
  {
    _id: "1",
    _type: "listing",
    title: "Canon EOS R5 Professional Camera with 24-70mm Lens",
    slug: {
      current: "canon-eos-r5-professional-camera"
    },
    description: "Professional grade camera perfect for photography and videography projects. High resolution sensor with excellent low light performance.",
    price: 8000,
    pricePerHour: 500,
    priceWeekly: 50000, // 7 days at 8000 = 56000, so 10% discount
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (1).jpg"}}],
    location: { city: "Karachi", area: "DHA" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Canon" },
      { key: "Resolution", value: "45MP" },
      { key: "Video", value: "8K RAW" },
      { key: "Lens Mount", value: "RF Mount" },
      { key: "ISO Range", value: "100-51200" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user1",
    isFeatured: true,
    views: 150,
    contactClicks: 25,
    badges: ["hot", "featured", "verified"],
    _createdAt: new Date().toISOString(),
    seller: {
      id: "user1",
      email: "ahmed@photography.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest1",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      onboarding_completed: true, // Add this missing property
      profile: {
        id: "user1",
        username: "Ahmed Photography",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "2",
    _type: "listing",
    title: "Sony A7IV Camera with 70-200mm Lens",
    slug: {
      current: "sony-a7iv-camera-telephoto"
    },
    description: "Professional camera with telephoto lens for events and portraits. Excellent image stabilization.",
    price: 6500,
    pricePerHour: 400,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (2).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Sony" },
      { key: "Resolution", value: "33MP" },
      { key: "Lens", value: "70-200mm f/2.8" },
      { key: "Stabilization", value: "5-axis IBIS" },
      { key: "Video", value: "4K 60p" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user2",
    isFeatured: true,
    views: 85,
    contactClicks: 15,
    badges: ["hot"],
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user2",
      email: "pro@camera.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest2",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user2",
        username: "Pro Camera Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "platinum",
        tier_points: 2500,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "14",
    _type: "listing",
    title: "Nikon Z7 II Mirrorless Camera",
    slug: {
      current: "nikon-z7-ii-mirrorless-camera"
    },
    description: "High-resolution mirrorless camera with exceptional image quality and advanced autofocus system.",
    price: 7000,
    pricePerHour: 450,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (1).png"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Nikon" },
      { key: "Resolution", value: "45.7MP" },
      { key: "ISO Range", value: "64-25600" },
      { key: "Video", value: "4K UHD" },
      { key: "Lens Mount", value: "Z Mount" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user14",
    isFeatured: true,
    views: 95,
    contactClicks: 20,
    badges: ["verified"],
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user14",
      email: "nikon@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest14",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user14",
        username: "Nikon Gear Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1100,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "15",
    _type: "listing",
    title: "Fujifilm X-T4 Mirrorless Camera",
    slug: {
      current: "fujifilm-xt4-mirrorless-camera"
    },
    description: "Compact mirrorless camera with in-body stabilization and excellent color reproduction.",
    price: 5500,
    pricePerHour: 350,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (1).webp"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Fujifilm" },
      { key: "Resolution", value: "26.1MP" },
      { key: "ISO Range", value: "160-12800" },
      { key: "Video", value: "4K 60p" },
      { key: "Stabilization", value: "5-axis IBIS" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user15",
    isFeatured: true,
    views: 75,
    contactClicks: 12,
    badges: ["new"],
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user15",
      email: "fujifilm@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest15",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user15",
        username: "Fujifilm Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "16",
    _type: "listing",
    title: "Panasonic GH5 II Mirrorless Camera",
    slug: {
      current: "panasonic-gh5-ii-mirrorless-camera"
    },
    description: "Professional video camera with excellent low-light performance and advanced video features.",
    price: 6000,
    pricePerHour: 375,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (2).jpg"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Panasonic" },
      { key: "Resolution", value: "20.3MP" },
      { key: "ISO Range", value: "200-25600" },
      { key: "Video", value: "4K 60p" },
      { key: "Stabilization", value: "5-axis IBIS" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user16",
    isFeatured: true,
    views: 88,
    contactClicks: 18,
    badges: ["featured"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user16",
      email: "panasonic@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest16",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user16",
        username: "Panasonic Gear",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 950,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Automobile listings
  {
    _id: "3",
    _type: "listing",
    title: "BMW 3 Series 2022 - Luxury Sedan for Events",
    slug: {
      current: "bmw-3-series-luxury-sedan"
    },
    description: "Luxury sedan perfect for special events and occasions. Comfortable interior with premium features.",
    price: 15000,
    priceWeekly: 90000, // 7 days at 15000 = 105000, so 14% discount
    priceMonthly: 350000, // 30 days at 15000 = 450000, so 22% discount
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (1).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.0L Turbo" },
      { key: "Fuel Type", value: "Petrol" },
      { key: "Transmission", value: "Automatic" },
      { key: "Seating", value: "5 Persons" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user3",
    isFeatured: true,
    views: 200,
    contactClicks: 40,
    badges: ["hot", "featured", "top_seller"],
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user3",
      email: "elite@cars.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest3",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user3",
        username: "Elite Car Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "platinum",
        tier_points: 3200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "4",
    _type: "listing",
    title: "Honda Civic 2023 - Reliable Daily Rental",
    slug: {
      current: "honda-civic-daily-rental"
    },
    description: "Reliable and fuel-efficient car for daily rentals. Perfect for city driving with modern features.",
    price: 8000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (2).jpg"}}],
    location: { city: "Lahore", area: "Model Town" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.5L Turbo" },
      { key: "Mileage", value: "15 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "CVT" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user4",
    isFeatured: true,
    views: 120,
    contactClicks: 18,
    badges: ["local"],
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user4",
      email: "city@cars.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest4",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user4",
        username: "City Car Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1800,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "17",
    _type: "listing",
    title: "Toyota Corolla 2023 - Fuel Efficient Sedan",
    slug: {
      current: "toyota-corolla-fuel-efficient"
    },
    description: "Economical and reliable sedan perfect for daily commuting and family trips.",
    price: 7500,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (3).jpg"}}],
    location: { city: "Karachi", area: "North Nazimabad" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.3L" },
      { key: "Mileage", value: "18 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user17",
    isFeatured: true,
    views: 95,
    contactClicks: 15,
    badges: ["eco_friendly"],
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user17",
      email: "toyota@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest17",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user17",
        username: "Toyota Rentals PK",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 750,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "18",
    _type: "listing",
    title: "Suzuki Swift 2022 - Compact City Car",
    slug: {
      current: "suzuki-swift-compact-city-car"
    },
    description: "Compact and maneuverable car perfect for city driving and parking in tight spaces.",
    price: 6000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (4).jpg"}}],
    location: { city: "Islamabad", area: "Blue Area" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.2L" },
      { key: "Mileage", value: "20 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Manual" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user18",
    isFeatured: true,
    views: 80,
    contactClicks: 12,
    badges: ["new", "eco_friendly"],
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user18",
      email: "suzuki@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest18",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user18",
        username: "Suzuki Car Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "bronze",
        tier_points: 300,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "19",
    _type: "listing",
    title: "Hyundai Tucson 2023 - Compact SUV",
    slug: {
      current: "hyundai-tucson-compact-suv"
    },
    description: "Spacious SUV with modern features, perfect for family trips and weekend adventures.",
    price: 12000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (5).jpg"}}],
    location: { city: "Lahore", area: "Johar Town" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.0L" },
      { key: "Mileage", value: "14 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user19",
    isFeatured: true,
    views: 110,
    contactClicks: 22,
    badges: ["hot"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user19",
      email: "hyundai@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest19",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user19",
        username: "Hyundai Rentals PK",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "20",
    _type: "listing",
    title: "Kia Sportage 2022 - Midsize SUV",
    slug: {
      current: "kia-sportage-midsize-suv"
    },
    description: "Comfortable midsize SUV with advanced safety features and spacious interior.",
    price: 13000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (6).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.4L" },
      { key: "Mileage", value: "12 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user20",
    isFeatured: true,
    views: 95,
    contactClicks: 18,
    badges: ["verified"],
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user20",
      email: "kia@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest20",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user20",
        username: "Kia SUV Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Medical Equipment listings
  {
    _id: "5",
    _type: "listing",
    title: "Omron Blood Pressure Monitor - Automatic Cuff",
    slug: {
      current: "omron-blood-pressure-monitor"
    },
    description: "Accurate and easy-to-use blood pressure monitor with automatic cuff inflation. Perfect for home health monitoring.",
    price: 500,
    pricePerHour: 50,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (1).jpg"}}],
    location: { city: "Karachi", area: "Gulshan" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Omron" },
      { key: "Type", value: "Automatic" },
      { key: "Cuff Size", value: "Universal" },
      { key: "Memory", value: "2-user, 14 readings each" },
      { key: "Power", value: "Battery/AC Adapter" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user5",
    isFeatured: true,
    views: 95,
    contactClicks: 22,
    badges: ["verified"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user5",
      email: "health@first.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest5",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user5",
        username: "HealthFirst Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "6",
    _type: "listing",
    title: "Digital Thermometer - Fast Reading",
    slug: {
      current: "digital-thermometer-fast-reading"
    },
    description: "Fast and accurate digital thermometer with dual mode readings (oral/underarm). Essential for home health care.",
    price: 200,
    pricePerHour: 20,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (2).jpg"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Reading Time", value: "< 10 seconds" },
      { key: "Accuracy", value: "±0.1°C" },
      { key: "Memory", value: "32 readings" },
      { key: "Power", value: "Battery" },
      { key: "Features", value: "Backlight display" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user6",
    isFeatured: true,
    views: 65,
    contactClicks: 12,
    badges: ["new"],
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user6",
      email: "medi@care.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest6",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user6",
        username: "MediCare Pakistan",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "bronze",
        tier_points: 200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "21",
    _type: "listing",
    title: "Pulse Oximeter - Blood Oxygen Monitor",
    slug: {
      current: "pulse-oximeter-blood-oxygen-monitor"
    },
    description: "Accurate pulse oximeter for measuring blood oxygen saturation and pulse rate. Essential for respiratory monitoring.",
    price: 800,
    pricePerHour: 80,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (3).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Contec" },
      { key: "Measurement Range", value: "0-100%" },
      { key: "Accuracy", value: "±2%" },
      { key: "Display", value: "LCD with backlight" },
      { key: "Power", value: "2 x AAA batteries" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user21",
    isFeatured: true,
    views: 75,
    contactClicks: 15,
    badges: ["featured"],
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user21",
      email: "oxygen@health.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest21",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user21",
        username: "Oxygen Health",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 550,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "22",
    _type: "listing",
    title: "Digital Weight Scale - Precision Measurement",
    slug: {
      current: "digital-weight-scale-precision"
    },
    description: "High-precision digital weight scale with BMI calculation and wireless connectivity.",
    price: 600,
    pricePerHour: 60,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (4).jpg"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Beurer" },
      { key: "Capacity", value: "180 kg" },
      { key: "Precision", value: "100g" },
      { key: "Features", value: "BMI calculation, wireless" },
      { key: "Display", value: "LCD with large digits" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user22",
    isFeatured: true,
    views: 68,
    contactClicks: 13,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user22",
      email: "weight@scale.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest22",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user22",
        username: "Weight Scale Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "bronze",
        tier_points: 250,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "23",
    _type: "listing",
    title: "Infrared Thermometer - Non-Contact",
    slug: {
      current: "infrared-thermometer-non-contact"
    },
    description: "Fast and hygienic non-contact infrared thermometer for forehead temperature measurement.",
    price: 1200,
    pricePerHour: 120,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (5).jpg"}}],
    location: { city: "Islamabad", area: "Blue Area" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Braun" },
      { key: "Measurement Range", value: "32-42.9°C" },
      { key: "Accuracy", value: "±0.2°C" },
      { key: "Response Time", value: "< 1 second" },
      { key: "Memory", value: "32 readings" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user23",
    isFeatured: true,
    views: 110,
    contactClicks: 25,
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user23",
      email: "infrared@thermo.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest23",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user23",
        username: "Infrared Health",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 950,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "24",
    _type: "listing",
    title: "Nebulizer Machine - Respiratory Treatment",
    slug: {
      current: "nebulizer-machine-respiratory"
    },
    description: "Compact and efficient nebulizer machine for respiratory medication delivery. Perfect for asthma and COPD patients.",
    price: 1500,
    pricePerHour: 150,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (6).jpg"}}],
    location: { city: "Lahore", area: "Model Town" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Omron" },
      { key: "Particle Size", value: "0.5-5.0 μm" },
      { key: "Noise Level", value: "< 50 dB" },
      { key: "Treatment Time", value: "5-15 minutes" },
      { key: "Power", value: "AC Adapter/Batteries" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required",
      "Prescription may be required"
    ],
    status: "active",
    supabaseId: "user24",
    isFeatured: true,
    views: 85,
    contactClicks: 18,
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user24",
      email: "nebulizer@health.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest24",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user24",
        username: "Respiratory Care",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 700,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Generators listings
  {
    _id: "7",
    _type: "listing",
    title: "Honda EU20i 2000W Inverter Generator",
    slug: {
      current: "honda-eu20i-inverter-generator"
    },
    description: "Quiet and reliable inverter generator perfect for camping, events, and home backup. Clean power for sensitive electronics.",
    price: 3000,
    pricePerHour: 200,
    priceWeekly: 18000, // 7 days at 3000 = 21000, so ~14% discount
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (1).jpg"}}],
    location: { city: "Karachi", area: "North Nazimabad" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "2000W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "8.1 hours" },
      { key: "Noise Level", value: "52 dB" },
      { key: "Weight", value: "34 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user7",
    isFeatured: true,
    views: 180,
    contactClicks: 35,
    _createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    seller: {
      id: "user7",
      email: "power@solutions.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest7",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user7",
        username: "Power Solutions",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1500,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "8",
    _type: "listing",
    title: "Yamaha EF2000iSv2 Portable Inverter Generator",
    slug: {
      current: "yamaha-ef2000isv2-generator"
    },
    description: "Ultra-quiet portable generator with excellent fuel efficiency. Perfect for outdoor events and camping trips.",
    price: 2800,
    pricePerHour: 180,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (2).jpg"}}],
    location: { city: "Lahore", area: "Johar Town" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "1600W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "10.4 hours" },
      { key: "Noise Level", value: "51.5 dB" },
      { key: "Weight", value: "30.9 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user8",
    isFeatured: true,
    views: 140,
    contactClicks: 28,
    badges: ["hot", "verified"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user8",
      email: "generator@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest8",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user8",
        username: "Generator Rentals PK",
        is_verified: true,
        tier: "silver",
        tier_points: 750,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "25",
    _type: "listing",
    title: "Generac GP3000i Portable Inverter Generator",
    slug: {
      current: "generac-gp3000i-portable-generator"
    },
    description: "Powerful and reliable portable inverter generator with clean power output for sensitive electronics.",
    price: 3200,
    pricePerHour: 220,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (3).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3000W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "9.5 hours" },
      { key: "Noise Level", value: "53 dB" },
      { key: "Weight", value: "45 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user25",
    isFeatured: true,
    views: 165,
    contactClicks: 32,
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user25",
      email: "generac@power.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest25",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user25",
        username: "Generac Power",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1400,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "26",
    _type: "listing",
    title: "Champion 3400-Watt Dual Fuel Generator",
    slug: {
      current: "champion-3400-watt-dual-fuel"
    },
    description: "Versatile dual fuel generator that runs on gasoline or propane. Perfect for home backup and job sites.",
    price: 3500,
    pricePerHour: 250,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (4).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3400W" },
      { key: "Fuel Type", value: "Gasoline/Propane" },
      { key: "Run Time", value: "12 hours (gasoline)" },
      { key: "Noise Level", value: "68 dB" },
      { key: "Weight", value: "184 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user26",
    isFeatured: true,
    views: 155,
    contactClicks: 28,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user26",
      email: "champion@generator.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest26",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user26",
        username: "Champion Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 800,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "27",
    _type: "listing",
    title: "Westinghouse WGen3600v Portable Generator",
    slug: {
      current: "westinghouse-wgen3600v-portable"
    },
    description: "Reliable portable generator with electric start and 120V/240V outlets. Perfect for home backup power.",
    price: 3800,
    pricePerHour: 270,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (5).jpg"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3600W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "9 hours" },
      { key: "Noise Level", value: "68 dB" },
      { key: "Weight", value: "132 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user27",
    isFeatured: true,
    views: 135,
    contactClicks: 25,
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user27",
      email: "westinghouse@power.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest27",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user27",
        username: "Westinghouse Power",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1250,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "2",
    _type: "listing",
    title: "Sony A7IV Camera with 70-200mm Lens",
    slug: {
      current: "sony-a7iv-camera-telephoto"
    },
    description: "Professional camera with telephoto lens for events and portraits. Excellent image stabilization.",
    price: 6500,
    pricePerHour: 400,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (2).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Sony" },
      { key: "Resolution", value: "33MP" },
      { key: "Lens", value: "70-200mm f/2.8" },
      { key: "Stabilization", value: "5-axis IBIS" },
      { key: "Video", value: "4K 60p" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user2",
    isFeatured: true,
    views: 85,
    contactClicks: 15,
    badges: ["hot"],
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user2",
      email: "pro@camera.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest2",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user2",
        username: "Pro Camera Rentals",
        is_verified: true,
        tier: "platinum",
        tier_points: 2500,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Automobile listings
  {
    _id: "3",
    _type: "listing",
    title: "BMW 3 Series 2022 - Luxury Sedan for Events",
    slug: {
      current: "bmw-3-series-luxury-sedan"
    },
    description: "Luxury sedan perfect for special events and occasions. Comfortable interior with premium features.",
    price: 15000,
    priceWeekly: 90000, // 7 days at 15000 = 105000, so 14% discount
    priceMonthly: 350000, // 30 days at 15000 = 450000, so 22% discount
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (1).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.0L Turbo" },
      { key: "Fuel Type", value: "Petrol" },
      { key: "Transmission", value: "Automatic" },
      { key: "Seating", value: "5 Persons" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user3",
    isFeatured: true,
    views: 200,
    contactClicks: 40,
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user3",
      email: "elite@cars.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest3",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user3",
        username: "Elite Car Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "platinum",
        tier_points: 3200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "4",
    _type: "listing",
    title: "Honda Civic 2023 - Reliable Daily Rental",
    slug: {
      current: "honda-civic-daily-rental"
    },
    description: "Reliable and fuel-efficient car for daily rentals. Perfect for city driving with modern features.",
    price: 8000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (2).jpg"}}],
    location: { city: "Lahore", area: "Model Town" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.5L Turbo" },
      { key: "Mileage", value: "15 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "CVT" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user4",
    isFeatured: true,
    views: 120,
    contactClicks: 18,
    badges: [ "local"],
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user4",
      email: "city@cars.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest4",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user4",
        username: "City Car Rentals",
        is_verified: true,
        tier: "gold",
        tier_points: 1800,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Medical Equipment listings
  {
    _id: "5",
    _type: "listing",
    title: "Omron Blood Pressure Monitor - Automatic Cuff",
    slug: {
      current: "omron-blood-pressure-monitor"
    },
    description: "Accurate and easy-to-use blood pressure monitor with automatic cuff inflation. Perfect for home health monitoring.",
    price: 500,
    pricePerHour: 50,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (1).jpg"}}],
    location: { city: "Karachi", area: "Gulshan" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Omron" },
      { key: "Type", value: "Automatic" },
      { key: "Cuff Size", value: "Universal" },
      { key: "Memory", value: "2-user, 14 readings each" },
      { key: "Power", value: "Battery/AC Adapter" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user5",
    isFeatured: true,
    views: 95,
    contactClicks: 22,
    badges: ["verified"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user5",
      email: "health@first.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest5",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user5",
        username: "HealthFirst Rentals",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "6",
    _type: "listing",
    title: "Digital Thermometer - Fast Reading",
    slug: {
      current: "digital-thermometer-fast-reading"
    },
    description: "Fast and accurate digital thermometer with dual mode readings (oral/underarm). Essential for home health care.",
    price: 200,
    pricePerHour: 20,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (2).jpg"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Reading Time", value: "< 10 seconds" },
      { key: "Accuracy", value: "±0.1°C" },
      { key: "Memory", value: "32 readings" },
      { key: "Power", value: "Battery" },
      { key: "Features", value: "Backlight display" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user6",
    isFeatured: true,
    views: 65,
    contactClicks: 12,
    badges: ["new"],
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user6",
      email: "medi@care.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest6",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user6",
        username: "MediCare Pakistan",
        is_verified: true,
        tier: "bronze",
        tier_points: 200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Generators listings
  {
    _id: "7",
    _type: "listing",
    title: "Honda EU20i 2000W Inverter Generator",
    slug: {
      current: "honda-eu20i-inverter-generator"
    },
    description: "Quiet and reliable inverter generator perfect for camping, events, and home backup. Clean power for sensitive electronics.",
    price: 3000,
    pricePerHour: 200,
    priceWeekly: 18000, // 7 days at 3000 = 21000, so ~14% discount
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (1).jpg"}}],
    location: { city: "Karachi", area: "North Nazimabad" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "2000W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "8.1 hours" },
      { key: "Noise Level", value: "52 dB" },
      { key: "Weight", value: "34 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user7",
    isFeatured: true,
    views: 180,
    contactClicks: 35,
    _createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    seller: {
      id: "user7",
      email: "power@solutions.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest7",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user7",
        username: "Power Solutions",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1500,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "8",
    _type: "listing",
    title: "Yamaha EF2000iSv2 Portable Inverter Generator",
    slug: {
      current: "yamaha-ef2000isv2-generator"
    },
    description: "Ultra-quiet portable generator with excellent fuel efficiency. Perfect for outdoor events and camping trips.",
    price: 2800,
    pricePerHour: 180,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (2).jpg"}}],
    location: { city: "Lahore", area: "Johar Town" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "1600W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "10.4 hours" },
      { key: "Noise Level", value: "51.5 dB" },
      { key: "Weight", value: "30.9 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user8",
    isFeatured: true,
    views: 140,
    contactClicks: 28,
    badges: ["hot", "verified"],
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user8",
      email: "generator@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest8",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user8",
        username: "Generator Rentals PK",
        is_verified: true,
        tier: "silver",
        tier_points: 750,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Additional listings for other categories
  {
    _id: "9",
    _type: "listing",
    title: "Bridal Lehenga - Traditional Red & Gold",
    slug: {
      current: "bridal-lehenga-traditional-red-gold"
    },
    description: "Beautiful traditional bridal lehenga with intricate embroidery. Perfect for Pakistani weddings and special occasions.",
    price: 5000,
    category: {
      title: "Wedding Couture"
    },
    images: [{asset: {url: "/placeholder.svg"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Fabric", value: "Silk" },
      { key: "Color", value: "Red & Gold" },
      { key: "Style", value: "Traditional" },
      { key: "Work", value: "Zardozi & Resham" },
      { key: "Size", value: "Customizable" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 3 days",
      "Professional dry cleaning required"
    ],
    status: "active",
    supabaseId: "user9",
    isFeatured: true,
    views: 90,
    contactClicks: 18,
    badges: ["featured", "verified"],
    _createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    seller: {
      id: "user9",
      email: "bridal@couture.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest9",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user9",
        username: "Bridal Couture PK",
        is_verified: true,
        tier: "gold",
        tier_points: 1300,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "10",
    _type: "listing",
    title: "Sound System - Professional PA Setup",
    slug: {
      current: "sound-system-professional-pa-setup"
    },
    description: "Complete professional sound system for events, weddings, and concerts. High quality speakers with mixer.",
    price: 10000,
    category: {
      title: "Events"
    },
    images: [{asset: {url: "/placeholder.svg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Speakers", value: "2 x 15" },
      { key: "Amplifier", value: "1200W" },
      { key: "Mixer", value: "16 Channel" },
      { key: "Microphones", value: "4 Wireless" },
      { key: "Range", value: "Up to 500 people" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Professional setup included"
    ],
    status: "active",
    supabaseId: "user10",
    isFeatured: true,
    views: 160,
    contactClicks: 32,
    badges: ["hot", "featured", "verified"],
    _createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    seller: {
      id: "user10",
      email: "sound@events.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest10",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user10",
        username: "Event Sound Systems",
        is_verified: true,
        tier: "platinum",
        tier_points: 2800,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "11",
    _type: "listing",
    title: "Concrete Mixer - Heavy Duty 5HP",
    slug: {
      current: "concrete-mixer-heavy-duty-5hp"
    },
    description: "Heavy duty concrete mixer perfect for construction projects. Reliable and efficient with large capacity drum.",
    price: 4000,
    category: {
      title: "Construction Equipment"
    },
    images: [{asset: {url: "/placeholder.svg"}}],
    location: { city: "Islamabad", area: "Blue Area" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "5 HP" },
      { key: "Capacity", value: "5 cu ft" },
      { key: "Drum", value: "Steel" },
      { key: "Mixing Time", value: "3-4 minutes" },
      { key: "Weight", value: "220 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Operator training provided"
    ],
    status: "active",
    supabaseId: "user11",
    isFeatured: true,
    views: 75,
    contactClicks: 15,
    badges: ["verified"],
    _createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    seller: {
      id: "user11",
      email: "construction@tools.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest11",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user11",
        username: "Construction Tools PK",
        is_verified: true,
        tier: "silver",
        tier_points: 600,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "12",
    _type: "listing",
    title: "Studio Lighting Kit - Professional Setup",
    slug: {
      current: "studio-lighting-kit-professional-setup"
    },
    description: "Complete professional studio lighting kit with softboxes, strobes, and stands. Perfect for photography and videography.",
    price: 3500,
    category: {
      title: "Studio"
    },
    images: [{asset: {url: "/placeholder.svg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Strobes", value: "2 x 500W" },
      { key: "Softboxes", value: "3 x 24" },
      { key: "Stands", value: "2 x 9ft" },
      { key: "Modifiers", value: "Reflectors, Grids" },
      { key: "Accessories", value: "Triggers, Cables" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper handling required"
    ],
    status: "active",
    supabaseId: "user12",
    isFeatured: true,
    views: 110,
    contactClicks: 22,
    badges: ["hot", "verified"],
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user12",
      email: "studio@gear.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest12",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user12",
        username: "Studio Gear Rentals",
        is_verified: true,
        tier: "gold",
        tier_points: 1400,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "13",
    _type: "listing",
    title: "LED Display Banner - 10ft x 5ft",
    slug: {
      current: "led-display-banner-10ft-x-5ft"
    },
    description: "Large LED display banner perfect for advertising and events. Eye-catching with high brightness and resolution.",
    price: 8000,
    category: {
      title: "Advertisements"
    },
    images: [{asset: {url: "/placeholder.svg"}}],
    location: { city: "Lahore", area: "Commercial Area" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Size", value: "10ft x 5ft" },
      { key: "Resolution", value: "3840 x 1920" },
      { key: "Brightness", value: "5000 nits" },
      { key: "Power", value: "800W" },
      { key: "Control", value: "WiFi/USB/SD" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Professional setup available"
    ],
    status: "active",
    supabaseId: "user13",
    isFeatured: true,
    views: 130,
    contactClicks: 25,
    badges: ["hot"],
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user13",
      email: "advertise@pro.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest13",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user13",
        username: "AdvertisePro",
        is_verified: true,
        tier: "platinum",
        tier_points: 3100,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: true,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Additional camera listings
  {
    _id: "29",
    _type: "listing",
    title: "Nikon Z7 II Mirrorless Camera",
    slug: {
      current: "nikon-z7-ii-mirrorless-camera"
    },
    description: "High-resolution mirrorless camera with exceptional image quality and advanced autofocus system.",
    price: 7000,
    pricePerHour: 450,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (1).png"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Nikon" },
      { key: "Resolution", value: "45.7MP" },
      { key: "ISO Range", value: "64-25600" },
      { key: "Video", value: "4K UHD" },
      { key: "Lens Mount", value: "Z Mount" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user29",
    isFeatured: true,
    views: 95,
    contactClicks: 20,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user29",
      email: "nikon@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest29",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user29",
        username: "Nikon Gear Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1100,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "15-new",
    _type: "listing",
    title: "Fujifilm X-T4 Mirrorless Camera",
    slug: {
      current: "fujifilm-xt4-mirrorless-camera"
    },
    description: "Compact mirrorless camera with in-body stabilization and excellent color reproduction.",
    price: 5500,
    pricePerHour: 350,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (1).webp"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Fujifilm" },
      { key: "Resolution", value: "26.1MP" },
      { key: "ISO Range", value: "160-12800" },
      { key: "Video", value: "4K 60p" },
      { key: "Stabilization", value: "5-axis IBIS" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user15-new",
    isFeatured: true,
    views: 75,
    contactClicks: 12,
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user15-new",
      email: "fujifilm@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest15-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user15-new",
        username: "Fujifilm Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "16-new",
    _type: "listing",
    title: "Panasonic GH5 II Mirrorless Camera",
    slug: {
      current: "panasonic-gh5-ii-mirrorless-camera"
    },
    description: "Professional video camera with excellent low-light performance and advanced video features.",
    price: 6000,
    pricePerHour: 375,
    category: {
      title: "Camera"
    },
    images: [{asset: {url: "/samples/camera (2).jpg"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Panasonic" },
      { key: "Resolution", value: "20.3MP" },
      { key: "ISO Range", value: "200-25600" },
      { key: "Video", value: "4K 60p" },
      { key: "Stabilization", value: "5-axis IBIS" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day"
    ],
    status: "active",
    supabaseId: "user16-new",
    isFeatured: true,
    views: 88,
    contactClicks: 18,
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user16-new",
      email: "panasonic@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest16-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user16-new",
        username: "Panasonic Gear",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 950,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Additional automobile listings
  {
    _id: "17-new",
    _type: "listing",
    title: "Toyota Corolla 2023 - Fuel Efficient Sedan",
    slug: {
      current: "toyota-corolla-fuel-efficient"
    },
    description: "Economical and reliable sedan perfect for daily commuting and family trips.",
    price: 7500,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (3).jpg"}}],
    location: { city: "Karachi", area: "North Nazimabad" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.3L" },
      { key: "Mileage", value: "18 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user17-new",
    isFeatured: true,
    views: 95,
    contactClicks: 15,
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user17-new",
      email: "toyota@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest17-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user17-new",
        username: "Toyota Rentals PK",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 750,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "18-new",
    _type: "listing",
    title: "Suzuki Swift 2022 - Compact City Car",
    slug: {
      current: "suzuki-swift-compact-city-car"
    },
    description: "Compact and maneuverable car perfect for city driving and parking in tight spaces.",
    price: 6000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (4).jpg"}}],
    location: { city: "Islamabad", area: "Blue Area" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "1.2L" },
      { key: "Mileage", value: "20 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Manual" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user18-new",
    isFeatured: true,
    views: 80,
    contactClicks: 12,
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user18-new",
      email: "suzuki@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest18-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user18-new",
        username: "Suzuki Car Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "bronze",
        tier_points: 300,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "19-new",
    _type: "listing",
    title: "Hyundai Tucson 2023 - Compact SUV",
    slug: {
      current: "hyundai-tucson-compact-suv"
    },
    description: "Spacious SUV with modern features, perfect for family trips and weekend adventures.",
    price: 12000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (5).jpg"}}],
    location: { city: "Lahore", area: "Johar Town" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.0L" },
      { key: "Mileage", value: "14 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2023" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user19-new",
    isFeatured: true,
    views: 110,
    contactClicks: 22,
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user19-new",
      email: "hyundai@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest19-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user19-new",
        username: "Hyundai Rentals PK",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1200,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "20-new",
    _type: "listing",
    title: "Kia Sportage 2022 - Midsize SUV",
    slug: {
      current: "kia-sportage-midsize-suv"
    },
    description: "Comfortable midsize SUV with advanced safety features and spacious interior.",
    price: 13000,
    category: {
      title: "Automobiles"
    },
    images: [{asset: {url: "/samples/car (6).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Engine", value: "2.4L" },
      { key: "Mileage", value: "12 km/l" },
      { key: "Seating", value: "5 Persons" },
      { key: "Transmission", value: "Automatic" },
      { key: "Year", value: "2022" }
    ],
    rentalRules: [
      "Valid CNIC and driving license required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel policy: Full to full"
    ],
    status: "active",
    supabaseId: "user20-new",
    isFeatured: true,
    views: 95,
    contactClicks: 18,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user20-new",
      email: "kia@rentals.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest20-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user20-new",
        username: "Kia SUV Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Additional medical equipment listings
  {
    _id: "21-new",
    _type: "listing",
    title: "Pulse Oximeter - Blood Oxygen Monitor",
    slug: {
      current: "pulse-oximeter-blood-oxygen-monitor"
    },
    description: "Accurate pulse oximeter for measuring blood oxygen saturation and pulse rate. Essential for respiratory monitoring.",
    price: 800,
    pricePerHour: 80,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (3).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Contec" },
      { key: "Measurement Range", value: "0-100%" },
      { key: "Accuracy", value: "±2%" },
      { key: "Display", value: "LCD with backlight" },
      { key: "Power", value: "2 x AAA batteries" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user21-new",
    isFeatured: true,
    views: 75,
    contactClicks: 15,
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user21-new",
      email: "oxygen@health.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest21-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user21-new",
        username: "Oxygen Health",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 550,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "22-new",
    _type: "listing",
    title: "Digital Weight Scale - Precision Measurement",
    slug: {
      current: "digital-weight-scale-precision"
    },
    description: "High-precision digital weight scale with BMI calculation and wireless connectivity.",
    price: 600,
    pricePerHour: 60,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (4).jpg"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Beurer" },
      { key: "Capacity", value: "180 kg" },
      { key: "Precision", value: "100g" },
      { key: "Features", value: "BMI calculation, wireless" },
      { key: "Display", value: "LCD with large digits" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user22-new",
    isFeatured: true,
    views: 68,
    contactClicks: 13,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user22-new",
      email: "weight@scale.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest22-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user22-new",
        username: "Weight Scale Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "bronze",
        tier_points: 250,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "23-new",
    _type: "listing",
    title: "Infrared Thermometer - Non-Contact",
    slug: {
      current: "infrared-thermometer-non-contact"
    },
    description: "Fast and hygienic non-contact infrared thermometer for forehead temperature measurement.",
    price: 1200,
    pricePerHour: 120,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (5).jpg"}}],
    location: { city: "Islamabad", area: "Blue Area" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Braun" },
      { key: "Measurement Range", value: "32-42.9°C" },
      { key: "Accuracy", value: "±0.2°C" },
      { key: "Response Time", value: "< 1 second" },
      { key: "Memory", value: "32 readings" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required"
    ],
    status: "active",
    supabaseId: "user23-new",
    isFeatured: true,
    views: 110,
    contactClicks: 25,
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user23-new",
      email: "infrared@thermo.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest23-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user23-new",
        username: "Infrared Health",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 950,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "24-new",
    _type: "listing",
    title: "Nebulizer Machine - Respiratory Treatment",
    slug: {
      current: "nebulizer-machine-respiratory"
    },
    description: "Compact and efficient nebulizer machine for respiratory medication delivery. Perfect for asthma and COPD patients.",
    price: 1500,
    pricePerHour: 150,
    category: {
      title: "Medical Equipment"
    },
    images: [{asset: {url: "/samples/medical (6).jpg"}}],
    location: { city: "Lahore", area: "Model Town" },
    condition: "new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Brand", value: "Omron" },
      { key: "Particle Size", value: "0.5-5.0 μm" },
      { key: "Noise Level", value: "< 50 dB" },
      { key: "Treatment Time", value: "5-15 minutes" },
      { key: "Power", value: "AC Adapter/Batteries" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Proper sanitization required",
      "Prescription may be required"
    ],
    status: "active",
    supabaseId: "user24-new",
    isFeatured: true,
    views: 85,
    contactClicks: 18,
    _createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    seller: {
      id: "user24-new",
      email: "nebulizer@health.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest24-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user24-new",
        username: "Respiratory Care",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 700,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  
  // Additional generator listings
  {
    _id: "25-new",
    _type: "listing",
    title: "Generac GP3000i Portable Inverter Generator",
    slug: {
      current: "generac-gp3000i-portable-generator"
    },
    description: "Powerful and reliable portable inverter generator with clean power output for sensitive electronics.",
    price: 3200,
    pricePerHour: 220,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (3).jpg"}}],
    location: { city: "Karachi", area: "Clifton" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3000W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "9.5 hours" },
      { key: "Noise Level", value: "53 dB" },
      { key: "Weight", value: "45 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user25-new",
    isFeatured: true,
    views: 165,
    contactClicks: 32,
    _createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    seller: {
      id: "user25-new",
      email: "generac@power.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest25-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user25-new",
        username: "Generac Power",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1400,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "26-new",
    _type: "listing",
    title: "Champion 3400-Watt Dual Fuel Generator",
    slug: {
      current: "champion-3400-watt-dual-fuel"
    },
    description: "Versatile dual fuel generator that runs on gasoline or propane. Perfect for home backup and job sites.",
    price: 3500,
    pricePerHour: 250,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (4).jpg"}}],
    location: { city: "Lahore", area: "Gulberg" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3400W" },
      { key: "Fuel Type", value: "Gasoline/Propane" },
      { key: "Run Time", value: "12 hours (gasoline)" },
      { key: "Noise Level", value: "68 dB" },
      { key: "Weight", value: "184 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user26-new",
    isFeatured: true,
    views: 155,
    contactClicks: 28,
    _createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    seller: {
      id: "user26-new",
      email: "champion@generator.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest26-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user26-new",
        username: "Champion Rentals",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 800,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "27-new",
    _type: "listing",
    title: "Westinghouse WGen3600v Portable Generator",
    slug: {
      current: "westinghouse-wgen3600v-portable"
    },
    description: "Reliable portable generator with electric start and 120V/240V outlets. Perfect for home backup power.",
    price: 3800,
    pricePerHour: 270,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (5).jpg"}}],
    location: { city: "Islamabad", area: "F-7" },
    condition: "like-new",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "3600W" },
      { key: "Fuel Type", value: "Gasoline" },
      { key: "Run Time", value: "9 hours" },
      { key: "Noise Level", value: "68 dB" },
      { key: "Weight", value: "132 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user27-new",
    isFeatured: true,
    views: 135,
    contactClicks: 25,
    _createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    seller: {
      id: "user27-new",
      email: "westinghouse@power.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest27-new",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user27-new",
        username: "Westinghouse Power",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "gold",
        tier_points: 1250,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
  {
    _id: "28",
    _type: "listing",
    title: "DuroMax XP4400EH Standby Generator",
    slug: {
      current: "duromax-xp4400eh-standby"
    },
    description: "Powerful standby generator with electric start and dual fuel capability. Perfect for whole home backup power.",
    price: 4200,
    pricePerHour: 300,
    category: {
      title: "Generators"
    },
    images: [{asset: {url: "/samples/generator (1).png"}}],
    location: { city: "Karachi", area: "Defence" },
    condition: "good",
    availability: { isAvailable: true },
    specifications: [
      { key: "Power", value: "4400W" },
      { key: "Fuel Type", value: "Gasoline/Propane" },
      { key: "Run Time", value: "10 hours (gasoline)" },
      { key: "Noise Level", value: "69 dB" },
      { key: "Weight", value: "168 lbs" }
    ],
    rentalRules: [
      "Valid CNIC required",
      "Security deposit refundable",
      "Minimum rental period: 1 day",
      "Fuel not included"
    ],
    status: "active",
    supabaseId: "user28",
    isFeatured: true,
    views: 125,
    contactClicks: 22,
    _createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    seller: {
      id: "user28",
      email: "duromax@power.com",
      role: "seller",
      _createdAt: new Date().toISOString(),
      is_verified: true,
      guest_id: "guest28",
      country: "PK",
      active: true,
      email_verified: true,
      notification_preferences: {
        email: true,
        sms: true,
        push: true
      },
      preferred_language: "en",
      profile: {
        id: "user28",
        username: "DuroMax Power",
        avatar_url: "/placeholder.svg",
        is_verified: true,
        tier: "silver",
        tier_points: 650,
        tier_last_updated: new Date().toISOString(),
        verification_status: "approved",
        is_top_seller: false,
        _createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_documents: {
          cnic_front: null,
          cnic_back: null,
          business_license: null
        }
      }
    }
  },
]

export async function getHomepageListings(): Promise<Listing[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_LISTINGS.filter((listing) => listing.featured)
}

export async function getListingWithAnalytics(slug: string) {
  const listing = MOCK_LISTINGS.find((l) => l.slug?.current === slug)
  return {
    listing: listing || null,
    analytics: {
      views: Math.floor(Math.random() * 1000) + 100,
      contactClicks: Math.floor(Math.random() * 50) + 10,
      whatsappClicks: Math.floor(Math.random() * 30) + 5,
    },
  }
}

export async function getSimilarProducts(listingId: string, listing: Listing) {
  return MOCK_LISTINGS.filter((l) => l._id !== listingId && l.category.title === listing.category.title).slice(0, 4)
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
    filtered = filtered.filter((listing) => listing.category.title.toLowerCase() === filters.category?.toLowerCase())
  }

  if (filters.query) {
    filtered = filtered.filter(
      (listing) =>
        listing.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
        (listing.description && 
         Array.isArray(listing.description) && 
         listing.description.some(block => 
           block.children && 
           block.children.some((child: any) => 
             child.text && child.text.toLowerCase().includes(filters.query!.toLowerCase())
           )
         )
        ),
    )
  }

  if (filters.location) {
    filtered = filtered.filter(
      (listing) =>
        listing.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        (listing.location.area && listing.location.area.toLowerCase().includes(filters.location!.toLowerCase())),
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