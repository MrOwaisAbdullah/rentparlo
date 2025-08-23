"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { getCategories } from "@/lib/categories"
import { useEffect, useState } from "react"
import { Category } from "@/types"

const iconMap: Record<string, string> = {
  automobiles: "🚗",
  "medical-equipment": "🏥",
  camera: "📷",
  generators: "⚡",
  "wedding-couture": "💒",
  events: "🎉",
  "construction-equipment": "🏗️",
  studio: "🎬",
  advertisements: "📢",
}

export default function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories()
      // Only show the first 8 categories
      setCategories(cats.slice(0, 8))
    }
    
    fetchCategories()
  }, [])

  return (
    <section className="py-8 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Popular Categories</h2>
          <p className="text-muted-foreground">Browse our most popular rental categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link key={category._id} href={`/category/${category.slug}`}>
              <Card className="hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer h-24 flex flex-col items-center justify-center text-center p-3">
                <div className="text-4xl mb-1">{iconMap[category.slug] || "📦"}</div>
                <h3 className="text-[14px] font-medium text-foreground leading-tight">{category.title}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
