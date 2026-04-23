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
    const { data: users } = useUsers()
    const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sourceFilter, setSourceFilter] = React.useState("all")
    const [assignedToFilter, setAssignedToFilter] = React.useState("all")
    const [propertyTypeFilter, setPropertyTypeFilter] = React.useState("all")
    const [budgetMinFilter, setBudgetMinFilter] = React.useState<number | undefined>()
    const [budgetMaxFilter, setBudgetMaxFilter] = React.useState<number | undefined>()
    const [createdFromFilter, setCreatedFromFilter] = React.useState<Date | undefined>()
    const [createdToFilter, setCreatedToFilter] = React.useState<Date | undefined>()
    const [followUpFromFilter, setFollowUpFromFilter] = React.useState<Date | undefined>()
    const [followUpToFilter, setFollowUpToFilter] = React.useState<Date | undefined>()
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
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(q) ||
                    lead.email.toLowerCase().includes(q) ||
                    lead.phone.toLowerCase().includes(q)
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

        // Assigned To filter
        if (assignedToFilter !== "all") {
            filtered = filtered.filter((lead) => lead.assignedToId === assignedToFilter)
        }

        // Property Type filter
        if (propertyTypeFilter !== "all") {
            filtered = filtered.filter((lead) => lead.propertyType === propertyTypeFilter)
        }

        // Budget Range filter
        if (budgetMinFilter !== undefined) {
            filtered = filtered.filter((lead) => 
                lead.budgetMin !== undefined && lead.budgetMin >= budgetMinFilter
            )
        }
        if (budgetMaxFilter !== undefined) {
            filtered = filtered.filter((lead) => 
                lead.budgetMax !== undefined && lead.budgetMax <= budgetMaxFilter
            )
        }

        // Created Date Range filter
        if (createdFromFilter) {
            filtered = filtered.filter((lead) => 
                new Date(lead.createdAt) >= createdFromFilter
            )
        }
        if (createdToFilter) {
            filtered = filtered.filter((lead) => 
                new Date(lead.createdAt) <= createdToFilter
            )
        }

        // Follow-up Date Range filter
        if (followUpFromFilter) {
            filtered = filtered.filter((lead) => 
                lead.followUpAt && new Date(lead.followUpAt) >= followUpFromFilter
            )
        }
        if (followUpToFilter) {
            filtered = filtered.filter((lead) => 
                lead.followUpAt && new Date(lead.followUpAt) <= followUpToFilter
            )
        }

        setFilteredLeads(filtered)
    }, [
        searchQuery, statusFilter, sourceFilter, assignedToFilter, 
        propertyTypeFilter, budgetMinFilter, budgetMaxFilter,
        createdFromFilter, createdToFilter, followUpFromFilter, followUpToFilter,
        leads
    ])

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
                    onAssignedToChange={setAssignedToFilter}
                    onPropertyTypeChange={setPropertyTypeFilter}
                    onBudgetMinChange={setBudgetMinFilter}
                    onBudgetMaxChange={setBudgetMaxFilter}
                    onCreatedFromChange={setCreatedFromFilter}
                    onCreatedToChange={setCreatedToFilter}
                    onFollowUpFromChange={setFollowUpFromFilter}
                    onFollowUpToChange={setFollowUpToFilter}
                    users={users}
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
