// Mock seller data and functions
export interface Seller {
  id: string
  name: string
  tier: string
  city: string
  avatarUrl?: string
  isVerified: boolean
  responseRate: number
  totalListings: number
  joinedDate: string
}

const MOCK_SELLERS: Seller[] = [
  {
    id: "1",
    name: "Ahmed Photography",
    tier: "gold",
    city: "Karachi",
    isVerified: true,
    responseRate: 95,
    totalListings: 12,
    joinedDate: "2023-01-15",
  },
]

export async function getSellerProfile(id: string): Promise<Seller | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_SELLERS.find((s) => s.id === id) || null
}
