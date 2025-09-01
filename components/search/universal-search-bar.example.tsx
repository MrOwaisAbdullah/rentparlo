/**
 * Example usage of UniversalSearchBar component
 * This file demonstrates different variants and configurations
 */

import React from "react";
import UniversalSearchBar from "./universal-search-bar";

export function UniversalSearchBarExamples() {
  const handleSearch = (query: string, filters: any) => {
    console.log("Search performed:", { query, filters });
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Header Variant</h2>
        <UniversalSearchBar
          variant="header"
          placeholder="Search in header..."
          showLocationFilter={true}
          onSearch={handleSearch}
          size="md"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Hero Variant</h2>
        <UniversalSearchBar
          variant="hero"
          placeholder="Find what you need..."
          showLocationFilter={true}
          onSearch={handleSearch}
          size="lg"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Inline Variant</h2>
        <UniversalSearchBar
          variant="inline"
          placeholder="Quick search..."
          showLocationFilter={false}
          onSearch={handleSearch}
          size="sm"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">With Initial Values</h2>
        <UniversalSearchBar
          variant="header"
          initialQuery="Camera"
          initialCity="Lahore"
          initialArea="DHA"
          showLocationFilter={true}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}

export default UniversalSearchBarExamples;
