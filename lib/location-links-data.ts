/**
 * =====================================================
 * RentParlo.pk Location Links Data
 * =====================================================
 * Category-based location links for popular search queries
 */

import { CategoryLocationLink } from '@/lib/location-link-types';

export const CATEGORY_LOCATION_LINKS: CategoryLocationLink[] = [
  {
    category: "Camera & Photography",
    links: [
      {
        id: "camera-karachi",
        label: "Rent Camera in Karachi",
        description: "Professional camera rentals in Karachi for photography and videography",
        query: "camera",
        city: "Karachi",
      },
      {
        id: "camera-lahore",
        label: "Rent Camera in Lahore",
        description: "DSLR and mirrorless camera rentals in Lahore",
        query: "camera",
        city: "Lahore",
      },
      {
        id: "camera-islamabad",
        label: "Rent Camera in Islamabad",
        description: "Photography equipment rentals in Islamabad",
        query: "camera",
        city: "Islamabad",
      },
      {
        id: "lens-karachi",
        label: "Rent Camera Lens in Karachi",
        description: "Wide range of camera lenses for rent in Karachi",
        query: "lens",
        city: "Karachi",
      },
      {
        id: "drone-karachi",
        label: "Rent Drone in Karachi",
        description: "Aerial photography drones for rent in Karachi",
        query: "drone",
        city: "Karachi",
      },
      {
        id: "tripod-lahore",
        label: "Rent Tripod in Lahore",
        description: "Sturdy tripods and stabilizers in Lahore",
        query: "tripod",
        city: "Lahore",
      }
    ]
  },
  {
    category: "Automobiles",
    links: [
      {
        id: "car-lahore",
        label: "Rent Car in Lahore",
        description: "Affordable car rentals in Lahore with flexible pickup options",
        query: "car",
        city: "Lahore",
      },
      {
        id: "car-karachi",
        label: "Rent Car in Karachi",
        description: "Luxury and economy cars for rent in Karachi",
        query: "car",
        city: "Karachi",
      },
      {
        id: "car-islamabad",
        label: "Rent Car in Islamabad",
        description: "SUVs and sedans for rent in Islamabad",
        query: "car",
        city: "Islamabad",
      },
      {
        id: "bike-lahore",
        label: "Rent Bike in Lahore",
        description: "Motorcycle rentals in Lahore for short trips",
        query: "bike",
        city: "Lahore",
      },
      {
        id: "bike-karachi",
        label: "Rent Bike in Karachi",
        description: "Scooters and motorcycles for rent in Karachi",
        query: "bike",
        city: "Karachi",
      },
      {
        id: "van-rawalpindi",
        label: "Rent Van in Rawalpindi",
        description: "Passenger vans for group travel in Rawalpindi",
        query: "van",
        city: "Rawalpindi",
      }
    ]
  },
  {
    category: "Home Appliances",
    links: [
      {
        id: "ac-islamabad",
        label: "Rent AC in Islamabad",
        description: "Cool your home with AC rentals in Islamabad",
        query: "ac",
        city: "Islamabad",
      },
      {
        id: "ac-karachi",
        label: "Rent AC in Karachi",
        description: "Window and split AC units for rent in Karachi",
        query: "ac",
        city: "Karachi",
      },
      {
        id: "washing-machine-faisalabad",
        label: "Rent Washing Machine in Faisalabad",
        description: "Convenient washing machine rentals in Faisalabad",
        query: "washing machine",
        city: "Faisalabad",
      },
      {
        id: "refrigerator-lahore",
        label: "Rent Refrigerator in Lahore",
        description: "Fridge rentals for temporary needs in Lahore",
        query: "refrigerator",
        city: "Lahore",
      },
      {
        id: "microwave-karachi",
        label: "Rent Microwave in Karachi",
        description: "Kitchen microwave ovens for rent in Karachi",
        query: "microwave",
        city: "Karachi",
      },
      {
        id: "generator-rawalpindi",
        label: "Rent Power Generator in Rawalpindi",
        description: "Backup power solutions for homes and businesses in Rawalpindi",
        query: "power generator",
        city: "Rawalpindi",
      }
    ]
  },
  {
    category: "Medical Equipment",
    links: [
      {
        id: "wheelchair-karachi",
        label: "Rent Wheelchair in Karachi",
        description: "Medical wheelchairs for temporary use in Karachi",
        query: "wheelchair",
        city: "Karachi",
      },
      {
        id: "oxygen-concentrator-lahore",
        label: "Rent Oxygen Concentrator in Lahore",
        description: "Medical oxygen equipment rentals in Lahore",
        query: "oxygen concentrator",
        city: "Lahore",
      },
      {
        id: "bp-monitor-islamabad",
        label: "Rent Blood Pressure Monitor in Islamabad",
        description: "Digital BP monitors for home health in Islamabad",
        query: "blood pressure monitor",
        city: "Islamabad",
      },
      {
        id: "nebulizer-karachi",
        label: "Rent Nebulizer in Karachi",
        description: "Respiratory therapy equipment rentals in Karachi",
        query: "nebulizer",
        city: "Karachi",
      },
      {
        id: "hospital-bed-lahore",
        label: "Rent Hospital Bed in Lahore",
        description: "Adjustable medical beds for patient care in Lahore",
        query: "hospital bed",
        city: "Lahore",
      },
      {
        id: "walker-islamabad",
        label: "Rent Walker in Islamabad",
        description: "Mobility aids and walking frames in Islamabad",
        query: "walker",
        city: "Islamabad",
      }
    ]
  },
  {
    category: "Construction Tools",
    links: [
      {
        id: "lawn-manzoor",
        label: "Rent Lawn Equipment in Manzoor Colony, Karachi",
        description: "Garden tools and equipment rentals in Manzoor Colony",
        query: "lawn equipment",
        city: "Karachi",
        area: "Manzoor Colony",
      },
      {
        id: "drill-karachi",
        label: "Rent Drill Machine in Karachi",
        description: "Power tools and drilling equipment in Karachi",
        query: "drill machine",
        city: "Karachi",
      },
      {
        id: "generator-lahore",
        label: "Rent Power Tools in Lahore",
        description: "Construction equipment rentals in Lahore",
        query: "power tools",
        city: "Lahore",
      },
      {
        id: "scaffolding-islamabad",
        label: "Rent Scaffolding in Islamabad",
        description: "Construction scaffolding and safety equipment in Islamabad",
        query: "scaffolding",
        city: "Islamabad",
      },
      {
        id: "concrete-mixer-karachi",
        label: "Rent Concrete Mixer in Karachi",
        description: "Building construction equipment in Karachi",
        query: "concrete mixer",
        city: "Karachi",
      },
      {
        id: "welding-machine-lahore",
        label: "Rent Welding Machine in Lahore",
        description: "Industrial welding equipment rentals in Lahore",
        query: "welding machine",
        city: "Lahore",
      }
    ]
  },
  {
    category: "Event & Wedding",
    links: [
      {
        id: "wedding-dress-karachi",
        label: "Rent Wedding Dress in Karachi",
        description: "Designer wedding dresses and formal wear in Karachi",
        query: "wedding dress",
        city: "Karachi",
      },
      {
        id: "tent-lahore",
        label: "Rent Wedding Tent in Lahore",
        description: "Marquee and wedding tent rentals in Lahore",
        query: "wedding tent",
        city: "Lahore",
      },
      {
        id: "sound-system-islamabad",
        label: "Rent Sound System in Islamabad",
        description: "PA systems and audio equipment in Islamabad",
        query: "sound system",
        city: "Islamabad",
      },
      {
        id: "wedding-car-karachi",
        label: "Rent Wedding Car in Karachi",
        description: "Luxury wedding cars for rent in Karachi",
        query: "wedding car",
        city: "Karachi",
      },
      {
        id: "catering-equipment-lahore",
        label: "Rent Catering Equipment in Lahore",
        description: "Professional catering gear in Lahore",
        query: "catering equipment",
        city: "Lahore",
      },
      {
        id: "stage-setup-rawalpindi",
        label: "Rent Stage Setup in Rawalpindi",
        description: "Event stage and lighting equipment in Rawalpindi",
        query: "stage setup",
        city: "Rawalpindi",
      }
    ]
  },
  {
    category: "Fitness & Sports",
    links: [
      {
        id: "treadmill-karachi",
        label: "Rent Treadmill in Karachi",
        description: "Home fitness equipment rentals in Karachi",
        query: "treadmill",
        city: "Karachi",
      },
      {
        id: "gym-equipment-lahore",
        label: "Rent Gym Equipment in Lahore",
        description: "Professional fitness gear in Lahore",
        query: "gym equipment",
        city: "Lahore",
      },
      {
        id: "cricket-kit-islamabad",
        label: "Rent Cricket Kit in Islamabad",
        description: "Complete cricket gear rentals in Islamabad",
        query: "cricket kit",
        city: "Islamabad",
      },
      {
        id: "bicycle-karachi",
        label: "Rent Bicycle in Karachi",
        description: "Mountain and road bikes for rent in Karachi",
        query: "bicycle",
        city: "Karachi",
      },
      {
        id: "swimming-pool-faisalabad",
        label: "Rent Swimming Pool in Faisalabad",
        description: "Inflatable pools for summer fun in Faisalabad",
        query: "swimming pool",
        city: "Faisalabad",
      },
      {
        id: "sports-equipment-rawalpindi",
        label: "Rent Sports Equipment in Rawalpindi",
        description: "Various sports gear rentals in Rawalpindi",
        query: "sports equipment",
        city: "Rawalpindi",
      }
    ]
  },
  {
    category: "Electronics",
    links: [
      {
        id: "laptop-karachi",
        label: "Rent Laptop in Karachi",
        description: "Business and gaming laptops for rent in Karachi",
        query: "laptop",
        city: "Karachi",
      },
      {
        id: "printer-lahore",
        label: "Rent Printer in Lahore",
        description: "Office printers and scanners in Lahore",
        query: "printer",
        city: "Lahore",
      },
      {
        id: "projector-islamabad",
        label: "Rent Projector in Islamabad",
        description: "Home cinema and business projectors in Islamabad",
        query: "projector",
        city: "Islamabad",
      },
      {
        id: "tablet-karachi",
        label: "Rent Tablet in Karachi",
        description: "iPad and Android tablets for rent in Karachi",
        query: "tablet",
        city: "Karachi",
      },
      {
        id: "speaker-lahore",
        label: "Rent Speaker in Lahore",
        description: "Bluetooth and home theater speakers in Lahore",
        query: "speaker",
        city: "Lahore",
      },
      {
        id: "smart-tv-rawalpindi",
        label: "Rent Smart TV in Rawalpindi",
        description: "Large screen TVs for events in Rawalpindi",
        query: "smart tv",
        city: "Rawalpindi",
      }
    ]
  },
  {
    category: "Furniture",
    links: [
      {
        id: "sofa-karachi",
        label: "Rent Sofa in Karachi",
        description: "Living room furniture rentals in Karachi",
        query: "sofa",
        city: "Karachi",
      },
      {
        id: "office-chair-lahore",
        label: "Rent Office Chair in Lahore",
        description: "Ergonomic office furniture in Lahore",
        query: "office chair",
        city: "Lahore",
      },
      {
        id: "dining-table-islamabad",
        label: "Rent Dining Table in Islamabad",
        description: "Dining sets for events in Islamabad",
        query: "dining table",
        city: "Islamabad",
      },
      {
        id: "bed-karachi",
        label: "Rent Bed in Karachi",
        description: "Temporary bedroom furniture in Karachi",
        query: "bed",
        city: "Karachi",
      },
      {
        id: "wardrobe-lahore",
        label: "Rent Wardrobe in Lahore",
        description: "Storage solutions and wardrobes in Lahore",
        query: "wardrobe",
        city: "Lahore",
      },
      {
        id: "study-table-rawalpindi",
        label: "Rent Study Table in Rawalpindi",
        description: "Student furniture rentals in Rawalpindi",
        query: "study table",
        city: "Rawalpindi",
      }
    ]
  }
];