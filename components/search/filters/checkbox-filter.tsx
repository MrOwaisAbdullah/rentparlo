"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";

interface CheckboxFilterProps {
  config: FilterConfig;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function CheckboxFilter({
  config,
  value,
  onChange,
  className,
}: CheckboxFilterProps) {
  const { key, label } = config;

  const handleCheckedChange = (checked: boolean) => {
    onChange(checked);
  };

  return (
    <div className={cn("checkbox-filter", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`filter-${key}`}
          checked={value || false}
          onCheckedChange={handleCheckedChange}
          className={cn(
            value && "border-primary data-[state=checked]:bg-primary"
          )}
          aria-describedby={`filter-${key}-description`}
        />
        <Label
          htmlFor={`filter-${key}`}
          className={cn(
            "text-sm font-medium cursor-pointer",
            value && "text-primary"
          )}
        >
          {label}
        </Label>
      </div>
    </div>
  );
}

export default CheckboxFilter;
