"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <Card className="hover:shadow-md transition-shadow group overflow-hidden relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {title}
                    </CardTitle>
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.2 }}
                        className="transition-colors"
                    >
                        <Icon className={cn("h-5 w-5", iconColor)} />
                    </motion.div>
                </CardHeader>
                <CardContent>
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold tabular-nums"
                    >
                        {value}
                    </motion.div>
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
                <motion.div 
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                />
            </Card>
        </motion.div>
    )
}
