"use client"

import { CATEGORY_LOCATION_LINKS } from '@/lib/location-links-data';
import { CategoryLocationLink } from '@/lib/location-link-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LocationLinks() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Rental Searches</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need in your city or neighborhood
          </p>
        </div>

        <div className="space-y-12">
          {CATEGORY_LOCATION_LINKS.map((category: CategoryLocationLink) => (
            <div key={category.category} className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.links.map((link) => {
                  const params = new URLSearchParams()
                  params.append("q", link.query)
                  params.append("city", link.city)
                  if (link.area) params.append("area", link.area)

                  return (
                    <Card 
                      key={link.id} 
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary"
                      onClick={() => (window.location.href = `/search?${params.toString()}`)}
                    >
                      <CardHeader className="p-0 mb-2">
                        <CardTitle className="text-lg font-semibold text-primary">{link.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground text-sm">{link.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}