"use client"

import * as React from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { mockLeads } from "@/lib/mock-data/leads"
import { Card } from "@/components/ui/card"

export default function LeadsPage() {
    const [filteredLeads, setFilteredLeads] = React.useState(mockLeads)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sourceFilter, setSourceFilter] = React.useState("all")

    // Apply filters
    React.useEffect(() => {
        let filtered = mockLeads

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
    }, [searchQuery, statusFilter, sourceFilter])

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
