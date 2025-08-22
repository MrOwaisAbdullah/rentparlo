"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

const PAKISTAN_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]

export default function HeroSection() {
  const [location, setLocation] = useState("Lahore")
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams({
      location: location,
      ...(query && { q: query }),
    })
    window.location.href = `/search?${searchParams.toString()}`
  }

  return (
    <section className="relative">
      <div
        className="relative h-[500px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/modern-rental-pakistan.png)" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Find Top Rental Items in Pakistan</h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Search the best rental items in Pakistan for all your temporary needs.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto border">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                What are you looking for?
              </label>
              <Input
                type="text"
                placeholder="e.g., Camera, Car, Wedding Hall..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent block">Search</label>
              <Button type="submit" className="w-full md:w-auto h-12 px-8 bg-primary hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
