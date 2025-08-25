"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, User, LogIn, LogOut, UserCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CityAreaCombobox } from "@/components/ui/combobox"
import { HeaderSheet } from "./header-sheet"
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { CITY_AREAS } from '@/lib/area-utils'

const cities = Object.keys(CITY_AREAS)

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("Karachi")
  const [selectedArea, setSelectedArea] = useState("")
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.push('/auth/login')
      router.refresh()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()
    
    if (searchQuery) {
      searchParams.set('q', searchQuery)
    }
    
    if (selectedCity) {
      searchParams.set('city', selectedCity)
    }
    
    if (selectedArea) {
      searchParams.set('area', selectedArea)
    }
    
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[100] relative">
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
            <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2 rounded-lg p-2 border bg-white z-[100] relative">
              <div className="w-56">
                <CityAreaCombobox
                  cities={cities}
                  selectedCity={selectedCity}
                  selectedArea={selectedArea}
                  onCityChange={setSelectedCity}
                  onAreaChange={setSelectedArea}
                  cityPlaceholder="City"
                  areaPlaceholder="Area"
                />
              </div>
              
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Try 'DSLR camera', 'Car', 'Laptop'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent h-8"
                />
              </div>
              
              <Button 
                type="submit"
                size="sm" 
                className="shrink-0 h-8 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
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
              <Link href="/auth/login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <HeaderSheet />
        </div>
      </div>
    </header>
  )
}