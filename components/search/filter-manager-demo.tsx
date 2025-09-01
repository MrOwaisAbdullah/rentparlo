"use client";

import React from "react";
import { FilterManager } from "./filter-manager";
import { FilterConfig } from "@/types/search";

const demoFilterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select category",
    options: [
      { value: "electronics", label: "Electronics", count: 150 },
      { value: "furniture", label: "Furniture", count: 89 },
      { value: "vehicles", label: "Vehicles", count: 234 },
    ],
  },
  {
    key: "price",
    type: "range",
    label: "Price Range (PKR)",
    min: 0,
    max: 100000,
    step: 1000,
  },
  {
    key: "condition",
    type: "select",
    label: "Condition",
    placeholder: "Select condition",
    options: [
      { value: "new", label: "New" },
      { value: "used", label: "Used" },
      { value: "refurbished", label: "Refurbished" },
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
    placeholder: "Search for items...",
  },
];

export function FilterManagerDemo() {
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    console.log("Filter changed:", key, value);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilter = (key: string) => {
    console.log("Clear filter:", key);
    setFilters((prev) => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleClearAll = () => {
    console.log("Clear all filters");
    setFilters({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">FilterManager Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the FilterManager component with
          clear/reset functionality.
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Filter Controls</h2>
        <FilterManager
          filters={filters}
          filterConfig={demoFilterConfig}
          onFilterChange={handleFilterChange}
          onClearFilter={handleClearFilter}
          onClearAll={handleClearAll}
          layout="horizontal"
          showFilterToggle={true}
          filterToggleLabel="Filters"
          clearAllLabel="Clear All"
          responsive={true}
        />
      </div>

      <div className="border rounded-lg p-6 bg-muted/50">
        <h2 className="text-xl font-semibold mb-4">Current Filter State</h2>
        <pre className="text-sm bg-background p-4 rounded border overflow-auto">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Features Demonstrated</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Individual filter clear buttons</li>
            <li>✅ Clear all functionality</li>
            <li>✅ Active filter display</li>
            <li>✅ Responsive layout</li>
            <li>✅ Multiple filter types</li>
            <li>✅ Real-time state updates</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Filter Types Included</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Select dropdown (Category, Condition)</li>
            <li>• Range input (Price Range)</li>
            <li>• Checkbox (Featured)</li>
            <li>• Search input (Search Items)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FilterManagerDemo;
