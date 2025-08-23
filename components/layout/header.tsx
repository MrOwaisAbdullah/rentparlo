"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, User,  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeaderSheet } from "./header-sheet"


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

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("karachi")

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RP</span>
            </div>
            <span className="font-bold text-xl text-primary">RentParlo</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-2xl mx-8">
            <div className="flex-1 flex items-center space-x-2 rounded-lg p-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger size="sm" className="w-40 border-0 bg-transparent hover:bg-muted/50 transition-colors">
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
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Try 'DSLR camera', 'Car', 'Laptop'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent h-8"
                />
              </div>
              <Button 
                size="sm" 
                className="shrink-0 h-8 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/advertise">Advertise</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signin">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/seller/dashboard">Seller Dashboard</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <HeaderSheet />
        </div>
      </div>
    </header>
  )
}