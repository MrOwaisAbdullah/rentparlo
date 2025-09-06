"use client"

import { CategoryBar } from "@/components/layout/category-bar"

// Wrapper component to ensure proper client-side rendering
export function CategoryBarWrapper() {
  return (
  <div className="sticky top-0 z-40">
  <CategoryBar />
  </div>
  )
}