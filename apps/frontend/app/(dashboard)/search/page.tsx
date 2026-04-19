"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Users, Handshake, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockProperties } from "@/lib/mock-data/properties"
import { mockLeads } from "@/lib/mock-data/leads"
import { mockDeals } from "@/lib/mock-data/deals"
import { SearchResult } from "@/types/search"

type FilterType = "all" | "property" | "lead" | "deal"

function SearchContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get("q") || ""
    const initialType = (searchParams.get("type") as FilterType) || "all"

    const [searchQuery, setSearchQuery] = React.useState(initialQuery)
    const [typeFilter, setTypeFilter] = React.useState<FilterType>(initialType)

    const performSearch = (query: string, type: FilterType): SearchResult[] => {
        if (!query.trim()) return []

        const q = query.toLowerCase()
        const results: SearchResult[] = []

        if (type === "all" || type === "property") {
            const properties = mockProperties
                .filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.address.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q)
                )
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    subtitle: `${p.address}, ${p.city}`,
                    type: "property" as const,
                    status: p.status,
                    value: p.price
                }))
            results.push(...properties)
        }

        if (type === "all" || type === "lead") {
            const leads = mockLeads
                .filter(l =>
                    l.name.toLowerCase().includes(q) ||
                    l.email.toLowerCase().includes(q) ||
                    l.phone.includes(q)
                )
                .map(l => ({
                    id: l.id,
                    title: l.name,
                    subtitle: `${l.email} | ${l.phone}`,
                    type: "lead" as const,
                    status: l.status
                }))
            results.push(...leads)
        }

        if (type === "all" || type === "deal") {
            const deals = mockDeals
                .filter(d =>
                    d.title.toLowerCase().includes(q) ||
                    d.customerName.toLowerCase().includes(q) ||
                    d.propertyName.toLowerCase().includes(q)
                )
                .map(d => ({
                    id: d.id,
                    title: d.title,
                    subtitle: `${d.customerName} | ${d.propertyName}`,
                    type: "deal" as const,
                    value: d.value
                }))
            results.push(...deals)
        }

        return results
    }

    const results = performSearch(searchQuery, typeFilter)

    const handleResultClick = (result: SearchResult) => {
        switch (result.type) {
            case "property":
                router.push(`/properties?id=${result.id}`)
                break
            case "lead":
                router.push(`/leads?id=${result.id}`)
                break
            case "deal":
                router.push(`/deals?id=${result.id}`)
                break
        }
    }

    const getResultIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "property":
                return <Building2 className="h-5 w-5" />
            case "lead":
                return <Users className="h-5 w-5" />
            case "deal":
                return <Handshake className="h-5 w-5" />
        }
    }

    const getTypeLabel = (type: SearchResult["type"]) => {
        switch (type) {
            case "property":
                return "Property"
            case "lead":
                return "Lead"
            case "deal":
                return "Deal"
        }
    }

    const getTypeColor = (type: SearchResult["type"]) => {
        switch (type) {
            case "property":
                return "bg-blue-500/10 text-blue-500"
            case "lead":
                return "bg-purple-500/10 text-purple-500"
            case "deal":
                return "bg-green-500/10 text-green-500"
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight mb-6">Search Results</h1>

            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search properties, leads, deals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "property", "lead", "deal"] as FilterType[]).map((type) => (
                        <Button
                            key={type}
                            variant={typeFilter === type ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter(type)}
                        >
                            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
                {results.length} {results.length === 1 ? "result" : "results"} found
            </div>

            {results.length > 0 ? (
                <div className="space-y-3">
                    {results.map((result) => (
                        <Card
                            key={`${result.type}-${result.id}`}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleResultClick(result)}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                    {getResultIcon(result.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium">{result.title}</div>
                                    <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full bg-muted capitalize`}>
                                        {getTypeLabel(result.type)}
                                    </span>
                                    {result.status && (
                                        <span className="text-xs text-muted-foreground capitalize">{result.status}</span>
                                    )}
                                    {result.value && (
                                        <span className="text-sm font-medium">${(result.value / 1000).toFixed(0)}k</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No results found" : "Enter a search query to find results"}
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
            <SearchContent />
        </Suspense>
    )
}