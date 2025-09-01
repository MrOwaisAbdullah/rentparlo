"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UniversalSidebar } from "./universal-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ResponsiveContainer, ResponsiveFlex } from "./responsive-container";

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

/**
 * Universal layout component for search, category, and blog pages with sidebar support
 * Provides consistent layout structure across different page types with responsive design
 */
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
  return (
    <SidebarProvider>
      <div className={cn("min-h-screen bg-background", className)}>
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
              className={cn(
                // Desktop layout: side-by-side
                "lg:flex-row",
                // Reverse order for left sidebar on desktop only
                sidebarPosition === "left" && "lg:flex-row-reverse"
              )}
              preventOverflow={true}
            >
              {/* Main Content */}
              <div
                className={cn(
                  "flex-1 min-w-0 w-full", // min-w-0 prevents flex item from overflowing
                  // Ensure content takes full width on mobile
                  "order-1",
                  contentClassName
                )}
              >
                <div className="w-full overflow-hidden">{children}</div>
              </div>

              {/* Sidebar */}
              {showSidebar && (
                <div
                  className={cn(
                    // Mobile: full width, appears after content
                    "w-full order-2",
                    // Tablet and up: fixed width sidebar
                    "sm:w-full md:w-80 lg:w-80 xl:w-96",
                    // Desktop: maintain order based on position
                    "lg:flex-shrink-0",
                    sidebarPosition === "left" && "lg:order-first",
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
