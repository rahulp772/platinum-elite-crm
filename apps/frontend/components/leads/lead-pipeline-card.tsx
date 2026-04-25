"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Lead } from "@/types/lead"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Calendar, User, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeadPipelineCardProps {
    lead: any
}

export function LeadPipelineCard({ lead }: LeadPipelineCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Lead",
            lead,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const formattedBudget = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(lead.budgetMax || 0)

    const isOverdue = lead.followUpAt && new Date(lead.followUpAt) < new Date();

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
                            {lead.name}
                        </h4>
                        {lead.tier === "HIGH" && (
                            <Badge variant="destructive" className="h-5 text-[10px] px-1.5 bg-rose-500 hover:bg-rose-600">
                                Hot
                            </Badge>
                        )}
                        {lead.tier === "MEDIUM" && (
                            <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-amber-500/10 text-amber-600">
                                Warm
                            </Badge>
                        )}
                    </div>

                    {/* Value and Phone */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-base font-bold text-foreground">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {formattedBudget}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {lead.phone}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="pt-2 border-t flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{lead.assignedTo?.name || "Unassigned"}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 text-xs", isOverdue ? "text-rose-600 font-semibold" : "text-muted-foreground")}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                }) : "No Follow-up"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
