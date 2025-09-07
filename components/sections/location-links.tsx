"use client"

import Link from 'next/link'
import { CATEGORY_LOCATION_LINKS } from '@/lib/location-links-data'
import { CategoryLocationLink } from '@/lib/location-link-types'
import { ArrowRight } from 'lucide-react'

export default function LocationLinks() {
  // Define the 9 main categories
  const mainCategories = [
    'Camera',
    'Automobiles', 
    'Medical',
    'Construction',
    'Generators',
    'Wedding Couture',
    'Events',
    'Studio',
    'Advertisements'
  ]

  // Get queries for main categories only
  const mainCategoryLinks = CATEGORY_LOCATION_LINKS.filter(category => 
    mainCategories.includes(category.category)
  )

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Rental Searches</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need in your city
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainCategoryLinks.map((category: CategoryLocationLink) => (
              <div key={category.category} className="space-y-3">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.links.slice(0, 4).map((link) => {
                    const params = new URLSearchParams()
                    params.append("q", link.query)
                    params.append("city", link.city)
                    if (link.area) params.append("area", link.area)

                    return (
                      <li key={link.id}>
                        <Link 
                          href={`/search?${params.toString()}`}
                          className="flex text-muted-foreground hover:text-primary hover:underline transition-colors py-1"
                        >
                          <ArrowRight className="h-4 w-4 mr-2 mt-1 -rotate-45 text-primary font-bold" />{link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}