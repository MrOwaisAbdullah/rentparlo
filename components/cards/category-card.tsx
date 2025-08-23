import Link from "next/link"
import Image from "next/image"
import { 
  Car, 
  HeartPulse, 
  Camera as CameraIcon, 
  Zap, 
  Heart, 
  Calendar, 
  Construction, 
  Palette, 
  Megaphone
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Category } from "@/types"

interface CategoryCardProps {
  category: Category
  className?: string
}

const iconMap: Record<string, React.ComponentType<any>> = {
  automobiles: Car,
  "medical-equipment": HeartPulse,
  camera: CameraIcon,
  generators: Zap,
  "wedding-couture": Heart,
  events: Calendar,
  "construction-equipment": Construction,
  studio: Palette,
  advertisements: Megaphone,
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = iconMap[category.slug]
  
  return (
    <Link href={`/category/${category.slug}`}>
      <Card
        className={cn("group hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer", className)}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            {/* Icon or Image */}
            <div className="mx-auto w-12 h-12 flex items-center justify-center">
              {category.icon?.asset?.url ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={category.icon.asset.url} alt={category.title} fill className="object-cover" />
                </div>
              ) : Icon ? (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">{category.title.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{category.title}</h3>
              {category.itemCount && <p className="text-xs text-muted-foreground mt-1">{category.itemCount} items</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
