"use client";

import { useSavedItems } from "@/contexts/SavedItemsContext";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { Trash2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingCard } from "@/components/cards/listing-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SavedItemsPage() {
  const { state: savedItemsState, dispatch: savedItemsDispatch } = useSavedItems();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Saved Items</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Saved Items</h1>
              <p className="text-muted-foreground mt-1">
                {savedItemsState.savedItems.length} {savedItemsState.savedItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            {savedItemsState.savedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => savedItemsDispatch({ type: "CLEAR_SAVED_ITEMS" })}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Empty State */}
          {savedItemsState.savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Bookmark className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Your saved list is empty</h2>
                <p className="text-muted-foreground">
                  Browse our collection and save your favorite items for later.
                </p>
              </div>
              <Button asChild>
                <Link href="/search">
                  Explore Rental Items
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
              {savedItemsState.savedItems.map((product) => (
                <ListingCard
                  key={product._id}
                  listing={product}
                  showSellerInfo={true}
                  variant="list"
                  onRemove={(id) => savedItemsDispatch({ type: "REMOVE_FROM_SAVED_ITEMS", id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
