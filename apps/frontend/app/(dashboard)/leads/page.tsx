"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog"
import { BulkActionsDialog } from "@/components/leads/bulk-actions-dialog"
import { useLeads, useUpdateLead, useUsers } from "@/hooks/use-leads"
import { Card } from "@/components/ui/card"
import { LoaderCircle, Users, Trash2, MessageSquare, UserPlus, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Lead, LeadStatus } from "@/types/lead"
import { cn } from "@/lib/utils"

interface LeadsTableSectionProps {
    data: Lead[]
    onEdit: (lead: Lead) => void
    onSelectionChange: (selectedLeads: Lead[]) => void
    pagination: { page: number; limit: number; total: number; totalPages: number } | null
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
}

const LeadsTableSection = React.memo(function LeadsTableSection({
    data,
    onEdit,
    onSelectionChange,
    pagination,
    onPageChange,
    onLimitChange,
}: LeadsTableSectionProps) {
    return (
        <LeadsTable
            data={data}
            onEdit={onEdit}
            onSelectionChange={onSelectionChange}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
        />
    )
})

export default function LeadsPage() {
    const router = useRouter()
    const { data: users } = useUsers()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sourceFilter, setSourceFilter] = React.useState("all")
    const [assignedToFilter, setAssignedToFilter] = React.useState("all")
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
    const [selectedLeads, setSelectedLeads] = React.useState<Lead[]>([])
    const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [filtersOpen, setFiltersOpen] = React.useState(false)

    const filters = React.useMemo(() => ({
        page,
        limit,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(sourceFilter !== 'all' ? { source: sourceFilter } : {}),
        ...(assignedToFilter !== 'all' ? { assignedToId: assignedToFilter } : {}),
    }), [page, limit, searchQuery, statusFilter, sourceFilter, assignedToFilter])

    const { data: leadsData, isLoading, isError, refetch } = useLeads(filters, [page, limit, searchQuery, statusFilter, sourceFilter, assignedToFilter])

    const leads = leadsData?.data || []
    const metadata = leadsData?.metadata

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handleLimitChange = (newLimit: number) => {
        console.log('Limit changed to:', newLimit)
        setLimit(newLimit)
        setPage(1)
    }

    const handleEditLead = (lead: Lead) => {
        router.push(`/leads/${lead.id}`)
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
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground hidden sm:block">
                        Manage your real estate leads and prospects
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-realty-gold/50 text-realty-gold hover:bg-realty-gold/10"
                        onClick={() => router.push("/leads/import")}
                    >
                        <Download className="mr-1.5 h-4 w-4" />
                        <span className="hidden sm:inline">Import Leads</span>
                    </Button>
                    <AddLeadDialog />
                </div>
            </div>

            {/* Filters */}
            <Card className={cn("p-4 md:p-6", filtersOpen ? "block" : "hidden md:block")}>
                <LeadFilters
                    onSearchChange={setSearchQuery}
                    onStatusChange={setStatusFilter}
                    onSourceChange={setSourceFilter}
                    onAssignedToChange={setAssignedToFilter}
                    users={users}
                />
            </Card>

            {/* Bulk Actions Toolbar */}
            {selectedLeads.length > 0 && (
                <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-sm font-medium">
                            {selectedLeads.length} lead{selectedLeads.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkAction}
                                className="gap-1.5"
                            >
                                <Users className="h-4 w-4" />
                                <span className="hidden xs:inline">Bulk Actions</span>
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
                </Card>
            )}

            {/* Table */}
            <LeadsTableSection
                data={leads}
                onEdit={handleEditLead}
                onSelectionChange={handleSelectionChange}
                pagination={metadata || null}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
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
                refetch={refetch}
            />
        </div>
    )
}
