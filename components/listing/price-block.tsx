import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PriceBlockProps {
  price: number
}

export default function PriceBlock({ price }: PriceBlockProps) {
  const weeklyPrice = price * 7 * 0.9 // 10% discount for weekly
  const monthlyPrice = price * 30 * 0.8 // 20% discount for monthly

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">PKR {price.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">/ day</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly Rate</span>
              <div className="text-right">
                <div className="font-semibold">PKR {weeklyPrice.toLocaleString()}</div>
                <div className="text-xs text-green-600">Save 10%</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Monthly Rate</span>
              <div className="text-right">
                <div className="font-semibold">PKR {monthlyPrice.toLocaleString()}</div>
                <div className="text-xs text-green-600">Save 20%</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Free Delivery</Badge>
              <Badge variant="secondary">Insurance</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}