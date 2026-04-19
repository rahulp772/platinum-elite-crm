"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Building2,
    Handshake,
    CheckSquare,
    Calendar,
    MessageSquare,
    BarChart3,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users, badge: "3" },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Deals", href: "/deals", icon: Handshake },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [collapsed, setCollapsed] = React.useState(false)

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    "relative flex h-full flex-col transition-all duration-300 ease-in-out overflow-hidden",
                    "bg-card border-r border-border",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                {/* Premium background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-realty-navy/40 via-background to-background" />
                <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-realty-gold/5 blur-[100px] animate-pulse" />
                <div className="absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-realty-navy-light/10 blur-[120px]" />
                <div className="absolute right-0 bottom-20 h-60 w-60 rounded-full bg-realty-gold/10 blur-[80px]" />

                {/* Glass overlay */}
                <div className="absolute inset-0 backdrop-blur-3xl bg-background/20" />

                {/* Content container */}
                <div className="relative z-10 flex flex-col h-full overflow-hidden">

                    {/* Logo & Brand */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn(
                                "absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border border-primary/30 bg-card text-primary shadow-lg shadow-primary/20 hover:bg-accent hover:text-primary transition-all backdrop-blur-sm",
                                collapsed && "rotate-180"
                            )}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <div className={cn(
                            "flex items-center gap-3 px-6 py-6 border-b border-border",
                            collapsed && "justify-center px-4"
                        )}>
                            <div className="relative">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-realty-gold/80 to-realty-gold shadow-lg shadow-realty-gold/20">
                                    <Building2 className="h-5 w-5 text-realty-navy" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-realty-gold-light animate-pulse" />
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground tracking-tight">Bricks CRM</span>
                                    <span className="text-[10px] font-medium text-realty-gold uppercase tracking-[0.2em]">Platinum Elite</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 mx-3 mt-4 rounded-2xl bg-accent/30 backdrop-blur-xl border border-border shadow-sm",
                        collapsed && "justify-center mx-2 p-3"
                    )}>
                        <Avatar className={cn("ring-2 ring-primary/10 ring-offset-2 ring-offset-background", collapsed ? "h-10 w-10" : "h-11 w-11")}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Indica"}`} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                {user?.name?.split(' ').map(n => n[0]).join('') || "IW"}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-semibold text-foreground truncate">{user?.name || "Indica Watson"}</h2>
                                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "Executive Partner"}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                        {!collapsed && (
                            <p className="px-3 mb-2 text-[10px] font-semibold text-realty-gold uppercase tracking-wider">Menu</p>
                        )}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const NavItem = (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        collapsed && "justify-center px-2",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-realty-gold shadow-lg shadow-realty-gold/50" />
                                    )}
                                    <item.icon className={cn(
                                        "h-5 w-5 shrink-0 transition-all duration-200 group-hover:scale-110",
                                        isActive ? "text-primary-foreground" : "group-hover:text-primary"
                                    )} />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{item.name}</span>
                                            {item.badge && (
                                                <Badge className="h-5 min-w-[20px] rounded-full bg-realty-gold px-1.5 text-[10px] text-realty-navy font-bold border-0">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </Link>
                            )

                            if (collapsed) {
                                return (
                                    <Tooltip key={item.name}>
                                        <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                                        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                {item.name}
                                                {item.badge && (
                                                    <Badge className="h-4 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground font-bold">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            }
                            return NavItem
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="border-t border-border p-3 space-y-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/help"
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    <HelpCircle className="h-5 w-5" />
                                    {!collapsed && <span>Help & Support</span>}
                                </Link>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" className="bg-popover text-popover-foreground border-border backdrop-blur-xl">
                                    Help & Support
                                </TooltipContent>
                            )}
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={logout}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    <LogOut className="h-5 w-5" />
                                    {!collapsed && <span>Log Out</span>}
                                </button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" className="bg-popover text-popover-foreground border-border backdrop-blur-xl">
                                    Log Out
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>

                    {/* Upgrade CTA (only when expanded) */}
                    {!collapsed && (
                        <div className="p-3">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-realty-navy to-realty-navy-dark p-4 shadow-xl border border-realty-gold/20">
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-realty-gold/10 blur-2xl" />
                                <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-realty-gold/5 blur-xl" />
                                <div className="relative">
                                    <p className="text-xs font-bold text-realty-gold-light uppercase tracking-wider">Elite Upgrade</p>
                                    <p className="mt-1 text-[10px] text-zinc-400">Unlock premium market intelligence</p>
                                    <Button size="sm" className="mt-3 w-full bg-realty-gold text-realty-navy hover:bg-realty-gold-light font-bold text-xs border-0">
                                        Upgrade Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}