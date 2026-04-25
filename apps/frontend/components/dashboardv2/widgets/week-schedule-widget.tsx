"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodType } from "../period-selector"

export function WeekScheduleWidget({ period }: { period: PeriodType }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Week View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          <p>Calendar view coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}