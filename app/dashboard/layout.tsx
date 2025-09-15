"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { ReactNode } from "react";
import { Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { BreadcrumbItem } from "@/types/dashboard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      current: pathname === "/dashboard",
    });

    // Add additional segments
    if (pathSegments.length > 1) {
      const segment = pathSegments[1];
      const segmentLabels: Record<string, string> = {
        analytics: "Analytics",
        listings: "My Listings",
        package: "My Package",
        profile: "Profile",
        support: "Support",
        "create-listing": "Create Listing",
      };

      breadcrumbs.push({
        label:
          segmentLabels[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/dashboard/${segment}`,
        current: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <Sidebar onNavigate={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Package className="h-6 w-6" />
              <span>Seller Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Breadcrumbs - only show on desktop and when not on main dashboard */}
        {breadcrumbs.length > 1 && (
          <div className="hidden md:block border-b bg-background px-4 py-3 lg:px-6">
            <DashboardBreadcrumb items={breadcrumbs} />
          </div>
        )}

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
