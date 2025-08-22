"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"

const CATEGORIES = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    description: "Rent smartphones, laptops, tablets and more",
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚗",
    description: "Rent cars, bikes, scooters and more",
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    icon: "🏠",
    description: "Rent washing machines, ACs, refrigerators",
  },
  {
    id: "tools",
    name: "Tools & Equipment",
    icon: "🔧",
    description: "Rent construction tools, generators and more",
  },
  {
    id: "party",
    name: "Party & Events",
    icon: "🎉",
    description: "Rent chairs, tents, sound systems",
  },
  {
    id: "fitness",
    name: "Sports & Fitness",
    icon: "🏃",
    description: "Rent gym equipment, sports gear",
  },
  {
    id: "photography",
    name: "Cameras & Photography",
    icon: "📸",
    description: "Rent cameras, lenses, drones",
  },
  {
    id: "office",
    name: "Office Equipment",
    icon: "💼",
    description: "Rent projectors, printers, furniture",
  },
]

export default function CategoryCards() {
  return (
    <section className="py-8 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Popular Categories</h2>
          <p className="text-muted-foreground">Browse our most popular rental categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer h-24 flex flex-col items-center justify-center text-center p-3">
                <div className="text-2xl mb-1">{category.icon}</div>
                <h3 className="text-xs font-medium text-foreground leading-tight">{category.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
