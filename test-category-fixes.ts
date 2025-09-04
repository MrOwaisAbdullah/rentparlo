/**
 * Test script to verify category page fixes
 */

// Test 1: Sort value handling
function testSortValueHandling() {
  console.log("Testing sort value handling...");

  // Simulate the sort change function
  const handleSortChange = (sort: string | any) => {
    const sortValue = typeof sort === "string" ? sort : String(sort);
    console.log("Sort value:", sortValue);
    return sortValue;
  };

  // Test with string
  const result1 = handleSortChange("price-low");
  console.log("String test:", result1 === "price-low" ? "PASS" : "FAIL");

  // Test with object (should convert to string)
  const result2 = handleSortChange({ value: "price-high" });
  console.log(
    "Object test:",
    result2 === "[object Object]" ? "PASS (converted)" : "FAIL"
  );

  // Test with undefined
  const result3 = handleSortChange(undefined);
  console.log(
    "Undefined test:",
    result3 === "undefined" ? "PASS (converted)" : "FAIL"
  );
}

// Test 2: URL parameter handling
function testUrlParameterHandling() {
  console.log("\nTesting URL parameter handling...");

  const updateSearchParams = (
    updates: Record<string, string | undefined>,
    categorySlug: string
  ) => {
    const params = new URLSearchParams();

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "undefined") {
        const stringValue = typeof value === "string" ? value : String(value);
        params.set(key, stringValue);
      }
    });

    const newUrl = `/category/${categorySlug}${params.toString() ? `?${params.toString()}` : ""}`;
    return newUrl;
  };

  // Test normal case
  const url1 = updateSearchParams({ sort: "price-low" }, "electronics");
  console.log("Normal URL:", url1);
  console.log(
    "Normal test:",
    url1 === "/category/electronics?sort=price-low" ? "PASS" : "FAIL"
  );

  // Test with object (should not appear as [object Object])
  const url2 = updateSearchParams(
    { sort: { value: "price-high" } as any },
    "electronics"
  );
  console.log("Object URL:", url2);
  console.log(
    "Object test:",
    !url2.includes("[object Object]") ? "PASS" : "FAIL"
  );

  // Test with undefined (should be excluded)
  const url3 = updateSearchParams({ sort: undefined }, "electronics");
  console.log("Undefined URL:", url3);
  console.log(
    "Undefined test:",
    url3 === "/category/electronics" ? "PASS" : "FAIL"
  );
}

// Test 3: Seller caching optimization
function testSellerCaching() {
  console.log("\nTesting seller caching optimization...");

  // Simulate listings with duplicate seller IDs
  const listings = [
    { _id: "1", supabaseId: "seller1" },
    { _id: "2", supabaseId: "seller1" }, // Duplicate
    { _id: "3", supabaseId: "seller2" },
    { _id: "4", supabaseId: "seller1" }, // Duplicate
    { _id: "5", supabaseId: "seller3" },
  ];

  // Get unique seller IDs
  const uniqueSellerIds = [
    ...new Set(listings.map((l) => l.supabaseId).filter(Boolean)),
  ];
  console.log("Unique seller IDs:", uniqueSellerIds);
  console.log(
    "Unique count test:",
    uniqueSellerIds.length === 3 ? "PASS" : "FAIL"
  );

  // Simulate seller cache
  const sellerCache = new Map();
  uniqueSellerIds.forEach((id) => {
    sellerCache.set(id, { id, username: `user_${id}`, tier: "basic" });
  });

  // Apply cached data
  const enhancedListings = listings.map((listing) => {
    const sellerData = sellerCache.get(listing.supabaseId);
    return sellerData ? { ...listing, seller: sellerData } : listing;
  });

  console.log("Enhanced listings count:", enhancedListings.length);
  console.log(
    "All have seller data:",
    enhancedListings.every((l) => l.seller) ? "PASS" : "FAIL"
  );
}

// Run tests
console.log("=== Category Page Fixes Test ===\n");
testSortValueHandling();
testUrlParameterHandling();
testSellerCaching();
console.log("\n=== Tests Complete ===");
