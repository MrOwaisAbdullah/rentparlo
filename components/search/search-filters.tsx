"use client";

import React from "react";
import { Check, ChevronDown, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAreasForCity, hasAreas } from "@/lib/area-utils";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  ResponsiveFlex,
  ResponsiveGrid,
} from "@/components/layout/responsive-container";
import { ScreenReaderAnnouncer, AriaUtils } from "@/lib/accessibility-utils";

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

interface City {
  id: string;
  name: string;
  province: string;
}

interface SearchFiltersProps {
  categories: Category[];
  cities: City[];
  currentFilters: {
    category: string;
    city: string;
    area: string;
    condition: string;
    minPrice: number;
    maxPrice: number;
    availability?: string;
    priceType?: string;
  };
  onFilterChange: (filterName: string, value: string | number) => void;
  onClearFilters: () => void;
  className?: string;
  limitedFilters?: string[]; // Only show these filters if provided
}

const CONDITIONS = [
  { value: "any", label: "All Conditions" },
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "any", label: "All Price Types" },
  { value: "hourly", label: "Per Hour" },
  { value: "daily", label: "Per Day" },
  { value: "weekly", label: "Per Week" },
  { value: "monthly", label: "Per Month" },
];

const PRICE_RANGES = [
  { min: 0, max: 1000, label: "Under ₨1,000" },
  { min: 1000, max: 5000, label: "₨1,000 - ₨5,000" },
  { min: 5000, max: 10000, label: "₨5,000 - ₨10,000" },
  { min: 10000, max: 25000, label: "₨10,000 - ₨25,000" },
  { min: 25000, max: 50000, label: "₨25,000 - ₨50,000" },
  { min: 50000, max: 0, label: "Above ₨50,000" },
];

export function SearchFilters({
  categories,
  cities,
  currentFilters,
  onFilterChange,
  onClearFilters,
  className,
  limitedFilters,
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState({
    category: currentFilters.category || "any",
    city: currentFilters.city || "any",
    area: currentFilters.area || "any",
    condition: currentFilters.condition || "any",
    minPrice: currentFilters.minPrice || 0,
    maxPrice: currentFilters.maxPrice || 100000,
    availability: currentFilters.availability || "any",
    priceType: currentFilters.priceType || "any",
  });
  
  const [priceRange, setPriceRange] = React.useState([
    currentFilters.minPrice || 0,
    currentFilters.maxPrice || 100000,
  ]);
  
  const [openSections, setOpenSections] = React.useState({
    category: true,
    location: true,
    condition: true,
    priceType: true,
    price: true,
  });
  
  const [openCityPopover, setOpenCityPopover] = React.useState(false);
  const [openAreaPopover, setOpenAreaPopover] = React.useState(false);
  const [areaError, setAreaError] = React.useState<string | null>(null);

  // Accessibility utilities
  const announcer = ScreenReaderAnnouncer.getInstance();

  // Generate unique IDs for ARIA relationships
  const filtersContainerId = React.useRef(
    AriaUtils.generateId("search-filters")
  ).current;

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));

    // Announce price range change
    announcer.announce(
      `Price range changed to ${formatPrice(values[0])} to ${formatPrice(values[1])}`,
      "polite"
    );
  };

  const handlePriceRangeSelect = (min: number, max: number) => {
    const newRange = max === 0 ? [min, 100000] : [min, max];
    setPriceRange(newRange);
    setLocalFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max || 100000
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.category && localFilters.category !== "any") count++;
    if (localFilters.city && localFilters.city !== "any") count++;
    if (localFilters.area && localFilters.area !== "any") count++;
    if (localFilters.condition && localFilters.condition !== "any") count++;
    if (localFilters.priceType && localFilters.priceType !== "any") count++;
    if (localFilters.minPrice > 0 || localFilters.maxPrice > 0) count++;
    return count;
  };

  const toggleSection = (section: keyof typeof openSections) => {
    const isOpening = !openSections[section];
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

    // Announce section toggle
    announcer.announce(
      `${section} filter section ${isOpening ? "expanded" : "collapsed"}`,
      "polite"
    );
  };

  // Get areas for the selected city
  const areas = getAreasForCity(localFilters.city);

  // Check if selected city has areas defined
  const cityHasAreas = hasAreas(localFilters.city);

  // Handle city selection with area validation
  const handleCitySelect = (cityValue: string) => {
    setLocalFilters(prev => ({
      ...prev,
      city: cityValue,
      area: "any" // Reset area when city changes
    }));

    // If the city doesn't have defined areas, clear any existing area filter
    if (!hasAreas(cityValue)) {
      setAreaError(null);
    }

    setOpenCityPopover(false);
  };

  // Handle area selection with validation
  const handleAreaSelect = (areaValue: string) => {
    // Validate that the selected area is valid for the current city
    if (
      localFilters.city &&
      areaValue &&
      areaValue !== "any" &&
      !getAreasForCity(localFilters.city).includes(areaValue)
    ) {
      setAreaError(
        `"${areaValue}" is not a valid area for ${localFilters.city}`
      );
      return;
    }

    setLocalFilters(prev => ({
      ...prev,
      area: areaValue
    }));
    
    setAreaError(null);
    setOpenAreaPopover(false);
  };

  // Apply all filters
  const applyFilters = () => {
    // Apply all local filters
    Object.entries(localFilters).forEach(([key, value]) => {
      // Only apply filters that are not "any"
      if (value !== "any") {
        onFilterChange(key, value);
      } else {
        // For "any" values, we pass empty string to clear the filter
        onFilterChange(key, "");
      }
    });
    
    // Announce filter application
    announcer.announce("Filters applied", "polite");
  };

  // Group cities by province
  const citiesByProvince = cities.reduce(
    (acc, city) => {
      if (!acc[city.province]) {
        acc[city.province] = [];
      }
      acc[city.province].push(city);
      return acc;
    },
    {} as Record<string, City[]>
  );

  // Helper function to check if a filter should be shown
  const shouldShowFilter = (filterName: string) => {
    return !limitedFilters || limitedFilters.includes(filterName);
  };

  return (
    <ResponsiveContainer className={className} preventHorizontalScroll={true}>
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <ResponsiveFlex
            justify="between"
            align="center"
            className="w-full"
            preventOverflow={true}
          >
            <CardTitle className="text-lg flex-shrink-0">Filters</CardTitle>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClearFilters();
                  announcer.announceAllFiltersCleared();
                }}
                className="text-sm text-muted-foreground hover:text-foreground flex-shrink-0 ml-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Clear all ${getActiveFilterCount()} active filters`}
              >
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
                <X className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            )}
          </ResponsiveFlex>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 overflow-hidden">
          {/* Category Filter */}
          {shouldShowFilter("category") && (
            <>
              <Collapsible
                open={openSections.category}
                onOpenChange={() => toggleSection("category")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                  <Label className="text-sm font-semibold">Category</Label>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openSections.category ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <Select
                    value={localFilters.category}
                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.slug}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Location Filter */}
          {(shouldShowFilter("city") || shouldShowFilter("area")) && (
            <>
              <Collapsible
                open={openSections.location}
                onOpenChange={() => toggleSection("location")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                  <Label className="text-sm font-semibold">Location</Label>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openSections.location ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {/* City Filter with Searchable Combo */}
                  <Popover
                    open={openCityPopover}
                    onOpenChange={setOpenCityPopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCityPopover}
                        aria-haspopup="listbox"
                        aria-label={AriaUtils.createFilterLabel(
                          "City",
                          localFilters.city !== "any" ? localFilters.city : "No city selected"
                        )}
                        className="w-full justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {localFilters.city && localFilters.city !== "any"
                          ? localFilters.city
                          : "Select city..."}
                        <ChevronDown
                          className="ml-2 h-4 w-4 shrink-0 opacity-50"
                          aria-hidden="true"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full max-w-xs sm:max-w-sm p-0 overflow-hidden">
                      <Command>
                        <CommandInput
                          placeholder="Search city..."
                          className="text-sm"
                          aria-label="Search for a city"
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => handleCitySelect("any")}
                              className="text-sm"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  localFilters.city === "any"
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">All Cities</span>
                            </CommandItem>
                            {Object.entries(citiesByProvince).map(
                              ([province, provinceCities]) => (
                                <React.Fragment key={province}>
                                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground truncate">
                                    {province}
                                  </div>
                                  {provinceCities.map((city) => (
                                    <CommandItem
                                      key={city.id}
                                      value={city.name}
                                      onSelect={handleCitySelect}
                                      className="text-sm"
                                      role="option"
                                      aria-selected={
                                        localFilters.city === city.name
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 flex-shrink-0",
                                          localFilters.city === city.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                        aria-hidden="true"
                                      />
                                      <span className="truncate">
                                        {city.name}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </React.Fragment>
                              )
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Area Filter - only show if city has areas */}
                  {localFilters.city && localFilters.city !== "any" && (
                    <>
                      <Label className="text-sm mt-3">Area</Label>
                      {cityHasAreas ? (
                        <Popover
                          open={openAreaPopover}
                          onOpenChange={setOpenAreaPopover}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openAreaPopover}
                              className="w-full justify-between"
                            >
                              {localFilters.area && localFilters.area !== "any"
                                ? localFilters.area
                                : "Select area..."}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full max-w-xs sm:max-w-sm p-0 overflow-hidden">
                            <Command>
                              <CommandInput
                                placeholder="Search area..."
                                className="text-sm"
                              />
                              <CommandList className="max-h-60 overflow-y-auto">
                                <CommandEmpty>No area found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => handleAreaSelect("any")}
                                    className="text-sm"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        localFilters.area === "any"
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="truncate">All Areas</span>
                                  </CommandItem>
                                  {areas.map((area, index) => (
                                    <CommandItem
                                      key={index}
                                      onSelect={handleAreaSelect}
                                      className="text-sm"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 flex-shrink-0",
                                          localFilters.area === area
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="truncate">{area}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No specific areas defined for {localFilters.city}.
                            Showing results for the entire city.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Area Error Message */}
                      {areaError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{areaError}</AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Condition Filter */}
          {shouldShowFilter("condition") && (
            <>
              <Collapsible
                open={openSections.condition}
                onOpenChange={() => toggleSection("condition")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                  <Label className="text-sm font-semibold">Condition</Label>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openSections.condition ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <Select
                    value={localFilters.condition}
                    onValueChange={(value) =>
                      setLocalFilters(prev => ({ ...prev, condition: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Price Type Filter */}
          {shouldShowFilter("priceType") && (
            <>
              <Collapsible
                open={openSections.priceType}
                onOpenChange={() => toggleSection("priceType")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                  <Label className="text-sm font-semibold">Price Type</Label>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openSections.priceType ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <Select
                    value={localFilters.priceType}
                    onValueChange={(value) =>
                      setLocalFilters(prev => ({ ...prev, priceType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Price Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Price Filter */}
          {shouldShowFilter("minPrice") ||
          shouldShowFilter("maxPrice") ||
          shouldShowFilter("price") ? (
            <>
              <Collapsible
                open={openSections.price}
                onOpenChange={() => toggleSection("price")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                  <Label className="text-sm font-semibold">Price Range</Label>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openSections.price ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-2 overflow-hidden">
                  {/* Quick Price Ranges */}
                  <ResponsiveGrid
                    columns={{
                      mobile: 1,
                      tablet: 2,
                      desktop: 1,
                    }}
                    gap="sm"
                    className="w-full"
                    preventOverflow={true}
                  >
                    {PRICE_RANGES.map((range, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left h-auto py-2 w-full min-w-0 overflow-hidden",
                          localFilters.minPrice === range.min &&
                            (localFilters.maxPrice === range.max ||
                              (range.max === 0 &&
                                localFilters.maxPrice >= 50000))
                            ? "bg-primary text-primary-foreground"
                            : ""
                        )}
                        onClick={() =>
                          handlePriceRangeSelect(range.min, range.max)
                        }
                      >
                        <span className="truncate">{range.label}</span>
                      </Button>
                    ))}
                  </ResponsiveGrid>

                  {/* Custom Price Range */}
                  <div className="space-y-4 w-full overflow-hidden">
                    <div className="w-full">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        <span className="hidden sm:inline">Custom Range: </span>
                        <span className="truncate">
                          {formatPrice(priceRange[0])} -{" "}
                          {formatPrice(priceRange[1])}
                        </span>
                      </Label>
                      <div className="w-full px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={handlePriceRangeChange}
                          max={100000}
                          min={0}
                          step={1000}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <ResponsiveGrid
                      columns={{
                        mobile: 1,
                        tablet: 2,
                        desktop: 2,
                      }}
                      gap="sm"
                      className="w-full"
                      preventOverflow={true}
                    >
                      <div className="w-full min-w-0">
                        <Label className="text-xs text-muted-foreground">
                          Min Price
                        </Label>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const newRange = [value, priceRange[1]];
                            setPriceRange(newRange);
                            setLocalFilters(prev => ({ ...prev, minPrice: value }));
                          }}
                          placeholder="0"
                          className="text-sm w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label className="text-xs text-muted-foreground">
                          Max Price
                        </Label>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 100000;
                            const newRange = [priceRange[0], value];
                            setPriceRange(newRange);
                            setLocalFilters(prev => ({ ...prev, maxPrice: value }));
                          }}
                          placeholder="100000"
                          className="text-sm w-full"
                        />
                      </div>
                    </ResponsiveGrid>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : null}
          
          {/* Apply Button */}
          <Button className="w-full" onClick={applyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}

export default SearchFilters;