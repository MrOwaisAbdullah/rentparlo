import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backgroundImage?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backgroundImage,
  className
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 lg:py-12">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
          {/* Back button */}
          {showBackButton && (
            <div className="mb-6 sm:mb-8">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to home</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Logo */}
          <div className="mb-6 sm:mb-8 lg:hidden text-center">
            <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                RentParLo.pk
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className={cn("space-y-6", className)}>
            {children}
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-4">
              By continuing, you agree to our{' '}
              <Link 
                href="/terms" 
                className="underline hover:text-foreground transition-colors duration-200 hover:no-underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link 
                href="/privacy" 
                className="underline hover:text-foreground transition-colors duration-200 hover:no-underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Background/Image */}
      <div className="hidden lg:flex lg:flex-1 relative bg-muted">
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent w-full">
            <div className="text-center p-8 lg:p-12 xl:p-16 max-w-lg">
              <div className="mb-8">
                <Image
                  src="/rentparlopk.png"
                  alt="RentParlo Logo"
                  width={250}
                  height={66}
                />
              </div>
              <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-foreground mb-4 lg:mb-6">
                Welcome to RentParLo.pk
              </h2>
              <p className="text-sm lg:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Pakistan&apos;s premier rental marketplace. Connect with trusted sellers
                and find everything you need to rent, from electronics to furniture.
              </p>
              <div className="mt-8 lg:mt-12 grid grid-cols-1 gap-3 lg:gap-4 text-sm lg:text-base text-muted-foreground">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Secure Transactions</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Local Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}