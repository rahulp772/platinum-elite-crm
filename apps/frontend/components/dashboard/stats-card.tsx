"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// NOTE: framer-motion removed from StatsCard.
// Previously: 4 cards × 3 motion.div each = 12 animated nodes on dashboard mount.
// On mobile, each motion.div triggers layout + paint recalculation.
// Replaced with CSS-only entry animation (no JS overhead) and a pure-CSS shimmer hover.

interface StatsCardProps {
    title: string
    value: string
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: LucideIcon
    iconColor?: string
    index?: number
}

export function StatsCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "text-primary",
    index = 0
}: StatsCardProps) {
    return (
        // CSS fade-in animation driven by animation-delay via inline style.
        // Uses opacity + translateY via @keyframes stats-card-in (defined below).
        // This produces the same staggered entry effect without any JS.
        <div
            className="stats-card-animate"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Card className="hover:shadow-md transition-shadow group overflow-hidden relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 md:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {title}
                    </CardTitle>
                    {/* Icon scales on hover via CSS group-hover — no JS pointer handler */}
                    <div className="transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110">
                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
                    </div>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                        {value}
                    </div>
                    {change && (
                        <p
                            className={cn(
                                "text-xs mt-1",
                                changeType === "positive" && "text-teal-600 dark:text-teal-400",
                                changeType === "negative" && "text-rose-600 dark:text-rose-400",
                                changeType === "neutral" && "text-muted-foreground"
                            )}
                        >
                            {change}
                        </p>
                    )}
                </CardContent>

                {/* Pure CSS shimmer on hover — no framer whileHover, no JS pointer events */}
                <div className="stats-card-shimmer pointer-events-none" aria-hidden="true" />
            </Card>
        </div>
    )
}
