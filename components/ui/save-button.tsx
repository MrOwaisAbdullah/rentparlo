"use client";

import { useSavedItems } from "@/contexts/SavedItemsContext";
import { Listing } from "@/types";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackAnalyticsEventClient } from "@/lib/supabase-queries-client";

interface SaveButtonProps {
  listing: Listing;
  className?: string;
}

export function SaveButton({ listing, className }: SaveButtonProps) {
  const { state, dispatch } = useSavedItems();

  const isSaved = state.savedItems.some((item) => item._id === listing._id);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if the button is inside a link
    e.stopPropagation();

    // Track the save event
    try {
      await trackAnalyticsEventClient({
        event_type: 'save',
        listing_id: listing._id,
        metadata: { action: isSaved ? 'remove' : 'add' }
      });
    } catch (error) {
      console.error('Error tracking save event:', error);
    }

    if (isSaved) {
      dispatch({ type: "REMOVE_FROM_SAVED_ITEMS", id: listing._id });
    } else {
      dispatch({ type: "ADD_TO_SAVED_ITEMS", product: listing });
    }
  };

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      size="icon"
      onClick={handleToggleSave}
      className={cn("z-10", className)}
      aria-label={isSaved ? "Remove from saved items" : "Save this item"}
    >
      <Bookmark
        className={cn(
          "h-5 w-5",
          isSaved ? "text-primary fill-primary" : "text-foreground"
        )}
      />
    </Button>
  );
}
