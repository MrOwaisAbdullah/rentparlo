'use client';

import React from 'react';
import { ArrowUpDown, Clock, DollarSign, Eye, TrendingUp, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchSortProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
  resultsCount?: number;
  className?: string;
}

const SORT_OPTIONS = [
  {
    value: 'newest',
    label: 'Newest First',
    icon: Clock,
    description: 'Recently listed items'
  },
  {
    value: 'oldest',
    label: 'Oldest First', 
    icon: Clock,
    description: 'Oldest listings first'
  },
  {
    value: 'price-low',
    label: 'Price: Low to High',
    icon: DollarSign,
    description: 'Cheapest first'
  },
  {
    value: 'price-high',
    label: 'Price: High to Low',
    icon: DollarSign,
    description: 'Most expensive first'
  },
  {
    value: 'popular',
    label: 'Most Popular',
    icon: Eye,
    description: 'Most viewed items'
  },
  {
    value: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    description: 'Recently popular'
  },
  {
    value: 'location',
    label: 'By Location',
    icon: MapPin,
    description: 'Nearest first'
  }
];

export function SearchSort({ 
  currentSort, 
  onSortChange, 
  resultsCount = 0,
  className 
}: SearchSortProps) {
  const getCurrentSortOption = () => {
    return SORT_OPTIONS.find(option => option.value === currentSort) || SORT_OPTIONS[0];
  };

  const currentOption = getCurrentSortOption();

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Results Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {resultsCount > 0 ? (
            <>
              Showing <strong>{resultsCount.toLocaleString()}</strong> result{resultsCount !== 1 ? 's' : ''}
            </>
          ) : (
            'No results'
          )}
        </span>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        {/* Current Sort Display */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <currentOption.icon className="w-3 h-3" />
            {currentOption.label}
          </Badge>
        </div>

        {/* Sort Dropdown */}
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <SelectValue placeholder="Sort by..." />
            </div>
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default SearchSort;