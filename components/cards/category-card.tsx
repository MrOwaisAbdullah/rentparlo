import Link from "next/link"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  title: string
  slug: string
  icon?: LucideIcon
  image?: string
  itemCount?: number
  className?: string
}

export function CategoryCard({ title, slug, icon: Icon, image, itemCount, className }: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`}>
      <Card
        className={cn("group hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer", className)}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            {/* Icon or Image */}
            <div className="mx-auto w-12 h-12 flex items-center justify-center">
              {image ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
                </div>
              ) : Icon ? (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">{title.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
              {itemCount && <p className="text-xs text-muted-foreground mt-1">{itemCount} items</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
