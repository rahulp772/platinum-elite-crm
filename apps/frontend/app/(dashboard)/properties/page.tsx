"use client"

import * as React from "react"
import { PropertyCard } from "@/components/properties/property-card"
import { PropertyFilters } from "@/components/properties/property-filters"
import { AddPropertyDialog } from "@/components/properties/add-property-dialog"
import { useProperties } from "@/hooks/use-properties"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, LoaderCircle, Plus } from "lucide-react"
import { Property } from "@/types/property"

export default function PropertiesPage() {
    const { data: properties, isLoading, isError } = useProperties()
    const [filteredProperties, setFilteredProperties] = React.useState<Property[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [typeFilter, setTypeFilter] = React.useState("all")
    const [sortBy, setSortBy] = React.useState("newest")
    const [view, setView] = React.useState<"grid" | "list">("grid")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Apply filters and sorting
    React.useEffect(() => {
        if (!properties) return

        let filtered = [...properties]

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (property) =>
                    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    property.city.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((property) => property.status === statusFilter)
        }

        // Type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter((property) => property.type === typeFilter)
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.listed).getTime() - new Date(a.listed).getTime()
                case "oldest":
                    return new Date(a.listed).getTime() - new Date(b.listed).getTime()
                case "price_asc":
                    return a.price - b.price
                case "price_desc":
                    return b.price - a.price
                case "views":
                    return b.views - a.views
                default:
                    return 0
            }
        })

        setFilteredProperties(filtered)
    }, [searchQuery, statusFilter, typeFilter, sortBy, properties])

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
                <div className="flex items-center gap-3">
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
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
                </p>
            </div>

            {/* Content */}
            {filteredProperties.length > 0 ? (
                <div className={
                    view === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                }>
                    {filteredProperties.map((property) => (
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

            <AddPropertyDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </div>
    )
}