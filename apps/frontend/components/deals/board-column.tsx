"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Deal, DealStage, dealStages } from "@/types/deal"
import { DealCard } from "./deal-card"
import { cn } from "@/lib/utils"

interface BoardColumnProps {
    id: DealStage
    deals: Deal[]
}

export function BoardColumn({ id, deals }: BoardColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
    })

    const stage = dealStages.find((s) => s.id === id)!
    const totalValue = deals.reduce((acc, deal) => acc + deal.value, 0)
    const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(totalValue)

    return (
        <div ref={setNodeRef} className="flex flex-col h-full w-[350px] min-w-[350px] bg-muted/30 rounded-lg p-2 gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", stage.color.split(" ")[0].replace("/10", ""))} />
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {deals.length}
                    </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {formattedTotal}
                </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px] p-1">
                <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
