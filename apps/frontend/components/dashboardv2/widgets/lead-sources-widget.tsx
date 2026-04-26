"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodType } from "../period-selector"

export function LeadSourcesWidget({ period }: { period: PeriodType }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[150px] flex items-center justify-center text-muted-foreground">
          <p>Lead sources chart coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}