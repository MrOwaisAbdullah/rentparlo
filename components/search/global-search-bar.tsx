"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Gujranwala",
]

interface GlobalSearchBarProps {
  variant?: "hero" | "inline"
  className?: string
}

export function GlobalSearchBar({ variant = "inline", className }: GlobalSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("karachi")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCity) params.set("city", selectedCity)

    window.location.href = `/search?${params.toString()}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (variant === "hero") {
    return (
      <Card className={`w-full max-w-4xl mx-auto shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Find anything to rent</h2>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-3/12 flex-shrink-0">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city.toLowerCase()}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-7/12 flex-grow">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    What are you looking for?
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Try 'DSLR camera', 'Car', 'Laptop', 'Wedding dress'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-10 pl-10 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/12 flex-shrink-0">
                  <label className="text-sm font-medium text-transparent block mb-2">
                    Search
                  </label>
                  <Button 
                    onClick={handleSearch} 
                    className="w-full h-10 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex items-center space-x-2 bg-muted rounded-lg p-2 ${className}`}>
      <Select value={selectedCity} onValueChange={setSelectedCity}>
        <SelectTrigger className="w-40 border-0 bg-transparent hover:bg-muted/50 transition-colors h-10">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="City" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city.toLowerCase()}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="h-6 w-px bg-border" />
      <div className="flex-1 flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Try 'DSLR camera', 'Car', 'Laptop'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent h-10"
        />
      </div>
      <Button 
        size="sm" 
        onClick={handleSearch} 
        className="shrink-0 h-10 bg-primary hover:bg-primary/90 transition-all duration-300"
      >
        Search
      </Button>
    </div>
  )
}
