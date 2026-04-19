"use client"

import * as React from "react"
import { KanbanBoard } from "@/components/deals/kanban-board"
import { mockDeals } from "@/lib/mock-data/deals"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DealsPage() {
    const totalPipeline = mockDeals.reduce((acc, deal) => acc + deal.value, 0)
    const formattedPipeline = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(totalPipeline)

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deals & Pipeline</h1>
                    <p className="text-muted-foreground">
                        Manage your sales pipeline and track deal progress
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <span className="text-sm text-muted-foreground">Total Pipeline</span>
                        <span className="text-xl font-bold text-realty-gold">
                            {formattedPipeline}
                        </span>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deal
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 min-h-0">
                <KanbanBoard initialDeals={mockDeals} />
            </div>
        </div>
    )
}
