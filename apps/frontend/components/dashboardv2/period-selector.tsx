"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year'

interface PeriodSelectorProps {
  value: PeriodType
  onChange: (value: PeriodType) => void
}

const PERIOD_OPTIONS: { value: PeriodType; label: string; description: string }[] = [
  { value: 'today', label: 'Today', description: 'Today only' },
  { value: 'week', label: 'This Week', description: 'Last 7 days' },
  { value: 'month', label: 'This Month', description: 'Last 30 days' },
  { value: 'quarter', label: 'This Quarter', description: 'Last 90 days' },
  { value: 'year', label: 'This Year', description: 'Last 12 months' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as PeriodType)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { type PeriodType }