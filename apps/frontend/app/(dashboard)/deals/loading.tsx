import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function DealsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Lead', 'Negotiation', 'Under Contract', 'Closed'].map((stage) => (
          <Card key={stage} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}