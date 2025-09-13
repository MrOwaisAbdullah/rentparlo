'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FilterX, MapPin, DollarSign, Star, Check, Loader2 } from 'lucide-react';
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
import { CityAreaCombobox } from '@/components/ui/combobox';
import { CITY_AREAS } from '@/lib/area-utils';

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
  onNavigate?: () => void;
}

const pakistaniCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
];

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }
];

const priceTypeOptions = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' }
];

export function CategoryFilters({ slug, currentFilters, subcategories = [], onNavigate }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [localFilters, setLocalFilters] = React.useState(() => {
    let conditionArray: string[] = [];
    if (currentFilters && currentFilters.condition) {
      if (Array.isArray(currentFilters.condition)) {
        conditionArray = currentFilters.condition;
      } else if (typeof currentFilters.condition === 'string') {
        conditionArray = currentFilters.condition.split(',').filter(Boolean);
      }
    }
    
    return {
      minPrice: currentFilters?.minPrice || 0,
      maxPrice: currentFilters?.maxPrice || 100000,
      priceType: currentFilters?.priceType || 'any',
      location: currentFilters?.location || 'any',
      condition: conditionArray,
      open: false
    };
  });

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const updateSearchParams = (updates: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(updates).forEach(key => params.delete(key));
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'any') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (typeof value === 'string') {
          params.set(key, value);
        }
      }
    });
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.delete('page');
    }
    startTransition(() => {
      router.push(`/category/${slug}?${params.toString()}`);
      handleNavigation();
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(`/category/${slug}`);
      handleNavigation();
    });
  };

  const applyFilters = () => {
    const updates: Record<string, string | string[] | undefined> = {};
    updates.minPrice = localFilters.minPrice > 0 ? localFilters.minPrice.toString() : undefined;
    updates.maxPrice = localFilters.maxPrice < 100000 ? localFilters.maxPrice.toString() : undefined;
    updates.priceType = localFilters.priceType !== 'any' ? localFilters.priceType : undefined;
    updates.location = localFilters.location !== 'any' ? localFilters.location : undefined;
    updates.condition = localFilters.condition.length > 0 ? localFilters.condition : undefined;
    updateSearchParams(updates);
  };

  const hasActiveFilters = Object.entries(currentFilters || {}).some(([key, value]) => {
    if (['sort', 'limit', 'offset'].includes(key)) return false;
    if (key === 'condition') return Array.isArray(value) ? value.length > 0 : !!value;
    return value && value !== 'any';
  });

  const handleConditionChange = (condition: string) => {
    setLocalFilters(prev => ({
      ...prev,
      condition: prev.condition.includes(condition)
        ? prev.condition.filter((c: string) => c !== condition)
        : [...prev.condition, condition]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
            <FilterX className="w-4 h-4 mr-1" /> Clear All
          </Button>
        )}
      </div>

      {subcategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {subcategories.map((subcategory) => (
                <Button key={subcategory._id} variant="ghost" className="w-full justify-between h-auto p-2 text-left" onClick={() => { startTransition(() => { router.push(`/category/${slug}/${subcategory.slug}`); handleNavigation(); }); }}>
                  <span className="text-sm">{subcategory.title}</span>
                  {subcategory.itemCount !== undefined && <Badge variant="secondary" className="text-xs">{subcategory.itemCount}</Badge>}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Price Range</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <Slider value={[localFilters.minPrice, localFilters.maxPrice]} onValueChange={([min, max]) => setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))} max={100000} step={1000} className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>PKR {localFilters.minPrice.toLocaleString()}</span>
              <span>PKR {localFilters.maxPrice.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Price Type</Label>
              <Select value={localFilters.priceType} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, priceType: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Any price type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any price type</SelectItem>
                  {priceTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CityAreaCombobox
            cities={Object.keys(CITY_AREAS)}
            selectedCity={localFilters.location === 'any' ? '' : localFilters.location}
            selectedArea={''}
            onCityChange={(city) => {
              setLocalFilters(prev => ({
                ...prev,
                location: city || 'any'
              }));
            }}
            onAreaChange={() => {}}
            className="flex-nowrap"
            size="md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center"><Star className="w-4 h-4 mr-2" /> Condition</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {conditionOptions.map((condition) => (
              <div key={condition.value} className="flex items-center space-x-2">
                <Checkbox id={`condition-${condition.value}`} checked={localFilters.condition.includes(condition.value)} onCheckedChange={() => handleConditionChange(condition.value)} />
                <Label htmlFor={`condition-${condition.value}`} className="flex items-center gap-2 cursor-pointer text-sm">{condition.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={applyFilters} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
        {isPending ? 'Applying...' : 'Apply Filters'}
      </Button>
    </div>
  );
}
