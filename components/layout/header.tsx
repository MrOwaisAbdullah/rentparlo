"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSheet } from "./header-sheet";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import UniversalSearchBar from "@/components/search/universal-search-bar";

export function Header() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                RP
              </span>
            </div>
            <span className="font-bold text-xl text-primary">RentParlo</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-2xl mx-8">
            <UniversalSearchBar
              variant="header"
              placeholder="Try 'DSLR camera', 'Car', 'Laptop'..."
              showLocationFilter={true}
              size="sm"
              onSearch={(query, filters) => {
                const searchParams = new URLSearchParams();
                if (query) searchParams.set("q", query);
                if (filters.city) searchParams.set("city", filters.city);
                if (filters.area) searchParams.set("area", filters.area);
                router.push(`/search?${searchParams.toString()}`);
              }}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/advertise">Advertise</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <HeaderSheet />
        </div>
      </div>
    </header>
  );
}
