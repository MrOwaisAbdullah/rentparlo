"use client"

import { CategoryBar } from "@/components/layout/category-bar"

interface CategoryBarWrapperProps {
  show?: boolean;
}

// Wrapper component to ensure proper client-side rendering
export function CategoryBarWrapper({ show = true }: CategoryBarWrapperProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40">
      <CategoryBar />
    </div>
  )
}
