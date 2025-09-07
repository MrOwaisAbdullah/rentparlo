/**
 * =====================================================
 * RentParlo.pk Location Links Data
 * =====================================================
 * Category-based location links for popular search queries
 * Focused on the 9 main categories
 */

import { CategoryLocationLink } from '@/lib/location-link-types';

export const CATEGORY_LOCATION_LINKS: CategoryLocationLink[] = [
  {
    category: "Camera",
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
      },
      {
        id: "gimbal-islamabad",
        label: "Rent Gimbal in Islamabad",
        description: "Camera stabilization equipment in Islamabad",
        query: "gimbal",
        city: "Islamabad",
      },
      {
        id: "flash-camera-faisalabad",
        label: "Rent Camera Flash in Faisalabad",
        description: "Professional lighting equipment in Faisalabad",
        query: "flash",
        city: "Faisalabad",
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
      },
      {
        id: "truck-peshawar",
        label: "Rent Truck in Peshawar",
        description: "Cargo and delivery trucks in Peshawar",
        query: "truck",
        city: "Peshawar",
      },
      {
        id: "luxury-car-karachi",
        label: "Rent Luxury Car in Karachi",
        description: "Premium vehicles for special occasions in Karachi",
        query: "luxury car",
        city: "Karachi",
      }
    ]
  },
  {
    category: "Medical",
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
      },
      {
        id: "cane-karachi",
        label: "Rent Walking Cane in Karachi",
        description: "Assistive walking devices in Karachi",
        query: "walking cane",
        city: "Karachi",
      },
      {
        id: "scales-islamabad",
        label: "Rent Medical Scales in Islamabad",
        description: "Weighing scales for health monitoring in Islamabad",
        query: "medical scales",
        city: "Islamabad",
      }
    ]
  },
  {
    category: "Construction",
    links: [
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
      },
      {
        id: "jack-rawalpindi",
        label: "Rent Hydraulic Jack in Rawalpindi",
        description: "Heavy lifting equipment in Rawalpindi",
        query: "hydraulic jack",
        city: "Rawalpindi",
      },
      {
        id: "compressor-peshawar",
        label: "Rent Air Compressor in Peshawar",
        description: "Pneumatic tools and equipment in Peshawar",
        query: "air compressor",
        city: "Peshawar",
      },
      {
        id: "excavator-multan",
        label: "Rent Excavator in Multan",
        description: "Heavy construction machinery in Multan",
        query: "excavator",
        city: "Multan",
      }
    ]
  },
  {
    category: "Generators",
    links: [
      {
        id: "generator-karachi",
        label: "Rent Power Generator in Karachi",
        description: "Backup power solutions for homes and businesses in Karachi",
        query: "power generator",
        city: "Karachi",
      },
      {
        id: "generator-lahore",
        label: "Rent Generator in Lahore",
        description: "Residential and commercial generators in Lahore",
        query: "generator",
        city: "Lahore",
      },
      {
        id: "inverter-islamabad",
        label: "Rent Inverter in Islamabad",
        description: "Uninterrupted power supply systems in Islamabad",
        query: "inverter",
        city: "Islamabad",
      },
      {
        id: "solar-generator-faisalabad",
        label: "Rent Solar Generator in Faisalabad",
        description: "Eco-friendly power solutions in Faisalabad",
        query: "solar generator",
        city: "Faisalabad",
      },
      {
        id: "diesel-generator-peshawar",
        label: "Rent Diesel Generator in Peshawar",
        description: "Industrial power generators in Peshawar",
        query: "diesel generator",
        city: "Peshawar",
      },
      {
        id: "portable-generator-karachi",
        label: "Rent Portable Generator in Karachi",
        description: "Compact power solutions for events in Karachi",
        query: "portable generator",
        city: "Karachi",
      },
      {
        id: "ups-lahore",
        label: "Rent UPS in Lahore",
        description: "Computer backup power systems in Lahore",
        query: "ups",
        city: "Lahore",
      },
      {
        id: "welding-generator-islamabad",
        label: "Rent Welding Generator in Islamabad",
        description: "Combination welding and power equipment in Islamabad",
        query: "welding generator",
        city: "Islamabad",
      }
    ]
  },
  {
    category: "Wedding Couture",
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
        id: "wedding-car-karachi",
        label: "Rent Wedding Car in Karachi",
        description: "Luxury wedding cars for rent in Karachi",
        query: "wedding car",
        city: "Karachi",
      },
      {
        id: "mehndi-dress-lahore",
        label: "Rent Mehndi Dress in Lahore",
        description: "Traditional bridal wear in Lahore",
        query: "mehndi dress",
        city: "Lahore",
      },
      {
        id: "sherwani-islamabad",
        label: "Rent Sherwani in Islamabad",
        description: "Groom's formal attire in Islamabad",
        query: "sherwani",
        city: "Islamabad",
      },
      {
        id: "jewelry-karachi",
        label: "Rent Wedding Jewelry in Karachi",
        description: "Bridal accessories and jewelry in Karachi",
        query: "wedding jewelry",
        city: "Karachi",
      },
      {
        id: "makeup-artist-lahore",
        label: "Rent Makeup Artist in Lahore",
        description: "Professional bridal makeup services in Lahore",
        query: "makeup artist",
        city: "Lahore",
      },
      {
        id: "photographer-islamabad",
        label: "Rent Wedding Photographer in Islamabad",
        description: "Professional wedding photography services in Islamabad",
        query: "wedding photographer",
        city: "Islamabad",
      }
    ]
  },
  {
    category: "Events",
    links: [
      {
        id: "sound-system-islamabad",
        label: "Rent Sound System in Islamabad",
        description: "PA systems and audio equipment in Islamabad",
        query: "sound system",
        city: "Islamabad",
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
      },
      {
        id: "tent-karachi",
        label: "Rent Event Tent in Karachi",
        description: "Party and event tents in Karachi",
        query: "event tent",
        city: "Karachi",
      },
      {
        id: "lighting-peshawar",
        label: "Rent Event Lighting in Peshawar",
        description: "Professional stage lighting in Peshawar",
        query: "event lighting",
        city: "Peshawar",
      },
      {
        id: "table-chairs-faisalabad",
        label: "Rent Tables & Chairs in Faisalabad",
        description: "Event furniture rentals in Faisalabad",
        query: "tables chairs",
        city: "Faisalabad",
      },
      {
        id: "dj-karachi",
        label: "Rent DJ Services in Karachi",
        description: "Professional DJ equipment and services in Karachi",
        query: "dj services",
        city: "Karachi",
      },
      {
        id: "decor-islamabad",
        label: "Rent Event Decor in Islamabad",
        description: "Wedding and party decorations in Islamabad",
        query: "event decor",
        city: "Islamabad",
      }
    ]
  },
  {
    category: "Studio",
    links: [
      {
        id: "recording-equipment-karachi",
        label: "Rent Recording Equipment in Karachi",
        description: "Professional audio recording gear in Karachi",
        query: "recording equipment",
        city: "Karachi",
      },
      {
        id: "studio-lahore",
        label: "Rent Recording Studio in Lahore",
        description: "Professional music studios in Lahore",
        query: "recording studio",
        city: "Lahore",
      },
      {
        id: "microphone-islamabad",
        label: "Rent Microphone in Islamabad",
        description: "Professional microphones for recording in Islamabad",
        query: "microphone",
        city: "Islamabad",
      },
      {
        id: "mixing-console-karachi",
        label: "Rent Mixing Console in Karachi",
        description: "Audio mixing equipment in Karachi",
        query: "mixing console",
        city: "Karachi",
      },
      {
        id: "headphones-lahore",
        label: "Rent Studio Headphones in Lahore",
        description: "Professional monitoring headphones in Lahore",
        query: "studio headphones",
        city: "Lahore",
      },
      {
        id: "audio-interface-islamabad",
        label: "Rent Audio Interface in Islamabad",
        description: "Digital audio recording interfaces in Islamabad",
        query: "audio interface",
        city: "Islamabad",
      },
      {
        id: "studio-lights-karachi",
        label: "Rent Studio Lights in Karachi",
        description: "Professional photography lighting in Karachi",
        query: "studio lights",
        city: "Karachi",
      },
      {
        id: "green-screen-lahore",
        label: "Rent Green Screen in Lahore",
        description: "Video production equipment in Lahore",
        query: "green screen",
        city: "Lahore",
      }
    ]
  },
  {
    category: "Advertisements",
    links: [
      {
        id: "banner-karachi",
        label: "Rent Advertising Banner in Karachi",
        description: "Promotional banners and signage in Karachi",
        query: "advertising banner",
        city: "Karachi",
      },
      {
        id: "led-screen-lahore",
        label: "Rent LED Screen in Lahore",
        description: "Digital advertising displays in Lahore",
        query: "led screen",
        city: "Lahore",
      },
      {
        id: "billboard-islamabad",
        label: "Rent Billboard in Islamabad",
        description: "Large format outdoor advertising in Islamabad",
        query: "billboard",
        city: "Islamabad",
      },
      {
        id: "flyers-karachi",
        label: "Rent Flyer Printing in Karachi",
        description: "Promotional materials and printing in Karachi",
        query: "flyers",
        city: "Karachi",
      },
      {
        id: "standee-lahore",
        label: "Rent Standee in Lahore",
        description: "Retail advertising displays in Lahore",
        query: "standee",
        city: "Lahore",
      },
      {
        id: "hoarding-peshawar",
        label: "Rent Hoarding in Peshawar",
        description: "Large outdoor advertising structures in Peshawar",
        query: "hoarding",
        city: "Peshawar",
      },
      {
        id: "digital-signage-islamabad",
        label: "Rent Digital Signage in Islamabad",
        description: "Electronic advertising displays in Islamabad",
        query: "digital signage",
        city: "Islamabad",
      },
      {
        id: "vehicle-ads-karachi",
        label: "Rent Vehicle Advertising in Karachi",
        description: "Mobile advertising solutions in Karachi",
        query: "vehicle advertising",
        city: "Karachi",
      }
    ]
  }
];