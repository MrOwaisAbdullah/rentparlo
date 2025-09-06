'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { getAreasForCity } from '@/lib/area-utils';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0", "z-[99999]")}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="combobox-item-clickable"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface CityAreaComboboxProps {
  cities: string[];
  selectedCity: string;
  selectedArea: string;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  cityPlaceholder?: string;
  areaPlaceholder?: string;
  className?: string;
}

export function CityAreaCombobox({
  cities,
  selectedCity,
  selectedArea,
  onCityChange,
  onAreaChange,
  cityPlaceholder = "Select city...",
  areaPlaceholder = "Select area...",
  className
}: CityAreaComboboxProps) {
  const cityOptions = cities.map(city => ({ value: city, label: city }));
  const areaOptions = selectedCity 
    ? getAreasForCity(selectedCity).map(area => ({ value: area, label: area }))
    : [];

  return (
    <div className={cn("flex gap-2 flex-nowrap", className)}>
      <div className="w-1/2">
        <Combobox
          options={cityOptions}
          value={selectedCity}
          onValueChange={(value) => {
            onCityChange(value);
            // Clear area when city changes
            onAreaChange("");
          }}
          placeholder={cityPlaceholder}
          searchPlaceholder="Search cities..."
          emptyMessage="No cities found"
        />
      </div>
      
      {selectedCity && areaOptions.length > 0 && (
        <div className="w-1/2">
          <Combobox
            options={[{ value: "", label: "All Areas" }, ...areaOptions]}
            value={selectedArea}
            onValueChange={onAreaChange}
            placeholder={areaPlaceholder}
            searchPlaceholder="Search areas..."
            emptyMessage="No areas found"
          />
        </div>
      )}
    </div>
  );
}