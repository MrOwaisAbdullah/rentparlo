// Mock data and functions for categories
export interface Category {
  _id: string
  title: string
  slug: string
  description?: string
  icon?: string
  itemCount?: number
}

const MOCK_CATEGORIES: Category[] = [
  {
    _id: "1",
    title: "Electronics",
    slug: "electronics",
    description: "Rent smartphones, laptops, tablets and more",
    itemCount: 1250,
  },
  {
    _id: "2",
    title: "Vehicles",
    slug: "vehicles",
    description: "Rent cars, bikes, scooters and more",
    itemCount: 650,
  },
  {
    _id: "3",
    title: "Cameras",
    slug: "cameras",
    description: "Professional camera rentals for photography and videography",
    itemCount: 890,
  },
  {
    _id: "4",
    title: "Home Appliances",
    slug: "home-appliances",
    description: "Rent washing machines, ACs, refrigerators",
    itemCount: 420,
  },
]

export async function getCategories(): Promise<Category[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_CATEGORIES
}
