"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, User, Menu, X, Megaphone, FileText, LayoutDashboard, HelpCircle, Mail, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "../ui/separator"

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

export function HeaderSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("karachi")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search submission
    console.log("Searching for:", { query: searchQuery, city: selectedCity })
    setIsOpen(false)
  }

  return (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Sheet Header */}
                <div className="p-6 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">RP</span>
                    </div>
                    <span className="font-bold text-xl text-primary">RentParlo</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Sheet Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Mobile Search */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Rentals</h3>
                    <div className="space-y-3">
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full">
                          <div className="flex items-center space-x-2">
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
                          className="flex-1 h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <Button 
                          size="icon" 
                          className="h-12 w-12 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2 pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-lg py-6" asChild>
                      <Link href="/advertise" onClick={() => setIsOpen(false)}>
                        <Megaphone className="h-5 w-5 mr-3" />
                        Advertise
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-lg py-6" asChild>
                      <Link href="/blog" onClick={() => setIsOpen(false)}>
                        <FileText className="h-5 w-5 mr-3" />
                        Blog
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent text-lg py-6" asChild>
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <LogIn className="h-5 w-5 mr-3" />
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full justify-start text-lg py-6" asChild>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <UserPlus className="h-5 w-5 mr-3" />
                        Sign Up
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-lg py-6" asChild>
                      <Link href="/seller/dashboard" onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Seller Dashboard
                      </Link>
                    </Button>
                    
                    <Separator className="max-w-[400px] my-4"/>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/help" onClick={() => setIsOpen(false)}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help Center
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact" onClick={() => setIsOpen(false)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
            </SheetContent>
          </Sheet>
           )
}