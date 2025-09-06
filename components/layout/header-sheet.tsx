'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Megaphone,
  FileText,
  LayoutDashboard,
  HelpCircle,
  Mail,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import UniversalSearchBar from "@/components/search/universal-search-bar";
import type { User } from '@/types';
import { signOut } from "@/lib/auth-actions";

interface HeaderSheetProps {
  user: User | null;
}

export function HeaderSheet({ user }: HeaderSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm md:max-w-md p-0 z-50">
        <div className="flex flex-col h-full">
          {/* Sheet Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  RP
                </span>
              </div>
              <span className="font-bold text-xl text-primary">RentParlo</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sheet Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Mobile Search */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Rentals</h3>
              <UniversalSearchBar
                variant="inline"
                placeholder="Search items..."
                showLocationFilter={true}
                size="md"
                onSearch={(query, filters) => {
                  const searchParams = new URLSearchParams();
                  if (query) searchParams.set("q", query);
                  if (filters.city) searchParams.set("city", filters.city);
                  if (filters.area) searchParams.set("area", filters.area);
                  window.location.href = `/search?${searchParams.toString()}`;
                  setIsOpen(false);
                }}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2 pt-4 border-t">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg py-6"
                    asChild
                  >
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="h-5 w-5 mr-3" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg py-6"
                    asChild
                  >
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <UserIcon className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                  </Button>
                  {user?.role === 'seller' && (
                     <Button
                        variant="ghost"
                        className="w-full justify-start text-lg py-6"
                        asChild
                      >
                        <Link href="/seller/dashboard" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          Seller Dashboard
                        </Link>
                      </Button>
                  )}
                  <form action={signOut} className="w-full">
                     <Button
                        variant="ghost"
                        type="submit"
                        className="w-full justify-start text-lg py-6 text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                      </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-lg py-6"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="h-5 w-5 mr-3" />
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full justify-start text-lg py-6" asChild>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <UserPlus className="h-5 w-5 mr-3" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className="w-full justify-start text-base py-4"
                asChild
              >
                <Link href="/advertise" onClick={() => setIsOpen(false)}>
                  <Megaphone className="h-5 w-5 mr-3" />
                  Advertise
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base py-4"
                asChild
              >
                <Link href="/blog" onClick={() => setIsOpen(false)}>
                  <FileText className="h-5 w-5 mr-3" />
                  Blog
                </Link>
              </Button>

              <Separator className="my-4" />

              <Button variant="outline" className="w-full" asChild>
                <Link href="/help" onClick={() => setIsOpen(false)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
