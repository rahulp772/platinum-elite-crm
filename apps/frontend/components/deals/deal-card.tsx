"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Deal } from "@/types/deal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Building } from "lucide-react"
import { cn } from "@/lib/utils"

interface DealCardProps {
    deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: "Deal",
            deal,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(deal.value)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn("group", isDragging && "opacity-50")}
        >
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                            {deal.title}
                        </h4>
                        {deal.priority === "high" && (
                            <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
                                High
                            </Badge>
                        )}
                    </div>

                    {/* Value and Customer */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-base font-bold text-foreground">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {formattedValue}
                        </div>
                        <p className="text-xs text-muted-foreground">{deal.customerName}</p>
                    </div>

                    {/* Details */}
                    <div className="pt-2 border-t flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{deal.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {deal.expectedCloseDate.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
