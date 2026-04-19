"use client"

import * as React from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { useLeads } from "@/hooks/use-leads"
import { Card } from "@/components/ui/card"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Lead } from "@/types/lead"

export default function LeadsPage() {
    const { data: leads, isLoading, isError } = useLeads()
    const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sourceFilter, setSourceFilter] = React.useState("all")

    // Apply filters
    React.useEffect(() => {
        if (!leads) return

        let filtered = [...leads]

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.phone.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((lead) => lead.status === statusFilter)
        }

        // Source filter
        if (sourceFilter !== "all") {
            filtered = filtered.filter((lead) => lead.source === sourceFilter)
        }

        setFilteredLeads(filtered)
    }, [searchQuery, statusFilter, sourceFilter, leads])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-realty-gold" />
                <p className="text-muted-foreground animate-pulse">Loading leads...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-destructive font-semibold">Failed to load leads.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground">
                        Manage your real estate leads and prospects
                    </p>
                </div>
                <AddLeadDialog />
            </div>

            {/* Filters */}
            <Card className="p-6">
                <LeadFilters
                    onSearchChange={setSearchQuery}
                    onStatusChange={setStatusFilter}
                    onSourceChange={setSourceFilter}
                />
            </Card>

            {/* Table */}
            <LeadsTable data={filteredLeads} />
        </div>
    )
}
