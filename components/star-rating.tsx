"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  readonly?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  readonly = true,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1
        const isActive = value <= (hoverRating || rating)

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              isActive ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
              !readonly && "cursor-pointer hover:scale-110 transition-transform",
            )}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          />
        )
      })}
    </div>
  )
}
