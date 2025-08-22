"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CategoryBar } from "./category-bar"

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
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        const currentScrollY = window.scrollY

        // Only hide header after scrolling past 150px to prevent glitching
        if (currentScrollY > 150) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }, 10) // Small debounce to prevent rapid state changes
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Header - Added conditional hiding based on scroll */}
      <div
        className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${
          isScrolled ? "-translate-y-full opacity-0 h-0 overflow-hidden" : "translate-y-0 opacity-100"
        }`}
      >
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
            <div className="flex-1 flex items-center space-x-2 bg-muted rounded-lg p-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-40 border-0 bg-transparent">
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
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Button size="sm" className="shrink-0">
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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Search */}
                <div className="space-y-3">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <SelectValue placeholder="Select City" />
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
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/advertise" onClick={() => setIsOpen(false)}>
                      Advertise
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/blog" onClick={() => setIsOpen(false)}>
                      Blog
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent" asChild>
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button className="justify-start" asChild>
                    <Link href="/seller/dashboard" onClick={() => setIsOpen(false)}>
                      Seller Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category Bar - Always visible, not affected by scroll */}
      <CategoryBar />
    </header>
  )
}
