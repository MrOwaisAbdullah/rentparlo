'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, User } from 'lucide-react';

interface SellerProfileTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  className?: string;
}

export function SellerProfileTabs({ 
  children, 
  defaultTab = "products",
  className 
}: SellerProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-full p-1">
        <TabsTrigger 
          value="products" 
          className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
        >
          <Package className="w-4 h-4 mr-2" />
          Products
        </TabsTrigger>
        <TabsTrigger 
          value="about" 
          className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
        >
          <User className="w-4 h-4 mr-2" />
          About Us
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  );
}

interface SellerProfileTabContentProps {
  value: string;
  children: React.ReactNode;
}

export function SellerProfileTabContent({ value, children }: SellerProfileTabContentProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      {children}
    </TabsContent>
  );
}