'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdvertisementBannerProps {
  className?: string;
}

export function AdvertisementBanner({ className }: AdvertisementBannerProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white py-12 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Gif Banner or JPEG
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold">
              For advertising
            </p>
            <div className="pt-4">
              <p className="text-sm font-medium opacity-90">
                Rentparlo.pk
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}