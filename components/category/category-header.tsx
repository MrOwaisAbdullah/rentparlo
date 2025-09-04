"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Grid, List } from "lucide-react";
import { Category } from "@/types";

interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  itemCount?: number;
}

interface CategoryHeaderProps {
  category: Category;
  totalCount: number;
  subcategories: Subcategory[];
}

export function CategoryHeader({
  category,
  totalCount,
  subcategories,
}: CategoryHeaderProps) {
  return (
    <div className="bg-muted/20">
      <div className="container mx-auto px-4 py-8 text-center justify-center items-center flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {category.title}
            </h1>
            <Badge className="bg-blue-200 text-blue-800 capitalize">
              {totalCount} {totalCount === 1 ? "item" : "items"} available for rent
            </Badge>
        
        {category.description && (
          <p className="mt-4 text-lg max-w-3xl text-center capitalize">
            {category.description}
          </p>
        )}

      </div>
    </div>
  );
}