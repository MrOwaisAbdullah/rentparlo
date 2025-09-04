'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FilterX, MapPin, DollarSign, Star, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  itemCount?: number;
}

interface CategoryFiltersProps {
  slug: string;
  currentFilters: any;
  subcategories?: Subcategory[];
}

const pakistaniCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan', 'Gujrat',
  'Kasur', 'Mardan', 'Mingora', 'Sahiwal', 'Nawabshah',
  'Okara', 'Mirpur Khas', 'Chiniot', 'Kamoke', 'Mandi Bahauddin',
  'Jhelum', 'Sadiqabad', 'Khanewal', 'Hafizabad', 'Bhakkar',
  'Daska', 'Kot Addu', 'Jauharabad', 'Layyah', 'Muzaffargarh'
];

const conditionOptions = [
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'like-new', label: 'Like New', color: 'bg-blue-100 text-blue-800' },
  { value: 'good', label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fair', label: 'Fair', color: 'bg-orange-100 text-orange-800' }
];

const priceTypeOptions = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' }
];

export function CategoryFilters({ slug, currentFilters, subcategories = [] }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for filters
  const [localFilters, setLocalFilters] = React.useState({
    minPrice: currentFilters.minPrice || 0,
    maxPrice: currentFilters.maxPrice || 100000,
    priceType: currentFilters.priceType || 'any',
    location: currentFilters.location || 'any',
    condition: currentFilters.condition?.split(',') || [],
    open: false
  });

  const updateSearchParams = (updates: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'any') {
        if (Array.isArray(value)) {
          params.delete(key);
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });

    // Reset to first page when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.delete('page');
    }

    router.push(`/category/${slug}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/category/${slug}`);
  };

  const applyFilters = () => {
    const updates: Record<string, string | string[] | undefined> = {};
    
    if (localFilters.minPrice > 0) {
      updates.minPrice = localFilters.minPrice.toString();
    } else {
      updates.minPrice = undefined;
    }
    
    if (localFilters.maxPrice < 100000) {
      updates.maxPrice = localFilters.maxPrice.toString();
    } else {
      updates.maxPrice = undefined;
    }
    
    updates.priceType = localFilters.priceType !== 'any' ? localFilters.priceType : undefined;
    updates.location = localFilters.location !== 'any' ? localFilters.location : undefined;
    updates.condition = localFilters.condition.length > 0 ? localFilters.condition : undefined;
    
    updateSearchParams(updates);
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => 
    value && value !== 'any' && key !== 'sort' && key !== 'limit' && key !== 'offset'
  );

  const handleConditionChange = (condition: string) => {
    setLocalFilters(prev => {
      const newConditions = prev.condition.includes(condition)
        ? prev.condition.filter((c: any) => c !== condition)
        : [...prev.condition, condition];
      
      return {
        ...prev,
        condition: newConditions
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <FilterX className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory._id}
                  variant="ghost"
                  className="w-full justify-between h-auto p-2 text-left"
                  onClick={() => router.push(`/category/${slug}/${subcategory.slug}`)}
                >
                  <span className="text-sm">{subcategory.title}</span>
                  {subcategory.itemCount !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {subcategory.itemCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <Slider
              value={[localFilters.minPrice, localFilters.maxPrice]}
              onValueChange={([min, max]) => 
                setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))
              }
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>PKR {localFilters.minPrice.toLocaleString()}</span>
              <span>PKR {localFilters.maxPrice.toLocaleString()}</span>
            </div>
            
            {/* Price Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Price Type</Label>
              <Select 
                value={localFilters.priceType} 
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, priceType: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any price type</SelectItem>
                  {priceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Popover open={localFilters.open} onOpenChange={(open) => setLocalFilters(prev => ({ ...prev, open }))}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={localFilters.open}
                className="w-full justify-between"
              >
                {localFilters.location !== 'any'
                  ? pakistaniCities.find((city) => city === localFilters.location)
                  : "Select city..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setLocalFilters(prev => ({ ...prev, location: 'any', open: false }));
                      }}
                    >
                      <span>Any location</span>
                    </CommandItem>
                    {pakistaniCities.map((city) => (
                      <CommandItem
                        key={city}
                        onSelect={() => {
                          setLocalFilters(prev => ({ ...prev, location: city, open: false }));
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            localFilters.location === city ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Condition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Condition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {conditionOptions.map((condition) => (
              <div key={condition.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition.value}`}
                  checked={localFilters.condition.includes(condition.value)}
                  onCheckedChange={() => handleConditionChange(condition.value)}
                />
                <Label 
                  htmlFor={`condition-${condition.value}`}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Badge className={condition.color}>
                    {condition.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Button */}
      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
}

export default CategoryFilters;