"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";

interface SelectFilterProps {
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SelectFilter({
  config,
  value,
  onChange,
  className,
}: SelectFilterProps) {
  const { key, label, placeholder, options = [] } = config;

  const handleValueChange = (newValue: string) => {
    // Clear filter if "all" or empty value is selected
    if (newValue === "all" || newValue === "") {
      onChange("");
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("select-filter space-y-2", className)}>
      <Label htmlFor={`filter-${key}`} className="text-sm font-medium">
        {label}
      </Label>

      <Select value={value || ""} onValueChange={handleValueChange}>
        <SelectTrigger
          id={`filter-${key}`}
          className={cn(
            "w-full min-w-[180px]",
            value && "border-primary/50 bg-primary/5"
          )}
          aria-label={`Filter by ${label}`}
        >
          <SelectValue
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
          />
        </SelectTrigger>

        <SelectContent>
          {/* Add "All" option to clear filter */}
          <SelectItem value="all">All {label.toLowerCase()}</SelectItem>

          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({option.count})
                </span>
              )}
            </SelectItem>
          ))}

          {options.length === 0 && (
            <SelectItem value="" disabled>
              No options available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectFilter;
