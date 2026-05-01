"use client"

import * as React from "react"
import { PropertyCard } from "@/components/properties/property-card"
import { PropertyFilters } from "@/components/properties/property-filters"
import { AddPropertyDialog } from "@/components/properties/add-property-dialog"
import { useProperties, PropertiesFilters } from "@/hooks/use-properties"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, LoaderCircle, Plus, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PropertiesPage() {
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [typeFilter, setTypeFilter] = React.useState("all")
    const [sortBy, setSortBy] = React.useState("newest")
    const [view, setView] = React.useState<"grid" | "list">("grid")
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [filtersOpen, setFiltersOpen] = React.useState(false)

    const filters = React.useMemo<PropertiesFilters>(() => ({
        page,
        limit,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        sortBy,
    }), [page, limit, searchQuery, statusFilter, typeFilter, sortBy])

const { data: propertiesData, isLoading, isError } = useProperties(filters)
    const properties = propertiesData?.data || []
    const metadata = propertiesData?.metadata

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit)
        setPage(1)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-realty-gold" />
                <p className="text-muted-foreground animate-pulse">Loading properties...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-destructive font-semibold">Failed to load properties.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                    <p className="text-muted-foreground">
                        Manage and track all real estate listings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center border rounded-lg p-1 bg-muted/50">
                        <Button
                            variant={view === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setView("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Property
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <PropertyFilters
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onTypeChange={setTypeFilter}
                onSortChange={setSortBy}
            />

            {/* Results Count */}
            {metadata && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="text-foreground font-semibold">
                            {(metadata.page - 1) * metadata.limit + 1}
                        </span>
                        {" - "}
                        <span className="text-foreground font-semibold">
                            {Math.min(metadata.page * metadata.limit, metadata.total)}
                        </span>
                        {" of "}
                        <span className="text-foreground font-semibold">{metadata.total}</span>{" "}
                        properties
                    </p>
                </div>
            )}

            {/* Content */}
            {properties.length > 0 ? (
                <div className={
                    view === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "flex flex-col gap-4"
                }>
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            variant={view === "list" ? "list" : "grid"}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] border-2 border-dashed rounded-3xl gap-4 bg-muted/20">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold">No properties found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters or start by adding a new listing.</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add Property</Button>
                </div>
            )}

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 order-2 sm:order-1">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Rows per page</span>
                        <Select
                            value={`${limit}`}
                            onValueChange={(value) => handleLimitChange(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={`${limit}`} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 12, 20, 30, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="text-xs px-2 sm:px-3"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                        </Button>
                        {(() => {
                            const totalPages = metadata.totalPages
                            const currentPage = page
                            const pages: (number | string)[] = []

                            if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i)
                            } else {
                                if (currentPage <= 3) {
                                    for (let i = 1; i <= 4; i++) pages.push(i)
                                    pages.push("...")
                                    pages.push(totalPages)
                                } else if (currentPage >= totalPages - 2) {
                                    pages.push(1)
                                    pages.push("...")
                                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
                                } else {
                                    pages.push(1)
                                    pages.push("...")
                                    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                                    pages.push("...")
                                    pages.push(totalPages)
                                }
                            }

                            return pages.map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-xs">...</span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={page === p ? "secondary" : "ghost"}
                                        size="sm"
                                        className="w-8 h-8 text-xs"
                                        onClick={() => handlePageChange(p as number)}
                                    >
                                        {p}
                                    </Button>
                                )
                            )
                        })()}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= metadata.totalPages}
                            className="text-xs px-2 sm:px-3"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                        </Button>
                    </div>
                </div>
            )}

            <AddPropertyDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </div>
    )
}