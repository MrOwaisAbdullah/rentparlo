"use client";

import React from "react";
import { FilterManager } from "./filter-manager";
import { FilterConfig } from "@/types/search";

// Example filter configurations for different use cases
const listingFilterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "electronics", label: "Electronics", count: 150 },
      { value: "furniture", label: "Furniture", count: 89 },
      { value: "vehicles", label: "Vehicles", count: 234 },
      { value: "clothing", label: "Clothing", count: 67 },
      { value: "books", label: "Books", count: 45 },
    ],
  },
  {
    key: "location",
    type: "select",
    label: "Location",
    placeholder: "Select city",
    options: [
      { value: "karachi", label: "Karachi", count: 320 },
      { value: "lahore", label: "Lahore", count: 280 },
      { value: "islamabad", label: "Islamabad", count: 150 },
      { value: "faisalabad", label: "Faisalabad", count: 95 },
      { value: "rawalpindi", label: "Rawalpindi", count: 87 },
    ],
  },
  {
    key: "price",
    type: "range",
    label: "Price Range (PKR)",
    min: 0,
    max: 1000000,
    step: 1000,
  },
  {
    key: "condition",
    type: "select",
    label: "Condition",
    placeholder: "Select condition",
    options: [
      { value: "new", label: "New", count: 234 },
      { value: "like-new", label: "Like New", count: 156 },
      { value: "good", label: "Good", count: 298 },
      { value: "fair", label: "Fair", count: 87 },
    ],
  },
  {
    key: "availability",
    type: "select",
    label: "Availability",
    placeholder: "Select availability",
    options: [
      { value: "available", label: "Available Now", count: 456 },
      { value: "upcoming", label: "Available Soon", count: 123 },
      { value: "booked", label: "Currently Booked", count: 67 },
    ],
  },
  {
    key: "priceType",
    type: "select",
    label: "Price Type",
    placeholder: "Select price type",
    options: [
      { value: "hourly", label: "Per Hour", count: 234 },
      { value: "daily", label: "Per Day", count: 345 },
      { value: "weekly", label: "Per Week", count: 156 },
      { value: "monthly", label: "Per Month", count: 89 },
    ],
  },
  {
    key: "featured",
    type: "checkbox",
    label: "Featured Items Only",
  },
  {
    key: "search",
    type: "search",
    label: "Search Items",
    placeholder: "Search for rental items...",
  },
];

const blogFilterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "rental-tips", label: "Rental Tips", count: 45 },
      { value: "market-trends", label: "Market Trends", count: 32 },
      { value: "how-to-guides", label: "How-to Guides", count: 67 },
      { value: "news", label: "News", count: 23 },
      { value: "reviews", label: "Reviews", count: 34 },
    ],
  },
  {
    key: "tags",
    type: "multiselect",
    label: "Tags",
    placeholder: "Select tags",
    options: [
      { value: "popular", label: "Popular", count: 89 },
      { value: "trending", label: "Trending", count: 56 },
      { value: "new-arrival", label: "New Arrival", count: 23 },
      { value: "featured", label: "Featured", count: 34 },
      { value: "beginner-friendly", label: "Beginner Friendly", count: 45 },
    ],
  },
  {
    key: "language",
    type: "select",
    label: "Language",
    placeholder: "Select language",
    options: [
      { value: "en", label: "English", count: 156 },
      { value: "ur", label: "Urdu", count: 89 },
    ],
  },
  {
    key: "dateRange",
    type: "date",
    label: "Publication Date",
  },
  {
    key: "featured",
    type: "checkbox",
    label: "Featured Posts Only",
  },
  {
    key: "search",
    type: "search",
    label: "Search Posts",
    placeholder: "Search blog posts...",
  },
];

export function FilterManagerExample() {
  const [listingFilters, setListingFilters] = React.useState<
    Record<string, any>
  >({});
  const [blogFilters, setBlogFilters] = React.useState<Record<string, any>>({});

  // Listing filter handlers
  const handleListingFilterChange = (key: string, value: any) => {
    setListingFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleListingClearFilter = (key: string) => {
    setListingFilters((prev) => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleListingClearAll = () => {
    setListingFilters({});
  };

  // Blog filter handlers
  const handleBlogFilterChange = (key: string, value: any) => {
    setBlogFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBlogClearFilter = (key: string) => {
    setBlogFilters((prev) => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleBlogClearAll = () => {
    setBlogFilters({});
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">FilterManager Examples</h2>
        <p className="text-muted-foreground mb-6">
          Demonstration of the FilterManager component with different
          configurations and layouts.
        </p>
      </div>

      {/* Listing Filters - Horizontal Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Listing Filters (Horizontal Layout)
        </h3>
        <div className="border rounded-lg p-4">
          <FilterManager
            filters={listingFilters}
            filterConfig={listingFilterConfig}
            onFilterChange={handleListingFilterChange}
            onClearFilter={handleListingClearFilter}
            onClearAll={handleListingClearAll}
            layout="horizontal"
            showFilterToggle={true}
            filterToggleLabel="Listing Filters"
            clearAllLabel="Clear All Filters"
            responsive={true}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Current Filters:</strong>{" "}
          {JSON.stringify(listingFilters, null, 2)}
        </div>
      </div>

      {/* Blog Filters - Grid Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Blog Filters (Grid Layout)</h3>
        <div className="border rounded-lg p-4">
          <FilterManager
            filters={blogFilters}
            filterConfig={blogFilterConfig}
            onFilterChange={handleBlogFilterChange}
            onClearFilter={handleBlogClearFilter}
            onClearAll={handleBlogClearAll}
            layout="grid"
            showFilterToggle={false}
            clearAllLabel="Reset Filters"
            responsive={true}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Current Filters:</strong>{" "}
          {JSON.stringify(blogFilters, null, 2)}
        </div>
      </div>

      {/* Compact Filters - Vertical Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Compact Filters (Vertical Layout)
        </h3>
        <div className="border rounded-lg p-4 max-w-md">
          <FilterManager
            filters={listingFilters}
            filterConfig={listingFilterConfig.slice(0, 3)} // Only show first 3 filters
            onFilterChange={handleListingFilterChange}
            onClearFilter={handleListingClearFilter}
            onClearAll={handleListingClearAll}
            layout="vertical"
            showFilterToggle={false}
            showActiveFilters={true}
            responsive={false}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usage Instructions</h3>
        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p>
            <strong>Layout Options:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <code>horizontal</code> - Filters arranged horizontally,
              responsive to screen size
            </li>
            <li>
              <code>vertical</code> - Filters stacked vertically
            </li>
            <li>
              <code>grid</code> - Filters arranged in a responsive grid
            </li>
          </ul>

          <p className="pt-2">
            <strong>Key Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Individual filter clear buttons</li>
            <li>Clear all functionality with confirmation for many filters</li>
            <li>Active filter display with visual indicators</li>
            <li>Responsive design that prevents horizontal scrolling</li>
            <li>Keyboard navigation and accessibility support</li>
            <li>Debounced search input</li>
            <li>Validation for range filters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FilterManagerExample;
