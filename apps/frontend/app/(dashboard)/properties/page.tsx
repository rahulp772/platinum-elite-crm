"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PropertyCard } from "@/components/properties/property-card"
import { PropertyFilters } from "@/components/properties/property-filters"
import { mockProperties } from "@/lib/mock-data/properties"
import { Property } from "@/types/property"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Plus, Square } from "lucide-react"

export default function PropertiesPage() {
    const router = useRouter()
    const [properties, setProperties] = React.useState(mockProperties)
    const [filteredProperties, setFilteredProperties] = React.useState(mockProperties)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [typeFilter, setTypeFilter] = React.useState("all")
    const [sortBy, setSortBy] = React.useState("newest")
    const [viewMode, setViewMode] = React.useState<"grid" | "small-grid" | "list">("grid")

    // Apply filters and sorting
    React.useEffect(() => {
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

    const handleFavoriteToggle = (id: string) => {
        setProperties(
            properties.map((property) =>
                property.id === id
                    ? { ...property, favorited: !property.favorited }
                    : property
            )
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                    <p className="text-muted-foreground">
                        Browse and manage your property listings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border bg-background p-1 gap-0.5">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "small-grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("small-grid")}
                        >
                            <Square className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button>
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

            {/* Property Grid */}
            {filteredProperties.length > 0 ? (
                <div className={viewMode === "small-grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" : "grid gap-6 " + (viewMode === "list" ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
                    {filteredProperties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onFavoriteToggle={handleFavoriteToggle}
                            variant={viewMode === "small-grid" ? "compact" : viewMode === "list" ? "list" : "grid"}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">No properties found matching your criteria.</p>
                </div>
            )}
        </div>
    )
}