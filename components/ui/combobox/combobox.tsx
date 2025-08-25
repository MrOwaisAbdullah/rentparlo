'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonArrow } from '@/components/ui/button';
import {
  Command,
  CommandCheck,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const pakistaniCities = [
  {
    value: 'karachi',
    label: 'Karachi, Sindh',
  },
  {
    value: 'lahore',
    label: 'Lahore, Punjab',
  },
  {
    value: 'islamabad',
    label: 'Islamabad, ICT',
  },
  {
    value: 'rawalpindi',
    label: 'Rawalpindi, Punjab',
  },
  {
    value: 'faisalabad',
    label: 'Faisalabad, Punjab',
  },
  {
    value: 'multan',
    label: 'Multan, Punjab',
  },
  {
    value: 'peshawar',
    label: 'Peshawar, KPK',
  },
  {
    value: 'quetta',
    label: 'Quetta, Balochistan',
  },
  {
    value: 'sialkot',
    label: 'Sialkot, Punjab',
  },
  {
    value: 'gujranwala',
    label: 'Gujranwala, Punjab',
  },
];

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function Combobox({
  value,
  onValueChange,
  placeholder = 'Select city...',
  searchPlaceholder = 'Search city...',
  emptyMessage = 'No city found.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          mode="input"
          placeholder={!value}
          aria-expanded={open}
          className={cn('w-[200px]', className)}
        >
          <span className={cn('truncate')}>
            {value ? pakistaniCities.find((city) => city.value === value)?.label : placeholder}
          </span>
          <ButtonArrow />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popper-anchor-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {pakistaniCities.map((city) => (
                <CommandItem
                  key={city.value}
                  value={city.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{city.label}</span>
                  {value === city.value && <CommandCheck />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}