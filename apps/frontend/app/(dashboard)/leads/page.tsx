"use client"

import * as React from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog"
import { BulkActionsDialog } from "@/components/leads/bulk-actions-dialog"
import { useLeads, useUpdateLead, useUsers } from "@/hooks/use-leads"
import { Card } from "@/components/ui/card"
import { LoaderCircle, Users, Trash2, MessageSquare, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Lead, LeadStatus } from "@/types/lead"

export default function LeadsPage() {
    const { data: leads, isLoading, isError } = useLeads()
    const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sourceFilter, setSourceFilter] = React.useState("all")
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
    const [selectedLeads, setSelectedLeads] = React.useState<Lead[]>([])
    const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)

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

    const handleEditLead = (lead: Lead) => {
        setSelectedLead(lead)
        setEditDialogOpen(true)
    }

    const handleSelectionChange = (selected: Lead[]) => {
        setSelectedLeads(selected)
    }

    const handleBulkAction = () => {
        if (selectedLeads.length > 0) {
            setBulkDialogOpen(true)
        }
    }

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

            {/* Bulk Actions Toolbar */}
            {selectedLeads.length > 0 && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                                {selectedLeads.length} lead{selectedLeads.length !== 1 ? "s" : ""} selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBulkAction}
                                    className="gap-2"
                                >
                                    <Users className="h-4 w-4" />
                                    Bulk Actions
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLeads([])}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Table */}
            <LeadsTable 
                data={filteredLeads} 
                onEdit={handleEditLead}
                onSelectionChange={handleSelectionChange}
            />
            
            {/* Edit Lead Dialog */}
            <EditLeadDialog 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
                lead={selectedLead} 
            />

            {/* Bulk Actions Dialog */}
            <BulkActionsDialog
                open={bulkDialogOpen}
                onOpenChange={setBulkDialogOpen}
                leads={selectedLeads}
                onComplete={() => setSelectedLeads([])}
            />
        </div>
    )
}
