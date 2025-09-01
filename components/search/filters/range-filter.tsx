"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";

interface RangeFilterProps {
  config: FilterConfig;
  value: { min: number; max: number } | null;
  onChange: (value: { min: number; max: number } | null) => void;
  className?: string;
}

export function RangeFilter({
  config,
  value,
  onChange,
  className,
}: RangeFilterProps) {
  const { key, label, min = 0, max = 1000000, step = 1 } = config;

  const [localMin, setLocalMin] = React.useState(value?.min?.toString() || "");
  const [localMax, setLocalMax] = React.useState(value?.max?.toString() || "");
  const [isValid, setIsValid] = React.useState(true);

  // Update local state when value prop changes
  React.useEffect(() => {
    setLocalMin(value?.min?.toString() || "");
    setLocalMax(value?.max?.toString() || "");
  }, [value]);

  // Validate range values
  const validateRange = (minVal: string, maxVal: string) => {
    const minNum = parseFloat(minVal) || 0;
    const maxNum = parseFloat(maxVal) || 0;

    if (minVal && maxVal && minNum > maxNum) {
      return false;
    }

    if (minNum < min || maxNum > max) {
      return false;
    }

    return true;
  };

  // Handle input changes with validation
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value;
    setLocalMin(newMin);

    const valid = validateRange(newMin, localMax);
    setIsValid(valid);

    if (valid) {
      const minNum = parseFloat(newMin) || 0;
      const maxNum = parseFloat(localMax) || 0;

      if (!newMin && !localMax) {
        onChange(null);
      } else {
        onChange({ min: minNum, max: maxNum });
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value;
    setLocalMax(newMax);

    const valid = validateRange(localMin, newMax);
    setIsValid(valid);

    if (valid) {
      const minNum = parseFloat(localMin) || 0;
      const maxNum = parseFloat(newMax) || 0;

      if (!localMin && !newMax) {
        onChange(null);
      } else {
        onChange({ min: minNum, max: maxNum });
      }
    }
  };

  // Clear range
  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    setIsValid(true);
    onChange(null);
  };

  const hasValue = localMin || localMax;
  const formatCurrency = key.includes("price");

  return (
    <div className={cn("range-filter space-y-2", className)}>
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

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            id={`filter-${key}-min`}
            type="number"
            placeholder={formatCurrency ? "0" : "Min"}
            value={localMin}
            onChange={handleMinChange}
            min={min}
            max={max}
            step={step}
            className={cn(
              "text-sm",
              !isValid && "border-destructive focus:border-destructive",
              hasValue && isValid && "border-primary/50 bg-primary/5"
            )}
            aria-label={`Minimum ${label.toLowerCase()}`}
          />
        </div>

        <span className="text-muted-foreground text-sm px-1">to</span>

        <div className="flex-1">
          <Input
            id={`filter-${key}-max`}
            type="number"
            placeholder={formatCurrency ? "1,000,000" : "Max"}
            value={localMax}
            onChange={handleMaxChange}
            min={min}
            max={max}
            step={step}
            className={cn(
              "text-sm",
              !isValid && "border-destructive focus:border-destructive",
              hasValue && isValid && "border-primary/50 bg-primary/5"
            )}
            aria-label={`Maximum ${label.toLowerCase()}`}
          />
        </div>
      </div>

      {!isValid && (
        <p className="text-xs text-destructive">
          {localMin && localMax && parseFloat(localMin) > parseFloat(localMax)
            ? "Minimum cannot be greater than maximum"
            : `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`}
        </p>
      )}

      {formatCurrency && hasValue && isValid && (
        <p className="text-xs text-muted-foreground">
          Range: PKR {(parseFloat(localMin) || 0).toLocaleString()} - PKR{" "}
          {(parseFloat(localMax) || max).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default RangeFilter;
