import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BannerCloseButtonProps {
  onClick: () => void
  className?: string
}

export function BannerCloseButton({ onClick, className }: BannerCloseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "absolute top-1 right-1 h-6 w-6 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label="Close banner"
    >
      <X className="h-3 w-3" />
    </Button>
  )
}