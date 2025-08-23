import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react"

interface RentalRulesProps {
  // Add props here if needed in the future
  [key: string]: never // This ensures the interface is truly empty
}

export default function RentalRules({}: RentalRulesProps) {
  const rules = [
    { icon: CheckCircle, text: "Valid CNIC required", type: "allowed" },
    { icon: CheckCircle, text: "Security deposit refundable", type: "allowed" },
    { icon: Clock, text: "Minimum rental period: 1 day", type: "info" },
    { icon: Shield, text: "Insurance coverage included", type: "allowed" },
    { icon: XCircle, text: "No smoking allowed", type: "not-allowed" },
    { icon: XCircle, text: "No modifications permitted", type: "not-allowed" },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Rental Rules & Policies</h3>
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const IconComponent = rule.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <IconComponent
                  className={`h-5 w-5 ${
                    rule.type === "allowed"
                      ? "text-green-600"
                      : rule.type === "not-allowed"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                />
                <span className="text-sm">{rule.text}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Cancellation Policy</h4>
          <p className="text-sm text-muted-foreground">
            Free cancellation up to 24 hours before rental start time. 50% refund for cancellations within 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
