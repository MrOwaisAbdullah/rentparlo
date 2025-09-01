/**
 * Test script to verify blog pages are using the unified system
 * This script checks that the blog pages are properly integrated with UnifiedBlogSearch and UniversalPageLayout
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(test: string, passed: boolean, message: string) {
  results.push({ test, passed, message });
  console.log(`${passed ? "✅" : "❌"} ${test}: ${message}`);
}

function checkFileContains(
  filePath: string,
  searchStrings: string[],
  testName: string
) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const missingStrings = searchStrings.filter(
      (str) => !content.includes(str)
    );

    if (missingStrings.length === 0) {
      addResult(testName, true, `All required imports/components found`);
      return true;
    } else {
      addResult(testName, false, `Missing: ${missingStrings.join(", ")}`);
      return false;
    }
  } catch (error) {
    addResult(testName, false, `Error reading file: ${error}`);
    return false;
  }
}

function checkFileDoesNotContain(
  filePath: string,
  searchStrings: string[],
  testName: string
) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const foundStrings = searchStrings.filter((str) => content.includes(str));

    if (foundStrings.length === 0) {
      addResult(testName, true, `Old components properly removed`);
      return true;
    } else {
      addResult(testName, false, `Still contains: ${foundStrings.join(", ")}`);
      return false;
    }
  } catch (error) {
    addResult(testName, false, `Error reading file: ${error}`);
    return false;
  }
}

console.log("🧪 Testing Blog Unified System Integration...\n");

// Test 1: Check main blog page uses UnifiedBlogSearch and UniversalPageLayout
checkFileContains(
  "app/blog/page.tsx",
  [
    "UnifiedBlogSearch",
    "UniversalPageLayout",
    'pageType="blog"',
    "showSidebar={true}",
    "dateFrom: params.dateFrom",
    "dateTo: params.dateTo",
  ],
  "Main blog page unified integration"
);

// Test 2: Check main blog page doesn't use old BlogClientWrapper
checkFileDoesNotContain(
  "app/blog/page.tsx",
  ["BlogClientWrapper"],
  "Main blog page old component removal"
);

// Test 3: Check blog category page uses UnifiedBlogSearch and UniversalPageLayout
checkFileContains(
  "app/blog/category/[category]/page.tsx",
  [
    "UnifiedBlogSearch",
    "UniversalPageLayout",
    'pageType="blog"',
    "showSidebar={true}",
    "categoryId: category._id",
    "categorySlug: params.category",
    "categoryTitle: category.title",
  ],
  "Blog category page unified integration"
);

// Test 4: Check blog category page doesn't use old BlogClientWrapper
checkFileDoesNotContain(
  "app/blog/category/[category]/page.tsx",
  ["BlogClientWrapper"],
  "Blog category page old component removal"
);

// Test 5: Check UnifiedBlogSearch component exists and has proper interface
checkFileContains(
  "components/search/unified-blog-search.tsx",
  [
    "interface UnifiedBlogSearchProps",
    "onFiltersChange",
    "onPageChange",
    "onSearch",
    'layout?: "sidebar" | "top" | "inline"',
    "showSidebar?: boolean",
  ],
  "UnifiedBlogSearch component interface"
);

// Test 6: Check UniversalPageLayout component exists and supports blog pages
checkFileContains(
  "components/layout/universal-page-layout.tsx",
  [
    'pageType: "search" | "category" | "blog"',
    "UniversalSidebar",
    "SidebarProvider",
  ],
  "UniversalPageLayout blog support"
);

// Test 7: Check sidebar context supports blog content
checkFileContains(
  "contexts/sidebar-context.tsx",
  [
    'pageType: "search" | "category" | "blog"',
    'case "blog":',
    "related-posts",
    "getRelatedPosts",
  ],
  "Sidebar context blog support"
);

// Test 8: Check that the build passes
try {
  console.log("\n🔨 Running build test...");
  execSync("npm run build", { stdio: "pipe" });
  addResult("Build test", true, "Build completed successfully");
} catch (error) {
  addResult("Build test", false, "Build failed");
}

// Summary
console.log("\n📊 Test Summary:");
console.log("================");

const passedTests = results.filter((r) => r.passed).length;
const totalTests = results.length;

console.log(`Passed: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log(
    "\n🎉 All tests passed! Blog pages are successfully using the unified system."
  );
  console.log("\n✨ Key improvements implemented:");
  console.log("   • Replaced BlogClientWrapper with UnifiedBlogSearch");
  console.log("   • Integrated UniversalPageLayout with sidebar support");
  console.log(
    "   • Added blog-specific sidebar content (related posts, categories, ads)"
  );
  console.log("   • Implemented proper blog filter state management");
  console.log("   • Added support for additional filters (dateFrom, dateTo)");
  console.log(
    "   • Maintained existing blog functionality while improving consistency"
  );
} else {
  console.log("\n❌ Some tests failed. Please review the issues above.");
  process.exit(1);
}
