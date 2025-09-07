'use client';

import Link from 'next/link';
import { LogIn, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderSheet } from './header-sheet';
import UniversalSearchBar from '@/components/search/universal-search-bar';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAndRedirect } from '@/lib/auth-actions';
import { SavedItemsHeaderIcon } from './saved-items-header-icon';
import Image from 'next/image';

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/rentparlopk.png"
              alt="RentParlo Logo"
              width={150}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-2xl mx-8">
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
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/advertise">Advertise</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <SavedItemsHeaderIcon />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/profile">
                       <UserIcon className="mr-2 h-4 w-4" />
                       <span>Profile</span>
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOutAndRedirect}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <SavedItemsHeaderIcon />
            <HeaderSheet user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}