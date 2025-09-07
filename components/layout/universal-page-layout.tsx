'use client';

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { UniversalSidebar } from "./universal-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ResponsiveContainer, ResponsiveFlex } from "./responsive-container";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { CategoryFilters } from "@/components/category/category-filters";

export interface UniversalPageLayoutProps {
  children: React.ReactNode;
  pageType: "search" | "category" | "blog";
  pageContext?: Record<string, any>;
  showSidebar?: boolean;
  sidebarPosition?: "left" | "right";
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  sidebarClassName?: string;
}

export function UniversalPageLayout({
  children,
  pageType,
  pageContext = {},
  showSidebar = true,
  sidebarPosition = "right",
  className,
  containerClassName,
  contentClassName,
  sidebarClassName,
}: UniversalPageLayoutProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className={cn("min-h-screen bg-background", className)}>
        {showSidebar && pageType === 'category' && (
          <div className="sticky top-16 z-30 border-b bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <ResponsiveContainer maxWidth="7xl" padding="default">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-6">
                  <CategoryFilters
                    slug={pageContext.categorySlug}
                    currentFilters={pageContext.filters}
                    subcategories={pageContext.subcategories}
                    onNavigate={() => setIsSheetOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </ResponsiveContainer>
          </div>
        )}

        <ResponsiveContainer
          maxWidth="7xl"
          padding="default"
          className={containerClassName}
          preventHorizontalScroll={true}
        >
          <div className="py-4 sm:py-6 lg:py-8">
            <ResponsiveFlex
              direction="col"
              gap="default"
              className="lg:flex-row"
              preventOverflow={true}
            >
              <div
                className={cn(
                  "flex-1 min-w-0 w-full",
                  "order-1",
                  sidebarPosition === "left" ? "lg:order-2" : "lg:order-1",
                  contentClassName
                )}
              >
                <div className="w-full overflow-hidden">{children}</div>
              </div>

              {showSidebar && (
                <div
                  className={cn(
                    "w-full",
                    "order-2",
                    sidebarPosition === "left" ? "lg:order-1" : "lg:order-2",
                    "md:w-80 lg:w-80 xl:w-96",
                    "lg:flex-shrink-0",
                    sidebarClassName
                  )}
                >
                  <div className="w-full overflow-hidden">
                    <UniversalSidebar
                      pageType={pageType}
                      pageContext={pageContext}
                    />
                  </div>
                </div>
              )}
            </ResponsiveFlex>
          </div>
        </ResponsiveContainer>
      </div>
    </SidebarProvider>
  );
}
