"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface LeadFiltersProps {
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onSourceChange: (value: string) => void
}

export function LeadFilters({
    onSearchChange,
    onStatusChange,
    onSourceChange,
}: LeadFiltersProps) {
    const [search, setSearch] = React.useState("")
    const [activeFilters, setActiveFilters] = React.useState<string[]>([])

    const handleSearchChange = (value: string) => {
        setSearch(value)
        onSearchChange(value)
    }

    const handleStatusChange = (value: string) => {
        onStatusChange(value)
        if (value !== "all" && !activeFilters.includes("status")) {
            setActiveFilters([...activeFilters, "status"])
        } else if (value === "all") {
            setActiveFilters(activeFilters.filter((f) => f !== "status"))
        }
    }

    const handleSourceChange = (value: string) => {
        onSourceChange(value)
        if (value !== "all" && !activeFilters.includes("source")) {
            setActiveFilters([...activeFilters, "source"])
        } else if (value === "all") {
            setActiveFilters(activeFilters.filter((f) => f !== "source"))
        }
    }

    const clearFilters = () => {
        setSearch("")
        onSearchChange("")
        onStatusChange("all")
        onSourceChange("all")
        setActiveFilters([])
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search leads by name, email, or phone..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                            onClick={() => handleSearchChange("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Status Filter */}
                <Select onValueChange={handleStatusChange} defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                </Select>

                {/* Source Filter */}
                <Select onValueChange={handleSourceChange} defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {activeFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="capitalize">
                            {filter}
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    )
}
