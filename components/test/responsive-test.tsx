"use client";

import React from "react";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveText,
  useBreakpoint,
} from "@/components/layout/responsive-container";
import {
  ResponsiveFilterPanel,
  ActiveFiltersDisplay,
  ResponsiveSortControls,
} from "@/components/search/responsive-filter-panel";
import { ResponsiveSearchResults } from "@/components/search/responsive-search-results";
import { SearchFilters } from "@/components/search/search-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Test component to verify responsive design implementation
 * This component tests all responsive features and horizontal scroll prevention
 */
export function ResponsiveTest() {
  const breakpoint = useBreakpoint();
  const [filters, setFilters] = React.useState({
    category: "",
    city: "",
    area: "",
    condition: "",
    minPrice: 0,
    maxPrice: 0,
    availability: "",
    priceType: "",
  });
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = React.useState("newest");

  const mockCategories = [
    { _id: "1", title: "Electronics", slug: "electronics" },
    { _id: "2", title: "Vehicles", slug: "vehicles" },
    { _id: "3", title: "Furniture", slug: "furniture" },
  ];

  const mockCities = [
    { id: "1", name: "Karachi", province: "Sindh" },
    { id: "2", name: "Lahore", province: "Punjab" },
    { id: "3", name: "Islamabad", province: "Federal" },
  ];

  const mockActiveFilters = [
    { key: "category", label: "Category", value: "Electronics" },
    { key: "city", label: "City", value: "Karachi" },
    { key: "condition", label: "Condition", value: "New" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const handleFilterChange = (filterName: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      city: "",
      area: "",
      condition: "",
      minPrice: 0,
      maxPrice: 0,
      availability: "",
      priceType: "",
    });
  };

  const handleClearFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <ResponsiveContainer maxWidth="7xl" padding="default">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Responsive Design Test</h1>
            <Badge variant="outline">Current Breakpoint: {breakpoint}</Badge>
          </div>

          {/* Breakpoint Information */}
          <Card>
            <CardHeader>
              <CardTitle>Breakpoint Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid
                columns={{ mobile: 1, tablet: 2, desktop: 4 }}
                gap="default"
              >
                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold">Mobile</h3>
                  <p className="text-sm text-muted-foreground">320px+</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold">Tablet</h3>
                  <p className="text-sm text-muted-foreground">768px+</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold">Desktop</h3>
                  <p className="text-sm text-muted-foreground">1024px+</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold">Wide</h3>
                  <p className="text-sm text-muted-foreground">1440px+</p>
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>

          {/* Responsive Text Test */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveText
                  size={{ mobile: "sm", tablet: "base", desktop: "lg" }}
                >
                  This text changes size based on breakpoint: small on mobile,
                  base on tablet, large on desktop.
                </ResponsiveText>
                <ResponsiveText
                  size={{ mobile: "xs", tablet: "sm", desktop: "base" }}
                  className="text-muted-foreground"
                >
                  This is smaller responsive text for descriptions and secondary
                  content.
                </ResponsiveText>
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          <ActiveFiltersDisplay
            filters={mockActiveFilters}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearFilters}
          />

          {/* Sort Controls */}
          <ResponsiveSortControls
            sortOptions={sortOptions}
            currentSort={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Filter Panel Test */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Filter Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveFilterPanel
                activeFilterCount={mockActiveFilters.length}
                onClearAll={handleClearFilters}
                title="Test Filters"
              >
                <SearchFilters
                  categories={mockCategories}
                  cities={mockCities}
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </ResponsiveFilterPanel>
            </CardContent>
          </Card>

          {/* Grid Layout Test */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Grid Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid
                columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}
                gap="default"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Item {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        This is a test item to demonstrate responsive grid
                        layout.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </CardContent>
          </Card>

          {/* Flex Layout Test */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Flex Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveFlex
                justify="between"
                align="center"
                gap="default"
                className="bg-muted p-4 rounded"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    Long Title That Should Truncate
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    This is a long description that should also truncate
                    properly on smaller screens.
                  </p>
                </div>
                <Button className="flex-shrink-0">Action</Button>
              </ResponsiveFlex>
            </CardContent>
          </Card>

          {/* Search Results Test */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveSearchResults
                totalResults={24}
                currentPage={1}
                totalPages={3}
                viewMode={viewMode}
                onPageChange={(page) => console.log("Page:", page)}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Result {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        Search result item with responsive layout.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveSearchResults>
            </CardContent>
          </Card>

          {/* Overflow Test */}
          <Card>
            <CardHeader>
              <CardTitle>Horizontal Scroll Prevention Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The following content should never cause horizontal scrolling:
                </p>

                <ResponsiveContainer className="bg-muted p-4 rounded">
                  <div className="space-y-2">
                    <div className="w-full bg-primary h-4 rounded"></div>
                    <div className="w-3/4 bg-secondary h-4 rounded"></div>
                    <div className="w-1/2 bg-accent h-4 rounded"></div>
                  </div>
                </ResponsiveContainer>

                <ResponsiveFlex gap="sm" className="bg-muted p-4 rounded">
                  {Array.from({ length: 10 }, (_, i) => (
                    <Badge key={i} variant="outline" className="flex-shrink-0">
                      Tag {i + 1}
                    </Badge>
                  ))}
                </ResponsiveFlex>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
