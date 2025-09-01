"use client";

import React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";

interface MultiSelectFilterProps {
  config: FilterConfig;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  config,
  value = [],
  onChange,
  className,
}: MultiSelectFilterProps) {
  const { key, label, placeholder, options = [] } = config;
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange(newValue);
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleRemoveItem = (itemValue: string) => {
    onChange(value.filter((v) => v !== itemValue));
  };

  const getSelectedLabels = () => {
    return value.map((val) => {
      const option = options.find((opt) => opt.value === val);
      return option ? option.label : val;
    });
  };

  const selectedLabels = getSelectedLabels();
  const hasValue = value.length > 0;

  return (
    <div className={cn("multi-select-filter space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full min-w-[180px] justify-between font-normal",
              hasValue && "border-primary/50 bg-primary/5"
            )}
          >
            <span className="truncate">
              {hasValue
                ? `${selectedLabels.length} selected`
                : placeholder || `Select ${label.toLowerCase()}`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              className="h-9"
            />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span>{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({option.count})
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items display */}
      {hasValue && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label, index) => (
            <Badge
              key={value[index]}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {label}
              <button
                onClick={() => handleRemoveItem(value[index])}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                aria-label={`Remove ${label}`}
              >
                <X className="w-2 h-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectFilter;
