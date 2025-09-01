"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterConfig } from "@/types/search";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFilterProps {
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchFilter({
  config,
  value,
  onChange,
  className,
  debounceMs = 300,
}: SearchFilterProps) {
  const { key, label, placeholder } = config;
  const [localValue, setLocalValue] = React.useState(value || "");

  // Debounce the search input to avoid excessive API calls
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Update local state when value prop changes
  React.useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Call onChange when debounced value changes
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(localValue);
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const hasValue = localValue.length > 0;

  return (
    <div className={cn("search-filter space-y-2", className)}>
      <Label htmlFor={`filter-${key}`} className="text-sm font-medium">
        {label}
      </Label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          id={`filter-${key}`}
          type="text"
          placeholder={placeholder || `Search ${label.toLowerCase()}...`}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-10",
            hasValue && "border-primary/50 bg-primary/5"
          )}
          aria-label={`Search ${label.toLowerCase()}`}
        />
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            aria-label={`Clear ${label.toLowerCase()} search`}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {hasValue && (
        <p className="text-xs text-muted-foreground">
          Searching for "{localValue}"
        </p>
      )}
    </div>
  );
}

export default SearchFilter;
