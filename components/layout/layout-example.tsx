"use client";

import React from "react";
import {
  UniversalPageLayout,
  SearchPageLayout,
  CategoryPageLayout,
  BlogPageLayout,
} from "./universal-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Example component to demonstrate the layout system
export function LayoutExample() {
  const [currentLayout, setCurrentLayout] = React.useState<
    "search" | "category" | "blog"
  >("search");

  const renderContent = () => {
    switch (currentLayout) {
      case "search":
        return (
          <SearchPageLayout
            searchQuery="camera rental"
            filters={{ category: "electronics", city: "karachi" }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This is the search page content with simplified filters and
                  sidebar.
                </p>
                <p>Filters: sorting, pricing, condition, area, availability</p>
              </CardContent>
            </Card>
          </SearchPageLayout>
        );

      case "category":
        return (
          <CategoryPageLayout
            categoryId="electronics"
            categorySlug="electronics"
            categoryTitle="Electronics"
          >
            <Card>
              <CardHeader>
                <CardTitle>Electronics Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This is the category page content with full filters and
                  sidebar.
                </p>
                <p>
                  Includes category-specific ads and related categories in
                  sidebar.
                </p>
              </CardContent>
            </Card>
          </CategoryPageLayout>
        );

      case "blog":
        return (
          <BlogPageLayout
            blogCategory="rental-tips"
            blogTags={["tips", "rental", "guide"]}
          >
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This is the blog page content with blog-specific filters and
                  sidebar.
                </p>
                <p>
                  Includes related posts, blog categories, and blog ads in
                  sidebar.
                </p>
              </CardContent>
            </Card>
          </BlogPageLayout>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Layout Switcher */}
      <div className="border-b bg-muted/30 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Universal Layout System Demo
          </h1>
          <div className="flex gap-2">
            <Button
              variant={currentLayout === "search" ? "default" : "outline"}
              onClick={() => setCurrentLayout("search")}
            >
              Search Layout
            </Button>
            <Button
              variant={currentLayout === "category" ? "default" : "outline"}
              onClick={() => setCurrentLayout("category")}
            >
              Category Layout
            </Button>
            <Button
              variant={currentLayout === "blog" ? "default" : "outline"}
              onClick={() => setCurrentLayout("blog")}
            >
              Blog Layout
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Layout Content */}
      {renderContent()}
    </div>
  );
}

// Example of using the basic UniversalPageLayout directly
export function BasicLayoutExample() {
  return (
    <UniversalPageLayout
      pageType="search"
      pageContext={{ example: true }}
      showSidebar={true}
      sidebarPosition="right"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Main Content Area</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This is the main content area. The sidebar will be displayed to
              the right on desktop and stacked below on mobile.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsive Design</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Desktop:</strong> Sidebar positioned to the right
              </p>
              <p>
                <strong>Tablet:</strong> Sidebar adapts to available space
              </p>
              <p>
                <strong>Mobile:</strong> Sidebar stacks below main content
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sidebar Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Advertisements:</strong> Contextual ad banners
              </p>
              <p>
                <strong>Related Content:</strong> Popular listings, related
                posts, categories
              </p>
              <p>
                <strong>Dynamic Loading:</strong> Content loads based on page
                type and context
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </UniversalPageLayout>
  );
}
