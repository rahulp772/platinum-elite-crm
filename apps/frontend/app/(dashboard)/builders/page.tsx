"use client"

import * as React from "react"
import { BuilderCard } from "@/components/builders/builder-card"
import { AddBuilderDialog } from "@/components/builders/add-builder-dialog"
import { useBuilders } from "@/hooks/use-builders"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, LoaderCircle, Plus, Search, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function BuildersPage() {
    const { data: builders, isLoading, isError } = useBuilders()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [view, setView] = React.useState<"grid" | "list">("grid")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    const filteredBuilders = React.useMemo(() => {
        if (!builders) return []
        return builders.filter(b => 
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.headquarters?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [builders, searchQuery])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-realty-gold" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading builders...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Property Builders</h1>
                    <p className="text-muted-foreground">
                        Manage developers and track their project portfolios
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-2xl p-1 bg-card/50 shadow-sm">
                        <Button
                            variant={view === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl"
                            onClick={() => setView("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button 
                        onClick={() => setIsAddOpen(true)}
                        className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light font-bold rounded-2xl h-11 px-6 shadow-lg shadow-realty-gold/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Register Builder
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-card/50 p-2 rounded-3xl border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search builders by name or location..." 
                        className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 rounded-2xl text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {filteredBuilders.length > 0 ? (
                <div className={
                    view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "flex flex-col gap-4"
                }>
                    {filteredBuilders.map((builder) => (
                        <div key={builder.id} className="cv-auto">
                            <BuilderCard
                                builder={builder}
                                variant={view}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] border-2 border-dashed rounded-[40px] gap-6 bg-muted/20 border-muted-foreground/20">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-foreground">No builders found</p>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            {searchQuery ? `We couldn't find any builders matching "${searchQuery}"` : "Start by registering your first property developer to link with your listings."}
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => searchQuery ? setSearchQuery("") : setIsAddOpen(true)}
                        className="rounded-2xl px-8 h-12 font-bold"
                    >
                        {searchQuery ? "Clear Search" : "Register Builder"}
                    </Button>
                </div>
            )}

            <AddBuilderDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </div>
    )
}
