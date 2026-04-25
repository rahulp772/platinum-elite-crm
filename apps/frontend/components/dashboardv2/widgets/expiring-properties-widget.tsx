"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface ExpiringPropertiesWidgetProps {
  period: PeriodType
}

interface Property {
  id: string
  title: string
  address: string
  expiryDate: string
}

export function ExpiringPropertiesWidget({ period }: ExpiringPropertiesWidgetProps) {
  const { data, isLoading } = useQuery<Property[]>({
    queryKey: ['properties-expiring', period],
    queryFn: async () => {
      const res = await api.get(`/properties?filter=expiring&days=30&limit=4`)
      return res.data.data || []
    }
  })

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[150px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const properties = data || []

  return (
    <Card className={cn("h-full", properties.length > 0 && "border-rose-500/30")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Expiring Soon
          {properties.length > 0 && properties.some(p => getDaysUntil(p.expiryDate) <= 7) && (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No expiring listings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((property) => {
              const days = getDaysUntil(property.expiryDate)
              const isUrgent = days <= 7
              
              return (
                <div 
                  key={property.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg p-2 text-sm",
                    isUrgent && "bg-rose-500/10"
                  )}
                >
                  <span className="truncate">{property.title}</span>
                  <span className={cn(
                    "text-xs",
                    isUrgent ? "text-rose-600 font-medium" : "text-muted-foreground"
                  )}>
                    {days} days
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}