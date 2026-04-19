"use client"

import * as React from "react"
import { KanbanBoard } from "@/components/deals/kanban-board"
import { useDeals } from "@/hooks/use-deals"
import { Button } from "@/components/ui/button"
import { Plus, LoaderCircle } from "lucide-react"

export default function DealsPage() {
    const { data: deals, isLoading, isError } = useDeals()

    const totalPipeline = deals?.reduce((acc, deal) => acc + Number(deal.value), 0) || 0
    const formattedPipeline = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(totalPipeline)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-realty-gold" />
                <p className="text-muted-foreground animate-pulse">Loading deals...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-destructive font-semibold">Failed to load deals.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

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
                <KanbanBoard initialDeals={deals || []} />
            </div>
        </div>
    )
}
