"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

const PAKISTAN_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]

export default function HeroSection() {
  const [location, setLocation] = useState("Karachi")
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
        className="relative h-[400px] bg-cover bg-center bg-no-repeat"
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
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-2/12 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger size="l" className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full">
                  <SelectValue placeholder="City" />
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

            <div className="w-full md:w-7/12 flex-grow">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                What are you looking for?
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g., Camera, Car, Wedding Hall..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 pl-10 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="w-full md:w-3/12 flex-shrink-0">
              <label className="text-sm font-medium text-transparent block mb-2">
                Search
              </label>
              <Button 
                type="submit" 
                className="w-full h-10 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              >
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
