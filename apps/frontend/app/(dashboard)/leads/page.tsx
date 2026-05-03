"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog"
import { BulkActionsDialog } from "@/components/leads/bulk-actions-dialog"
import { useLeads, useUpdateLead, useUsers } from "@/hooks/use-leads"
import { useBuilders } from "@/hooks/use-builders"
import { useAuth } from "@/lib/auth-context"

import { Card } from "@/components/ui/card"
import { LoaderCircle, Users, Trash2, MessageSquare, UserPlus, Download, Filter, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lead, LeadStatus } from "@/types/lead"
import { cn } from "@/lib/utils"
import { format, startOfDay } from "date-fns"

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
    const [statusFilter, setStatusFilter] = React.useState("open")
    const [sourceFilter, setSourceFilter] = React.useState("all")
    const [assignedToFilter, setAssignedToFilter] = React.useState("all")
    const [builderFilter, setBuilderFilter] = React.useState("all")

    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
    const [selectedLeads, setSelectedLeads] = React.useState<Lead[]>([])
    const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [filtersOpen, setFiltersOpen] = React.useState(false)

    // Date filtering state
    const { user } = useAuth()
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
    const [isAllTime, setIsAllTime] = React.useState(true) // Default to true for Admins/Managers
    const [hasInitializedDate, setHasInitializedDate] = React.useState(false)

    // Set default view based on role
    React.useEffect(() => {
        if (user && !hasInitializedDate) {
            // Level 10 is Agent
            if (user.role?.level === 10) {
                setIsAllTime(false)
            } else {
                setIsAllTime(true)
            }
            setHasInitializedDate(true)
        }
    }, [user, hasInitializedDate])

    const handlePrevDay = () => {
        if (!selectedDate) return
        const prev = new Date(selectedDate)
        prev.setDate(prev.getDate() - 1)
        setSelectedDate(prev)
        setIsAllTime(false)
    }

    const handleNextDay = () => {
        if (!selectedDate) return
        const next = new Date(selectedDate)
        next.setDate(next.getDate() + 1)
        setSelectedDate(next)
        setIsAllTime(false)
    }

    const handleGoToToday = () => {
        setSelectedDate(new Date())
        setIsAllTime(false)
    }

    const handleToggleAllTime = () => {
        setIsAllTime(!isAllTime)
    }

    const filters = React.useMemo(() => ({
        page,
        limit,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(sourceFilter !== 'all' ? { source: sourceFilter } : {}),
        ...(assignedToFilter !== 'all' ? { assignedToId: assignedToFilter } : {}),
        ...(builderFilter !== 'all' ? { builderId: builderFilter } : {}),
        ...(!isAllTime && selectedDate ? { date: selectedDate.toISOString() } : {}),
    }), [page, limit, searchQuery, statusFilter, sourceFilter, assignedToFilter, builderFilter, selectedDate, isAllTime])

    const { data: leadsData, isLoading, isError, refetch } = useLeads(filters, [page, limit, searchQuery, statusFilter, sourceFilter, assignedToFilter, builderFilter, selectedDate, isAllTime])
    const { data: builders } = useBuilders()


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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-6">
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs 
                        value={statusFilter === 'booked' || statusFilter === 'lost' ? statusFilter : 'open'} 
                        onValueChange={setStatusFilter} 
                        className="w-full md:w-auto"
                    >
                        <TabsList className="grid grid-cols-3 w-full md:w-[300px]">
                            <TabsTrigger value="open">Open</TabsTrigger>
                            <TabsTrigger value="booked">Won</TabsTrigger>
                            <TabsTrigger value="lost">Lost</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 bg-card p-1.5 px-3 rounded-lg border shadow-sm self-start md:self-auto overflow-x-auto no-scrollbar max-w-full">
                        <div className="flex items-center gap-2 mr-2 shrink-0">
                            <CalendarDays className="h-4 w-4 text-realty-gold" />
                            <span className="text-sm font-semibold whitespace-nowrap">
                                {isAllTime ? "All Time" : format(selectedDate || new Date(), "EEEE, MMM d")}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1 border-l pl-3 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handlePrevDay}
                                disabled={isAllTime}
                                title="Previous Day"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-medium"
                                onClick={handleGoToToday}
                            >
                                Today
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNextDay}
                                disabled={isAllTime}
                                title="Next Day"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={isAllTime ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 px-3 text-xs font-medium ml-1",
                                    isAllTime && "bg-realty-gold/10 text-realty-gold hover:bg-realty-gold/20"
                                )}
                                onClick={handleToggleAllTime}
                            >
                                All Time
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className={cn("p-4 md:p-6", filtersOpen ? "block" : "hidden md:block")}>
                <LeadFilters
                    onSearchChange={setSearchQuery}
                    onStatusChange={setStatusFilter}
                    onSourceChange={setSourceFilter}
                    onAssignedToChange={setAssignedToFilter}
                    onBuilderChange={setBuilderFilter}
                    users={users}
                    builders={builders}
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
