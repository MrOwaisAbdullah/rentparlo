"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AdBanner } from "@/components/ads/ad-banner"
import { cn } from "@/lib/utils"

interface FilterSidebarProps {
  filters: {
    priceRange: [number, number]
    condition: string
    dateRange: string
  }
  onFiltersChange: (filters: {
    priceRange: [number, number]
    condition: string
    dateRange: string
  }) => void
  className?: string
}

export function FilterSidebar({ filters, onFiltersChange, className }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handlePriceChange = (value: [number, number]) => {
    const newFilters = { ...localFilters, priceRange: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleConditionChange = (value: string) => {
    const newFilters = { ...localFilters, condition: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...localFilters, dateRange: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [0, 100000] as [number, number],
      condition: "all",
      dateRange: "all",
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price Range (PKR per day)</Label>
            <div className="px-2">
              <Slider
                value={localFilters.priceRange}
                onValueChange={handlePriceChange}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>PKR {localFilters.priceRange[0].toLocaleString()}</span>
              <span>PKR {localFilters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Condition</Label>
            <Select value={localFilters.condition} onValueChange={handleConditionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Availability</Label>
            <Select value={localFilters.dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Ad - Medium Rectangle */}
      <AdBanner size="medium-rectangle" className="w-full" fallbackText="Advertisement - 300x250" />

      {/* Sidebar Ad - Wide Skyscraper */}
      <AdBanner size="half-page" className="w-full hidden xl:block" fallbackText="Advertisement - 160x600" />
    </div>
  )
}
