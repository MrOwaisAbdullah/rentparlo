"use client";

import React from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FilterConfig, DateRange } from "@/types/search";

interface DateRangeFilterProps {
  config: FilterConfig;
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
  className?: string;
}

export function DateRangeFilter({
  config,
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const { key, label } = config;
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(
    value?.start ? new Date(value.start).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = React.useState(
    value?.end ? new Date(value.end).toISOString().split("T")[0] : ""
  );

  // Update local state when value prop changes
  React.useEffect(() => {
    setStartDate(
      value?.start ? new Date(value.start).toISOString().split("T")[0] : ""
    );
    setEndDate(
      value?.end ? new Date(value.end).toISOString().split("T")[0] : ""
    );
  }, [value]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    const start = newStartDate ? new Date(newStartDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (!start && !end) {
      onChange(null);
    } else {
      onChange({ start, end });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    const start = startDate ? new Date(startDate) : null;
    const end = newEndDate ? new Date(newEndDate) : null;

    if (!start && !end) {
      onChange(null);
    } else {
      onChange({ start, end });
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onChange(null);
    setOpen(false);
  };

  const formatDateRange = () => {
    if (!value?.start && !value?.end) return "";

    const start = value.start ? new Date(value.start).toLocaleDateString() : "";
    const end = value.end ? new Date(value.end).toLocaleDateString() : "";

    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `From ${start}`;
    } else if (end) {
      return `Until ${end}`;
    }

    return "";
  };

  const hasValue = value?.start || value?.end;
  const isValidRange =
    !startDate || !endDate || new Date(startDate) <= new Date(endDate);

  return (
    <div className={cn("date-range-filter space-y-2", className)}>
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
            className={cn(
              "w-full min-w-[180px] justify-start text-left font-normal",
              !hasValue && "text-muted-foreground",
              hasValue && "border-primary/50 bg-primary/5"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {hasValue ? formatDateRange() : `Select ${label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${key}-start`} className="text-sm">
                Start Date
              </Label>
              <Input
                id={`${key}-start`}
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${key}-end`} className="text-sm">
                End Date
              </Label>
              <Input
                id={`${key}-end`}
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || undefined}
                className="w-full"
              />
            </div>

            {!isValidRange && (
              <p className="text-xs text-destructive">
                End date must be after start date
              </p>
            )}

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                disabled={!isValidRange}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangeFilter;
