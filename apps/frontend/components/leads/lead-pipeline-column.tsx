"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { LeadPipelineCard } from "./lead-pipeline-card"
import { cn } from "@/lib/utils"

interface LeadPipelineColumnProps {
    id: string
    title: string
    color: string
    leads: any[]
}

export function LeadPipelineColumn({ id, title, color, leads }: LeadPipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
    })

    const totalValue = leads.reduce((acc, lead) => acc + (lead.budgetMax || 0), 0)
    const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(totalValue)

    // Parse the color class for the dot indicator (e.g., "bg-blue-500/10" -> "bg-blue-500")
    const dotColorClass = color.split(" ")[0].replace("/10", "").replace("/20", "")

    return (
        <div ref={setNodeRef} className="flex flex-col h-full w-[350px] min-w-[350px] bg-muted/30 rounded-lg p-2 gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", dotColorClass)} />
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {leads.length}
                    </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {formattedTotal}
                </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px] p-1">
                <SortableContext items={leads.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <LeadPipelineCard key={lead.id} lead={lead} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
