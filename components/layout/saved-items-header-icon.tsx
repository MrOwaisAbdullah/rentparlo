"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useSavedItems } from "@/contexts/SavedItemsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SavedItemsHeaderIcon() {
  const { totalItems } = useSavedItems();

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/saved" className="relative">
        <Bookmark className="h-6 w-6" />
        {totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
          >
            {totalItems}
          </Badge>
        )}
        <span className="sr-only">Saved Items</span>
      </Link>
    </Button>
  );
}
