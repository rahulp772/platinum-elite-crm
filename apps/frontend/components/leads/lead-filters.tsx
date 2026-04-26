"use client"

import * as React from "react"
import { Search, X, SlidersHorizontal, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { PropertyType, LeadStatus, LeadSource } from "@/types/lead"

interface LeadFiltersProps {
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onSourceChange: (value: string) => void
    onAssignedToChange: (value: string) => void
    onPropertyTypeChange: (value: string) => void
    onBudgetMinChange: (value: number | undefined) => void
    onBudgetMaxChange: (value: number | undefined) => void
    onCreatedFromChange: (value: Date | undefined) => void
    onCreatedToChange: (value: Date | undefined) => void
    onFollowUpFromChange: (value: Date | undefined) => void
    onFollowUpToChange: (value: Date | undefined) => void
    users?: { id: string; name: string }[]
}

const statusOptions: LeadStatus[] = [
    "new", "contacted", "rnr", "qualified", "site_visit_scheduled",
    "site_visit_done", "negotiation", "won", "lost"
]

const sourceOptions: LeadSource[] = [
    "website", "referral", "social", "cold_call", "event",
    "99acres", "magicbricks", "housing.com", "google_ads",
    "facebook", "channel_partner"
]

const propertyTypeOptions: PropertyType[] = [
    "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK",
    "Penthouse", "Plot", "Row House", "Villa", "Apartment"
]

export function LeadFilters({
    onSearchChange,
    onStatusChange,
    onSourceChange,
    onAssignedToChange,
    onPropertyTypeChange,
    onBudgetMinChange,
    onBudgetMaxChange,
    onCreatedFromChange,
    onCreatedToChange,
    onFollowUpFromChange,
    onFollowUpToChange,
    users = [],
}: LeadFiltersProps) {
    const [search, setSearch] = React.useState("")
    const [showAdvanced, setShowAdvanced] = React.useState(false)
    const [activeFilters, setActiveFilters] = React.useState<string[]>([])
    
    const [status, setStatus] = React.useState("all")
    const [source, setSource] = React.useState("all")
    const [assignedTo, setAssignedTo] = React.useState("all")
    const [propertyType, setPropertyType] = React.useState("all")
    const [budgetMin, setBudgetMin] = React.useState("")
    const [budgetMax, setBudgetMax] = React.useState("")
    const [createdFrom, setCreatedFrom] = React.useState<Date | undefined>()
    const [createdTo, setCreatedTo] = React.useState<Date | undefined>()
    const [followUpFrom, setFollowUpFrom] = React.useState<Date | undefined>()
    const [followUpTo, setFollowUpTo] = React.useState<Date | undefined>()

    const handleSearchChange = (value: string) => {
        setSearch(value)
        onSearchChange(value)
    }

    const handleStatusChange = (value: string) => {
        setStatus(value)
        onStatusChange(value)
        updateActiveFilters("status", value !== "all")
    }

    const handleSourceChange = (value: string) => {
        setSource(value)
        onSourceChange(value)
        updateActiveFilters("source", value !== "all")
    }

    const handleAssignedToChange = (value: string) => {
        setAssignedTo(value)
        onAssignedToChange(value)
        updateActiveFilters("assignedTo", value !== "all")
    }

    const handlePropertyTypeChange = (value: string) => {
        setPropertyType(value)
        onPropertyTypeChange(value)
        updateActiveFilters("propertyType", value !== "all")
    }

    const handleBudgetMinChange = (value: string) => {
        setBudgetMin(value)
        const num = value ? parseInt(value) : undefined
        onBudgetMinChange(num)
        updateActiveFilters("budgetMin", !!num)
    }

    const handleBudgetMaxChange = (value: string) => {
        setBudgetMax(value)
        const num = value ? parseInt(value) : undefined
        onBudgetMaxChange(num)
        updateActiveFilters("budgetMax", !!num)
    }

    const handleCreatedFromChange = (date: Date | undefined) => {
        setCreatedFrom(date)
        onCreatedFromChange(date)
        updateActiveFilters("createdFrom", !!date)
    }

    const handleCreatedToChange = (date: Date | undefined) => {
        setCreatedTo(date)
        onCreatedToChange(date)
        updateActiveFilters("createdTo", !!date)
    }

    const handleFollowUpFromChange = (date: Date | undefined) => {
        setFollowUpFrom(date)
        onFollowUpFromChange(date)
        updateActiveFilters("followUpFrom", !!date)
    }

    const handleFollowUpToChange = (date: Date | undefined) => {
        setFollowUpTo(date)
        onFollowUpToChange(date)
        updateActiveFilters("followUpTo", !!date)
    }

    const updateActiveFilters = (filter: string, isActive: boolean) => {
        if (isActive && !activeFilters.includes(filter)) {
            setActiveFilters(prev => [...prev, filter])
        } else if (!isActive) {
            setActiveFilters(prev => prev.filter(f => f !== filter))
        }
    }

    const hasAdvancedFilters = () => {
        return assignedTo !== "all" || propertyType !== "all" || 
               budgetMin || budgetMax || createdFrom || createdTo ||
               followUpFrom || followUpTo
    }

    const clearFilters = () => {
        setSearch("")
        setStatus("all")
        setSource("all")
        setAssignedTo("all")
        setPropertyType("all")
        setBudgetMin("")
        setBudgetMax("")
        setCreatedFrom(undefined)
        setCreatedTo(undefined)
        setFollowUpFrom(undefined)
        setFollowUpTo(undefined)
        setActiveFilters([])

        onSearchChange("")
        onStatusChange("all")
        onSourceChange("all")
        onAssignedToChange("all")
        onPropertyTypeChange("all")
        onBudgetMinChange(undefined)
        onBudgetMaxChange(undefined)
        onCreatedFromChange(undefined)
        onCreatedToChange(undefined)
        onFollowUpFromChange(undefined)
        onFollowUpToChange(undefined)
    }

    const removeFilter = (filter: string) => {
        switch (filter) {
            case "status":
                setStatus("all")
                onStatusChange("all")
                break
            case "source":
                setSource("all")
                onSourceChange("all")
                break
            case "assignedTo":
                setAssignedTo("all")
                onAssignedToChange("all")
                break
            case "propertyType":
                setPropertyType("all")
                onPropertyTypeChange("all")
                break
            case "budgetMin":
                setBudgetMin("")
                onBudgetMinChange(undefined)
                break
            case "budgetMax":
                setBudgetMax("")
                onBudgetMaxChange(undefined)
                break
            case "createdFrom":
                setCreatedFrom(undefined)
                onCreatedFromChange(undefined)
                break
            case "createdTo":
                setCreatedTo(undefined)
                onCreatedToChange(undefined)
                break
            case "followUpFrom":
                setFollowUpFrom(undefined)
                onFollowUpFromChange(undefined)
                break
            case "followUpTo":
                setFollowUpTo(undefined)
                onFollowUpToChange(undefined)
                break
        }
        setActiveFilters(prev => prev.filter(f => f !== filter))
    }

    return (
        <div className="space-y-4">
            {/* Main Filters Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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

                <Select onValueChange={handleStatusChange} value={status}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                                {s.replace(/_/g, " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={handleSourceChange} value={source}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {sourceOptions.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                                {s.replace(/_/g, " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant={showAdvanced || hasAdvancedFilters() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasAdvancedFilters() && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                            {activeFilters.length}
                        </Badge>
                    )}
                    {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Assigned To */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Assigned To</Label>
                        <Select onValueChange={handleAssignedToChange} value={assignedTo}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Agents" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Property Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Property Type</Label>
                        <Select onValueChange={handlePropertyTypeChange} value={propertyType}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {propertyTypeOptions.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Budget Range (₹)</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Min"
                                type="number"
                                value={budgetMin}
                                onChange={(e) => handleBudgetMinChange(e.target.value)}
                                className="h-9"
                            />
                            <Input
                                placeholder="Max"
                                type="number"
                                value={budgetMax}
                                onChange={(e) => handleBudgetMaxChange(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* Preferred Location */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Location</Label>
                        <Input
                            placeholder="Any location"
                            className="h-9"
                        />
                    </div>

                    {/* Created Date Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Created From</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 w-full justify-start font-normal">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {createdFrom ? createdFrom.toLocaleDateString() : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={createdFrom}
                                    onSelect={handleCreatedFromChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Created To</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 w-full justify-start font-normal">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {createdTo ? createdTo.toLocaleDateString() : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={createdTo}
                                    onSelect={handleCreatedToChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Follow-up Date Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Follow-up From</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 w-full justify-start font-normal">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {followUpFrom ? followUpFrom.toLocaleDateString() : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={followUpFrom}
                                    onSelect={handleFollowUpFromChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Follow-up To</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 w-full justify-start font-normal">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {followUpTo ? followUpTo.toLocaleDateString() : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={followUpTo}
                                    onSelect={handleFollowUpToChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {activeFilters.map((filter) => (
                        <Badge 
                            key={filter} 
                            variant="secondary" 
                            className="capitalize cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFilter(filter)}
                        >
                            {filter.replace(/([A-Z])/g, " $1").trim()}
                            <X className="ml-1 h-3 w-3" />
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