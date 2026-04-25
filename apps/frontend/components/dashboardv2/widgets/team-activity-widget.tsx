"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodType } from "../period-selector"

export function TeamActivityWidget({ period }: { period: PeriodType }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          <p>Activity feed coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}