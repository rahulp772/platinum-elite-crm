"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Building2,
    CheckSquare,
    Menu,
} from "lucide-react"
import { useNotifications } from "@/lib/notification-context"

interface MobileBottomBarProps {
    onMenuClick: () => void
}

const mobileNavItems = [
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
]

const rightNavItems = [
    { name: "Leads", href: "/leads", icon: Users },
]

export function MobileBottomBar({ onMenuClick }: MobileBottomBarProps) {
    const pathname = usePathname()
    const { unreadMessages } = useNotifications()

    const isActive = (href: string) => pathname === href || 
        (href !== "/" && pathname.startsWith(href))

    return (
        <div className="fixed bottom-2 left-2 right-2 z-50 md:hidden rounded-2xl">
            <div className="bg-background/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl">
                <div className="flex items-center justify-between h-14 px-1 py-2">
                    {/* Properties */}
                    {mobileNavItems.slice(0, 1).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200",
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                        </Link>
                    ))}

                    {/* Tasks */}
                    {mobileNavItems.slice(1).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200",
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                        </Link>
                    ))}

                    {/* Center - Dashboard with glass blur effect */}
                    <Link
                        href="/"
                        className="flex flex-col items-center justify-center"
                    >
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 backdrop-blur-md",
                            isActive("/") 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                                : "bg-white/20 dark:bg-white/10"
                        )}>
                            <LayoutDashboard className={cn("h-5 w-5", isActive("/") ? "" : "text-foreground")} />
                        </div>
                    </Link>

                    {/* Leads */}
                    {rightNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200",
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                        </Link>
                    ))}

                    {/* Menu button */}
                    <button
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 text-muted-foreground hover:text-foreground"
                    >
                        <div className="relative">
                            <Menu className="h-5 w-5" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1.5 h-2.5 min-w-[20px] flex items-center justify-center rounded-full bg-realty-gold px-1 text-[8px] font-bold text-realty-navy">
                                    {unreadMessages}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium mt-0.5">Menu</span>
                    </button>
                </div>
            </div>
        </div>
    )
}