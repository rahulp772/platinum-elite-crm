"use client"

import * as React from "react"
import { Search, SlidersHorizontal, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface PropertyFiltersProps {
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onTypeChange: (value: string) => void
    onSortChange: (value: string) => void
    showFavorited?: boolean
    onFavoritedChange?: (value: boolean) => void
}

export function PropertyFilters({
    onSearchChange,
    onStatusChange,
    onTypeChange,
    onSortChange,
    showFavorited = false,
    onFavoritedChange,
}: PropertyFiltersProps) {
    const [search, setSearch] = React.useState("")
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    const handleSearchChange = (value: string) => {
        setSearch(value)
        onSearchChange(value)
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={searchInputRef}
                    placeholder="Search by location, title, or address..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Status Filter */}
            <Select onValueChange={onStatusChange} defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select onValueChange={onTypeChange} defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort */}
            <Select onValueChange={onSortChange} defaultValue="newest">
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
            </Select>

            {/* Liked Properties Filter */}
            {onFavoritedChange && (
                <Button
                    variant={showFavorited ? "default" : "outline"}
                    size="sm"
                    className={cn(
                        "w-full sm:w-auto gap-2",
                        showFavorited && "bg-realty-gold text-realty-navy hover:bg-realty-gold/90"
                    )}
                    onClick={() => onFavoritedChange(!showFavorited)}
                >
                    <Heart className={cn("h-4 w-4", showFavorited && "fill-current")} />
                    Liked
                </Button>
            )}
        </div>
    )
}