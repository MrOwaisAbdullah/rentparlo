import { Card, CardContent } from "@/components/ui/card"

interface SpecificationsTableProps {
  specifications: Record<string, string>
  isMobile?: boolean
}

export default function SpecificationsTable({ specifications, isMobile = false }: SpecificationsTableProps) {
  const specEntries = Object.entries(specifications)

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Specifications</h3>
        <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          {specEntries.map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
