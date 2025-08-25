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
import { Separator } from '@/components/ui/separator';
import { FilterX, MapPin, DollarSign, Star, Clock } from 'lucide-react';

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
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
];

const conditionOptions = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' }
];

const availabilityOptions = [
  { value: 'available', label: 'Available Now' },
  { value: 'rented', label: 'Currently Rented' },
  { value: 'maintenance', label: 'Under Maintenance' }
];

const priceTypeOptions = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export function CategoryFilters({ slug, currentFilters, subcategories = [] }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = React.useState([0, 100000]);

  const updateSearchParams = (updates: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
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

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => 
    value && key !== 'sort' && key !== 'limit' && key !== 'offset'
  );

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
              value={priceRange}
              onValueChange={setPriceRange}
              onValueCommit={(value) => 
                updateSearchParams({ 
                  priceRange: `${value[0]}-${value[1]}` 
                })
              }
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>PKR {priceRange[0].toLocaleString()}</span>
              <span>PKR {priceRange[1].toLocaleString()}</span>
            </div>
            
            {/* Price Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Price Type</Label>
              <Select 
                value={currentFilters.priceType || 'any'} 
                onValueChange={(value) => updateSearchParams({ priceType: value !== 'any' ? value : undefined })}
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
          <Select 
            value={currentFilters.location || 'any'} 
            onValueChange={(value) => updateSearchParams({ location: value !== 'any' ? value : undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any location</SelectItem>
              {pakistaniCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  checked={currentFilters.condition?.includes(condition.value)}
                  onCheckedChange={(checked) => {
                    const currentConditions = currentFilters.condition?.split(',') || [];
                    let newConditions;
                    
                    if (checked) {
                      newConditions = [...currentConditions, condition.value];
                    } else {
                      newConditions = currentConditions.filter((c: string) => c !== condition.value);
                    }
                    
                    updateSearchParams({
                      condition: newConditions.length > 0 ? newConditions.join(',') : undefined
                    });
                  }}
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

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {availabilityOptions.map((availability) => (
              <div key={availability.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${availability.value}`}
                  checked={currentFilters.availability === availability.value}
                  onCheckedChange={(checked) => {
                    updateSearchParams({
                      availability: checked ? availability.value : undefined
                    });
                  }}
                />
                <Label 
                  htmlFor={`availability-${availability.value}`}
                  className="cursor-pointer text-sm"
                >
                  {availability.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={currentFilters.featured === 'true'}
                onCheckedChange={(checked) => {
                  updateSearchParams({
                    featured: checked ? 'true' : undefined
                  });
                }}
              />
              <Label htmlFor="featured" className="cursor-pointer text-sm">
                Featured listings only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={currentFilters.verified === 'true'}
                onCheckedChange={(checked) => {
                  updateSearchParams({
                    verified: checked ? 'true' : undefined
                  });
                }}
              />
              <Label htmlFor="verified" className="cursor-pointer text-sm">
                Verified sellers only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasImages"
                checked={currentFilters.hasImages === 'true'}
                onCheckedChange={(checked) => {
                  updateSearchParams({
                    hasImages: checked ? 'true' : undefined
                  });
                }}
              />
              <Label htmlFor="hasImages" className="cursor-pointer text-sm">
                With images only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CategoryFilters;