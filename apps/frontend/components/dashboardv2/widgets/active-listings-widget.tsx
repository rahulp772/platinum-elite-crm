"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PeriodType } from "../period-selector"

interface ActiveListingsWidgetProps {
  period: PeriodType
}

interface Property {
  id: string
  title: string
  address: string
  price: number
  status: string
  daysOnMarket: number
}

export function ActiveListingsWidget({ period }: ActiveListingsWidgetProps) {
  const { data, isLoading } = useQuery<Property[]>({
    queryKey: ['properties-active', period],
    queryFn: async () => {
      const res = await api.get(`/properties?status=available&limit=4`)
      return res.data.data || []
    }
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[180px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const properties = data || []

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Active Listings</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties" className="flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active listings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <div 
                key={property.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{property.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                  <p className="text-sm font-bold text-realty-gold">{formatCurrency(property.price)}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {property.daysOnMarket} days
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}