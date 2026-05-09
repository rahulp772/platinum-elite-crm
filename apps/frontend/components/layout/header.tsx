"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Users, Building2, Handshake, CheckSquare, X, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { AddLeadDialogControlled } from "@/components/leads/add-lead-dialog-controlled"
import { AddDealDialog } from "@/components/deals/add-deal-dialog"
import { AddPropertyDialog } from "@/components/properties/add-property-dialog"
import { AddTaskDialog } from "@/components/tasks/add-task-dialog"
import { mockProperties } from "@/lib/mock-data/properties"
import { mockLeads } from "@/lib/mock-data/leads"
import { mockDeals } from "@/lib/mock-data/deals"
import { SearchResult } from "@/types/search"
import { useSearch } from "@/hooks/use-search"
import { useNotifications } from "@/lib/notification-context"

type DialogType = "lead" | "deal" | "property" | "task" | null

interface HeaderProps {
    onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { unreadMessages } = useNotifications()
    const [activeDialog, setActiveDialog] = React.useState<DialogType>(null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const searchContainerRef = React.useRef<HTMLDivElement>(null)

    const { data: searchResults = [], isLoading: isSearchLoading } = useSearch(searchQuery)

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

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    React.useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setIsSearchOpen(true)
        } else {
            setIsSearchOpen(false)
        }
    }, [searchQuery])

    const handleResultClick = (result: SearchResult) => {
        setSearchQuery("")
        setIsSearchOpen(false)

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

    const handleViewAll = (type: SearchResult["type"]) => {
        setIsSearchOpen(false)
        router.push(`/search?q=${searchQuery}&type=${type}`)
    }

    const getResultIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "property":
                return <Building2 className="h-4 w-4" />
            case "lead":
                return <Users className="h-4 w-4" />
            case "deal":
                return <Handshake className="h-4 w-4" />
        }
    }

    const getTypeLabel = (type: SearchResult["type"]) => {
        switch (type) {
            case "property":
                return "Properties"
            case "lead":
                return "Leads"
            case "deal":
                return "Deals"
        }
    }

    const groupedResults = searchResults.reduce((acc, result) => {
        if (!acc[result.type]) {
            acc[result.type] = []
        }
        acc[result.type].push(result)
        return acc
    }, {} as Record<SearchResult["type"], SearchResult[]>)

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between gap-2 px-3 md:px-6">
                    {/* Logo - Left side on mobile */}
                    <div className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-realty-gold shrink-0">
                        <Building2 className="h-5 w-5 text-realty-navy" />
                    </div>

                    {/* Logo - Tablet/MD but hidden on LG */}
                    <div className="hidden md:block lg:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-realty-gold/80 to-realty-gold shadow-lg shadow-realty-gold/20 shrink-0">
                        <Building2 className="h-5 w-5 text-realty-navy" />
                    </div>

                    {/* Desktop Search - Full bar */}
                    <div className="hidden md:block flex-1" ref={searchContainerRef}>
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search or type ⌘K..."
                                className="pl-9 pr-10 w-full"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    if (e.target.value.trim()) setIsSearchOpen(true)
                                }}
                                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setIsSearchOpen(false)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <kbd className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>

                        {/* Search Dropdown */}
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 w-full max-w-md mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <>
                                        {Object.entries(groupedResults).map(([type, results]) => (
                                            <div key={type}>
                                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                                                    {getTypeLabel(type as SearchResult["type"])}
                                                </div>
                                                {results.map((result) => (
                                                    <button
                                                        key={`${result.type}-${result.id}`}
                                                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent text-left"
                                                        onClick={() => handleResultClick(result)}
                                                    >
                                                        <div className="flex-shrink-0 text-muted-foreground">
                                                            {getResultIcon(result.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium truncate">{result.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                                        </div>
                                                        {result.status && (
                                                            <span className="text-xs text-muted-foreground capitalize">{result.status}</span>
                                                        )}
                                                        {result.value && (
                                                            <span className="text-xs text-muted-foreground">${(result.value / 1000).toFixed(0)}k</span>
                                                        )}
                                                    </button>
                                                ))}
                                                <button
                                                    className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-accent border-t"
                                                    onClick={() => handleViewAll(type as SearchResult["type"])}
                                                >
                                                    View all {getTypeLabel(type as SearchResult["type"])}
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Mobile: Search Icon - Right side, next to Quick Add */}
                        <div className="md:hidden">
                            {!isSearchOpen ? (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent"
                                >
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="relative w-[200px] sm:w-[250px]">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search..."
                                            className="pl-9 pr-10 w-full bg-accent"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value)
                                                if (e.target.value.trim()) setIsSearchOpen(true)
                                            }}
                                            onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                            onFocus={() => searchQuery && setIsSearchOpen(true)}
                                            autoFocus
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                setSearchQuery("")
                                                setIsSearchOpen(false)
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Add */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Quick Add</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setActiveDialog("lead")}>
                                    <Users className="mr-2 h-4 w-4" />
                                    New Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveDialog("property")}>
                                    <Building2 className="mr-2 h-4 w-4" />
                                    New Property
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveDialog("deal")}>
                                    <Handshake className="mr-2 h-4 w-4" />
                                    New Deal
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveDialog("task")}>
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    New Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Indica"}`} />
                                        <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || "IW"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.name || "Indica Watson"}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email || "indica@realestate.com"}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/settings")}>Profile</DropdownMenuItem>
                                {user?.role && user.role.level !== undefined && user.role.level >= 100 && (
                                    <DropdownMenuItem onClick={() => router.push("/settings?tab=billing")}>
                                        Billing
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => router.push("/messages")}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Team Messages
                                        </div>
                                        {unreadMessages > 0 && (
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-realty-gold px-1 text-[10px] font-bold text-realty-navy">
                                                {unreadMessages}
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Dialogs */}
            <AddLeadDialogControlled
                open={activeDialog === "lead"}
                onOpenChange={(open) => setActiveDialog(open ? "lead" : null)}
            />
            <AddDealDialog
                open={activeDialog === "deal"}
                onOpenChange={(open) => setActiveDialog(open ? "deal" : null)}
            />
            <AddPropertyDialog
                open={activeDialog === "property"}
                onOpenChange={(open) => setActiveDialog(open ? "property" : null)}
            />
            <AddTaskDialog
                open={activeDialog === "task"}
                onOpenChange={(open) => setActiveDialog(open ? "task" : null)}
            />
        </>
    )
}