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
    Kanban,
    Sparkles,
    AlertTriangle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import api from "@/lib/api"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: undefined },
    { name: "Leads", href: "/leads", icon: Users, permission: "leads:read" },
    { name: "Pipeline", href: "/pipeline", icon: Kanban, permission: "deals:read" },
    { name: "Properties", href: "/properties", icon: Building2, permission: "properties:read" },
    { name: "Deals", href: "/deals", icon: Handshake, permission: "deals:read" },
    { name: "Builders", href: "/builders", icon: Building2, permission: "properties:read" },
    { name: "Tasks", href: "/tasks", icon: CheckSquare, permission: "tasks:read" },

    { name: "Calendar", href: "/calendar", icon: Calendar, permission: "tasks:read" },
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: 0, permission: undefined },
    { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "reports:read" },
    { name: "Settings", href: "/settings", icon: Settings, permission: "settings:write" },
]

interface SidebarProps {
    isMobile?: boolean
    mobileOpen?: boolean
    onMobileClose?: () => void
}

export function Sidebar({ isMobile = false, mobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout, hasPermission } = useAuth()
    const { unreadMessages } = useNotifications()
    const [collapsed, setCollapsed] = React.useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = React.useState<any>(null)

    React.useEffect(() => {
        if (user?.tenantId) {
            api.get('/auth/subscription')
                .then(res => setSubscriptionStatus(res.data))
                .catch(console.error)
        }
    }, [user?.tenantId])
    
    const navItems = React.useMemo(() => {
        return navigation
            .filter(item => {
                if (!item.permission) return true
                if (user?.isSuperAdmin) return true
                if (item.permission === "settings:write") {
                    return user?.role?.level && user.role.level >= 100
                }
                return hasPermission(item.permission)
            })
            .map(item => 
                item.name === "Messages" ? { ...item, badge: unreadMessages > 0 ? unreadMessages : undefined } : item
            )
    }, [unreadMessages, user, hasPermission])

    // When in mobile mode, just render the content - layout handles the Sheet wrapper
    // Note: We pass isMobile to disable expensive effects
    return (
        <TooltipProvider delayDuration={0}>
            <SidebarContent 
                navItems={navItems} 
                collapsed={isMobile ? false : collapsed} 
                setCollapsed={setCollapsed} 
                pathname={pathname}
                user={user}
                logout={logout}
                onMobileClose={onMobileClose}
                isMobile={isMobile}
                subscriptionStatus={subscriptionStatus}
            />
        </TooltipProvider>
    )
}

interface SidebarContentProps {
    navItems: Array<{ name: string; href: string; icon: React.ElementType; badge?: number; permission?: string }>
    collapsed: boolean
    setCollapsed: (v: boolean) => void
    pathname: string
    user: any
    logout: () => void
    onMobileClose?: () => void
    isMobile?: boolean
    subscriptionStatus?: any
}

function SidebarContent({ navItems, collapsed, setCollapsed, pathname, user, logout, onMobileClose, isMobile = false, subscriptionStatus }: SidebarContentProps) {
    return (
        <div
            className={cn(
                "relative flex h-full flex-col overflow-hidden",
                !isMobile && "transition-all duration-300 ease-in-out",
                "bg-card border-r border-border",
                collapsed && !isMobile ? "w-20" : "w-72"
            )}
        >
            {/* Desktop-only: decorative blur orbs. Completely omitted on mobile to eliminate GPU compositing layers. */}
            {!isMobile && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-realty-navy/40 via-background to-background" />
                    <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-realty-gold/5 blur-[100px]" />
                    <div className="absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-realty-navy-light/10 blur-[120px]" />
                    <div className="absolute right-0 bottom-20 h-60 w-60 rounded-full bg-realty-gold/10 blur-[80px]" />
                    {/* NOTE: backdrop-blur-3xl removed — it was creating an expensive full-sidebar GPU layer */}
                </>
            )}
            {isMobile && <div className="absolute inset-0 bg-card" />}

            <div className="relative z-10 flex flex-col h-full overflow-hidden">
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
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                isMobile ? "bg-realty-gold" : "bg-gradient-to-br from-realty-gold/80 to-realty-gold shadow-lg shadow-realty-gold/20"
                            )}>
                                <Building2 className="h-5 w-5 text-realty-navy" />
                            </div>
                            {/* Status dot: animate-pulse only on desktop — continuous animation on a GPU-composited element causes paint storms on mobile */}
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-realty-gold-light" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground tracking-tight">MakeItCRM</span>
                                <span className="text-[10px] font-medium text-realty-gold uppercase tracking-[0.2em]">Real Estate Intelligence</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-3 p-4 mx-3 mt-4 rounded-2xl bg-accent/30 border border-border shadow-sm",
                    collapsed && !isMobile && "justify-center mx-2 p-3"
                )}>
                    <Avatar className={cn("ring-2 ring-primary/10 ring-offset-2 ring-offset-background", collapsed ? "h-10 w-10" : "h-11 w-11")}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Indica"}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {user?.name?.split(' ').map((n: string) => n[0]).join('') || "IW"}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate">{user?.name}</h2>
                            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.name}</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {!collapsed && (
                        <p className="px-3 mb-2 text-[10px] font-semibold text-realty-gold uppercase tracking-wider">Navigation</p>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const handleClick = () => {
                            if (onMobileClose) {
                                onMobileClose()
                            }
                        }
                        const NavItem = (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleClick}
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
                                    <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
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

                <div className="border-t border-border p-3 space-y-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/help"
                                onClick={onMobileClose}
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
                                onClick={() => {
                                    if (onMobileClose) onMobileClose()
                                    logout()
                                }}
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

                {!collapsed && subscriptionStatus && (
                    <div className="p-3">
                        {subscriptionStatus.isOnHighestPlan ? (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-realty-gold/20 to-realty-gold/10 p-4 shadow-xl border border-realty-gold/20 group">
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-realty-gold/10 blur-2xl group-hover:bg-realty-gold/20 transition-all duration-500" />
                                <div className="relative flex items-center gap-2 mb-2">
                                    <div className="p-1 rounded-md bg-realty-gold/20">
                                        <Sparkles className="h-3 w-3 text-realty-gold" />
                                    </div>
                                    <p className="text-xs font-bold text-realty-gold uppercase tracking-wider">{subscriptionStatus.planName || 'Enterprise'}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-muted-foreground capitalize">
                                        {subscriptionStatus.subscriptionStatus || 'Active'}
                                    </p>
                                    <Badge variant="outline" className="text-[9px] h-4 border-realty-gold/30 text-realty-gold px-1">PRO</Badge>
                                </div>
                            </div>
                        ) : subscriptionStatus.isTrial ? (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 shadow-xl border border-amber-500/20 group">
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
                                <div className="relative flex items-center gap-2 mb-2">
                                    <div className="p-1 rounded-md bg-amber-500/20">
                                        <Sparkles className="h-3 w-3 text-amber-500" />
                                    </div>
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                        {subscriptionStatus.planName ? `${subscriptionStatus.planName} Trial` : 'Free Trial'}
                                    </p>
                                </div>
                                {subscriptionStatus.trialEndDate && (
                                    <p className="text-[10px] text-muted-foreground mb-3">
                                        {subscriptionStatus.isTrialExpired 
                                            ? `Expired ${subscriptionStatus.daysSinceExpiry} days ago`
                                            : `${Math.ceil((new Date(subscriptionStatus.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining`
                                        }
                                    </p>
                                )}
                                <Link href="/pricing">
                                    <Button size="sm" className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs border-0 shadow-lg shadow-amber-500/20 h-8">
                                        Upgrade Now
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-realty-navy to-realty-navy-dark p-4 shadow-xl border border-realty-gold/20 group">
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-realty-gold/10 blur-2xl group-hover:bg-realty-gold/20 transition-all duration-500" />
                                <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-realty-gold/5 blur-xl" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-xs font-bold text-realty-gold-light uppercase tracking-wider">
                                            {subscriptionStatus.planName || 'Elite Upgrade'}
                                        </p>
                                        {!subscriptionStatus.planName && <Badge className="text-[8px] h-3 bg-realty-gold text-realty-navy px-1 font-black">NEW</Badge>}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mb-3">
                                        {subscriptionStatus.planName 
                                            ? `${subscriptionStatus.subscriptionStatus || 'Active'} subscription`
                                            : 'Unlock premium market intelligence'}
                                    </p>
                                    <Link href="/pricing">
                                        <Button size="sm" className="w-full bg-realty-gold text-realty-navy hover:bg-realty-gold-light font-bold text-xs border-0 shadow-lg shadow-realty-gold/20 h-8">
                                            {subscriptionStatus.planName ? 'Upgrade Plan' : 'Upgrade Now'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}