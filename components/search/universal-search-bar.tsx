"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CityAreaCombobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useDebounce, useDebouncedCallback } from "@/hooks/use-debounce";
import { CITY_AREAS } from "@/lib/area-utils";
import { InlineLoading } from "@/components/ui/loading-states";
import {
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  AriaUtils,
  useFocusManagement,
} from "@/lib/accessibility-utils";

// Types
interface UniversalSearchBarProps {
  variant?: "header" | "hero" | "inline";
  placeholder?: string;
  showLocationFilter?: boolean;
  showCategoryFilter?: boolean;
  onSearch?: (query: string, filters: SearchFilters) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  initialQuery?: string;
  initialCity?: string;
  initialArea?: string;
  initialCategory?: string;
}

interface SearchFilters {
  query: string;
  city: string;
  area: string;
  category: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "popular" | "category" | "location";
  icon?: React.ReactNode;
  count?: number;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
}

// Mock data for suggestions (in real app, this would come from API)
const POPULAR_SEARCHES = [
  "Camera",
  "Car",
  "Wedding Hall",
  "Medical Equipment",
  "Construction Tools",
  "Electronics",
  "Furniture",
  "Sports Equipment",
];

const RECENT_SEARCHES_KEY = "universal_search_recent";
const MAX_RECENT_SEARCHES = 5;

export function UniversalSearchBar({
  variant = "header",
  placeholder,
  showLocationFilter = true,
  showCategoryFilter = false,
  onSearch,
  className,
  size = "md",
  initialQuery = "",
  initialCity = "Karachi",
  initialArea = "",
  initialCategory = "",
}: UniversalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Accessibility utilities
  const announcer = ScreenReaderAnnouncer.getInstance();
  const { saveFocus, restoreFocus } = useFocusManagement();

  // Generate unique IDs for ARIA relationships
  const searchInputId = useRef(AriaUtils.generateId("search-input")).current;
  const suggestionsId = useRef(
    AriaUtils.generateId("search-suggestions")
  ).current;
  const searchFormId = useRef(AriaUtils.generateId("search-form")).current;

  // Get cities from CITY_AREAS (memoized for performance)
  const cities = React.useMemo(() => Object.keys(CITY_AREAS), []);

  // Get default placeholder based on variant (memoized for performance)
  const getDefaultPlaceholder = React.useCallback(() => {
    switch (variant) {
      case "hero":
        return "e.g., Camera, Car, Wedding Hall...";
      case "header":
        return "Try 'DSLR camera', 'Car', 'Laptop'...";
      case "inline":
        return "Search for rental items...";
      default:
        return "Search for rental items...";
    }
  }, [variant]);

  const searchPlaceholder = React.useMemo(
    () => placeholder || getDefaultPlaceholder(),
    [placeholder, getDefaultPlaceholder]
  );

  // Load recent searches from localStorage
  const getRecentSearches = useCallback((): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const recent = localStorage.getItem(RECENT_SEARCHES_KEY);
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback(
    (searchQuery: string) => {
      if (typeof window === "undefined" || !searchQuery.trim()) return;

      try {
        const recent = getRecentSearches();
        const updated = [
          searchQuery,
          ...recent.filter((item) => item !== searchQuery),
        ].slice(0, MAX_RECENT_SEARCHES);

        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent search:", error);
      }
    },
    [getRecentSearches]
  );

  // Generate suggestions based on query
  const generateSuggestions = useCallback(
    (searchQuery: string): SearchSuggestion[] => {
      const suggestions: SearchSuggestion[] = [];
      const queryLower = searchQuery.toLowerCase();

      if (!searchQuery.trim()) {
        // Show recent searches when no query
        const recentSearches = getRecentSearches();
        recentSearches.forEach((search, index) => {
          suggestions.push({
            id: `recent-${index}`,
            text: search,
            type: "recent",
            icon: <Clock className="w-4 h-4" />,
          });
        });

        // Show popular searches
        POPULAR_SEARCHES.slice(0, 5).forEach((search, index) => {
          suggestions.push({
            id: `popular-${index}`,
            text: search,
            type: "popular",
            icon: <TrendingUp className="w-4 h-4" />,
          });
        });
      } else {
        // Filter popular searches based on query
        POPULAR_SEARCHES.filter((search) =>
          search.toLowerCase().includes(queryLower)
        )
          .slice(0, 5)
          .forEach((search, index) => {
            suggestions.push({
              id: `filtered-${index}`,
              text: search,
              type: "popular",
              icon: <TrendingUp className="w-4 h-4" />,
            });
          });

        // Add location suggestions if query matches cities
        cities
          .filter((city) => city.toLowerCase().includes(queryLower))
          .slice(0, 3)
          .forEach((city, index) => {
            suggestions.push({
              id: `location-${index}`,
              text: `${query} in ${city}`,
              type: "location",
              icon: <MapPin className="w-4 h-4" />,
            });
          });
      }

      return suggestions;
    },
    [getRecentSearches, cities]
  );

  // Debounced search for real-time suggestions
  const debouncedSuggestionUpdate = useDebouncedCallback(
    (searchQuery: string) => {
      const newSuggestions = generateSuggestions(searchQuery);
      setSuggestions(newSuggestions);
      setIsLoading(false);
    },
    200
  );

  // Update suggestions when debounced query changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(debouncedQuery);
    setSuggestions(newSuggestions);
  }, [debouncedQuery, generateSuggestions]);

  // Handle loading state
  useEffect(() => {
    setIsLoading(query !== debouncedQuery);
  }, [query, debouncedQuery]);

  // Handle search submission with accessibility announcements
  const handleSearch = useCallback(
    async (searchQuery?: string, filters?: Partial<SearchFilters>) => {
      const finalQuery = searchQuery || query;
      const finalFilters: SearchFilters = {
        query: finalQuery,
        city: selectedCity,
        area: selectedArea,
        category: selectedCategory,
        ...filters,
      };

      setIsSearching(true);

      try {
        // Announce search initiation
        if (finalQuery.trim()) {
          announcer.announce(`Searching for ${finalQuery}`, "polite");
        } else {
          announcer.announce("Starting search", "polite");
        }

        // Save to recent searches
        if (finalQuery.trim()) {
          saveRecentSearch(finalQuery.trim());
        }

        // Hide suggestions
        setShowSuggestions(false);
        setFocusedIndex(-1);

        // Call custom onSearch handler if provided
        if (onSearch) {
          await onSearch(finalQuery, finalFilters);
          return;
        }

        // Default behavior: navigate to search page
        const searchParams = new URLSearchParams();

        if (finalFilters.query) {
          searchParams.set("q", finalFilters.query);
        }
        if (finalFilters.city) {
          searchParams.set("city", finalFilters.city);
        }
        if (finalFilters.area) {
          searchParams.set("area", finalFilters.area);
        }
        if (finalFilters.category) {
          searchParams.set("category", finalFilters.category);
        }

        // Announce navigation
        announcer.announce("Navigating to search results", "polite");
        router.push(`/search?${searchParams.toString()}`);
      } catch (error) {
        console.error("Search failed:", error);
        announcer.announceError("Search failed. Please try again.");
      } finally {
        // Add small delay to show loading state
        setTimeout(() => setIsSearching(false), 500);
      }
    },
    [
      query,
      selectedCity,
      selectedArea,
      selectedCategory,
      onSearch,
      router,
      saveRecentSearch,
      announcer,
    ]
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click with accessibility announcements
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Announce selection
    announcer.announce(`Selected ${suggestion.text}`, "polite");

    if (suggestion.type === "location") {
      // Extract query and city from location suggestion
      const parts = suggestion.text.split(" in ");
      const searchQuery = parts[0];
      const city = parts[1];

      setQuery(searchQuery);
      setSelectedCity(city);
      handleSearch(searchQuery, { city });
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
  };

  // Handle keyboard navigation with accessibility enhancements
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      // Handle basic navigation even without suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        announcer.announce("Search suggestions closed");
      }
      return;
    }

    KeyboardNavigation.handleArrowNavigation(
      e,
      focusedIndex,
      suggestions.length,
      (newIndex) => {
        setFocusedIndex(newIndex);
        // Announce the focused suggestion
        if (newIndex >= 0 && newIndex < suggestions.length) {
          const suggestion = suggestions[newIndex];
          const label = AriaUtils.createSuggestionLabel(
            suggestion.text,
            suggestion.type,
            newIndex,
            suggestions.length
          );
          announcer.announce(label);
        }
      },
      true
    );

    KeyboardNavigation.handleTabNavigation(
      e,
      () => {
        // Escape handler
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        announcer.announce("Search suggestions closed");
      },
      () => {
        // Enter handler
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[focusedIndex]);
        } else {
          handleSearch();
        }
      }
    );
  };

  // Handle input focus with accessibility announcements
  const handleInputFocus = () => {
    setShowSuggestions(true);
    setFocusedIndex(-1);

    // Announce suggestions availability
    if (suggestions.length > 0) {
      announcer.announce(
        `${suggestions.length} search suggestions available. Use arrow keys to navigate.`
      );
    } else {
      announcer.announce("Search suggestions will appear as you type");
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear query with accessibility announcement
  const clearQuery = () => {
    setQuery("");
    setShowSuggestions(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
    announcer.announce("Search query cleared", "polite");
  };

  // Get size classes (memoized for performance)
  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case "sm":
        return {
          container: "h-8",
          input: "h-8 text-sm",
          button: "h-8 px-3",
        };
      case "lg":
        return {
          container: "h-12",
          input: "h-12 text-base",
          button: "h-12 px-6",
        };
      default:
        return {
          container: "h-10",
          input: "h-10 text-sm",
          button: "h-10 px-4",
        };
    }
  }, [size]);

  // Get variant-specific classes (memoized for performance)
  const variantClasses = React.useMemo(() => {
    switch (variant) {
      case "hero":
        return {
          wrapper: "bg-white rounded-lg shadow-xl border",
          form: "p-4 md:p-6",
          inputWrapper: "flex-1",
          locationWrapper: "w-full md:w-4/12 flex-shrink-0",
          searchWrapper: "w-full md:w-5/12 flex-grow",
          buttonWrapper: "w-full md:w-3/12 flex-shrink-0",
        };
      case "header":
        return {
          wrapper: "bg-white rounded-lg border",
          form: "p-2",
          inputWrapper: "flex-1",
          locationWrapper: "w-56",
          searchWrapper: "flex-1",
          buttonWrapper: "shrink-0",
        };
      case "inline":
        return {
          wrapper: "bg-background border rounded-md",
          form: "p-2 flex-col sm:flex-row",
          inputWrapper: "flex-1",
          locationWrapper: "w-full sm:w-48",
          searchWrapper: "flex-1",
          buttonWrapper: "shrink-0",
        };
      default:
        return {
          wrapper: "bg-white rounded-lg border",
          form: "p-2",
          inputWrapper: "flex-1",
          locationWrapper: "w-48",
          searchWrapper: "flex-1",
          buttonWrapper: "shrink-0",
        };
    }
  }, [variant]);

  return (
    <div ref={searchRef} className={cn("relative z-[100]", className)}>
      <div className={variantClasses.wrapper}>
        <form
          id={searchFormId}
          onSubmit={handleSubmit}
          className={cn(
            "flex gap-2 items-end",
            variant === "hero" ? "flex-col md:flex-row gap-4" : "flex-row",
            variantClasses.form
          )}
          role="search"
          aria-label="Search for rental items"
        >
          {/* Location Filter */}
          {showLocationFilter && (
            <div className={variantClasses.locationWrapper}>
              {variant === "hero" && (
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </label>
              )}
              <CityAreaCombobox
                cities={cities}
                selectedCity={selectedCity}
                selectedArea={selectedArea}
                onCityChange={setSelectedCity}
                onAreaChange={setSelectedArea}
                cityPlaceholder="City"
                areaPlaceholder="Area"
                className="flex-nowrap"
              />
            </div>
          )}

          {/* Search Input */}
          <div className={cn("relative", variantClasses.searchWrapper)}>
            {variant === "hero" && (
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                What are you looking for?
              </label>
            )}

            <div className="relative">
              <Input
                ref={inputRef}
                id={searchInputId}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                className={cn(
                  sizeClasses.input,
                  variant === "header"
                    ? "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                    : "border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                  "pl-10 pr-10 transition-all w-full"
                )}
                aria-label={AriaUtils.createFilterLabel(
                  "Search",
                  query || undefined
                )}
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
                aria-owns={showSuggestions ? suggestionsId : undefined}
                aria-activedescendant={
                  focusedIndex >= 0 && focusedIndex < suggestions.length
                    ? `${suggestionsId}-option-${focusedIndex}`
                    : undefined
                }
                role="combobox"
                autoComplete="off"
                aria-describedby={`${searchInputId}-description`}
              />

              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />

              {isLoading && query && (
                <div
                  className="absolute right-10 top-1/2 transform -translate-y-1/2"
                  aria-label="Loading suggestions"
                >
                  <InlineLoading size="sm" text="" />
                </div>
              )}

              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={AriaUtils.createClearFilterLabel("search query")}
                  tabIndex={0}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              {/* Hidden description for screen readers */}
              <div id={`${searchInputId}-description`} className="sr-only">
                Search for rental items. Use arrow keys to navigate suggestions
                when available.
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                id={suggestionsId}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[99999] max-h-80 overflow-y-auto"
                role="listbox"
                aria-label={`Search suggestions, ${suggestions.length} available`}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    id={`${suggestionsId}-option-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-3 transition-colors",
                      index === focusedIndex &&
                        "bg-primary/10 border-l-2 border-primary",
                      index === 0 && "rounded-t-md",
                      index === suggestions.length - 1 && "rounded-b-md"
                    )}
                    role="option"
                    aria-selected={index === focusedIndex}
                    aria-label={AriaUtils.createSuggestionLabel(
                      suggestion.text,
                      suggestion.type,
                      index,
                      suggestions.length
                    )}
                    tabIndex={-1}
                  >
                    <span
                      className="text-gray-400 flex-shrink-0"
                      aria-hidden="true"
                    >
                      {suggestion.icon}
                    </span>
                    <span className="text-sm text-gray-900 flex-1">
                      {suggestion.text}
                    </span>
                    {suggestion.type === "recent" && (
                      <span
                        className="text-xs text-gray-500"
                        aria-label="Recent search"
                      >
                        Recent
                      </span>
                    )}
                    {suggestion.type === "popular" && (
                      <span
                        className="text-xs text-gray-500"
                        aria-label="Popular search"
                      >
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className={variantClasses.buttonWrapper}>
            {variant === "hero" && (
              <label className="text-sm font-medium text-transparent block mb-2">
                Search
              </label>
            )}
            <Button
              type="submit"
              className={cn(
                sizeClasses.button,
                "bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                variant === "hero" || variant === "inline" ? "w-full" : "shrink-0 sm:w-auto"
              )}
              disabled={isSearching}
              aria-label={
                isSearching ? "Searching in progress" : "Start search"
              }
              aria-describedby={
                isSearching ? `${searchFormId}-status` : undefined
              }
            >
              <Search className="w-4 h-4 mr-2" aria-hidden="true" />
              {isSearching ? "Searching..." : "Search"}
            </Button>

            {/* Hidden status for screen readers */}
            {isSearching && (
              <div
                id={`${searchFormId}-status`}
                className="sr-only"
                aria-live="polite"
              >
                Search in progress, please wait
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UniversalSearchBar;
