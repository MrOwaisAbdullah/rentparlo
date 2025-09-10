'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  User as UserIcon,
  Home,
  Search,
  BookmarkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import UniversalSearchBar from '@/components/search/universal-search-bar';
import type { User } from '@/types';
import { signOutAndRedirect } from '@/lib/auth-actions';
import { useSavedItems } from '@/contexts/SavedItemsContext';
import { Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { getUserByIdClient } from '@/lib/supabase-queries-client';

interface HeaderSheetProps {
  user: User | null;
}

export function HeaderSheet({ user }: HeaderSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useSavedItems();
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        setLoadingProfile(false);
        return;
      }
      
      try {
        const profile = await getUserByIdClient(authUser.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [authUser]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-10 w-10" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm md:max-w-md p-0 z-50">
        <div className="flex flex-col h-full">
          {/* Sheet Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Logo className="h-8 w-auto" />
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
              <Button
                variant="ghost"
                className="w-full justify-start text-base py-4"
                asChild
              >
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-base py-4"
                asChild
              >
                <Link href="/search" onClick={() => setIsOpen(false)}>
                  <Search className="h-5 w-5 mr-3" />
                  Search
                </Link>
              </Button>

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

              <Button
                variant="ghost"
                className="w-full justify-start text-base py-4"
                asChild
              >
                <Link href="/saved" onClick={() => setIsOpen(false)} className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                  <BookmarkIcon className="h-5 w-5 mr-3" />
                  Saved Items
                  </div>
                  {totalItems > 0 && (
                    <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </Button>

              <Separator className="my-4" />

              {authUser ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-foreground truncate">{authUser.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{authUser?.role}</p>
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
                    <Link 
                      href={
                        userProfile?.role === 'seller' && userProfile?.seller_profiles?.username
                          ? `/seller/${userProfile.seller_profiles.username}`
                          : '/profile'
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                  </Button>
                  {authUser?.role === 'seller' && (
                     <Button
                        variant="ghost"
                        className="w-full text-lg py-4"
                        asChild
                      >
                        <Link href="/seller/dashboard" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          Seller Dashboard
                        </Link>
                      </Button>
                  )}
                  <form action={signOutAndRedirect} className="w-full">
                     <Button
                        variant="ghost"
                        type="submit"
                        className="w-full text-lg py-4 text-destructive hover:text-destructive"
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
                    className="w-full bg-transparent text-lg py-4"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="h-5 w-5 mr-3" />
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full text-lg py-4" asChild>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <UserPlus className="h-5 w-5 mr-3" />
                      Register
                    </Link>
                  </Button>
                </>
              )}

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
