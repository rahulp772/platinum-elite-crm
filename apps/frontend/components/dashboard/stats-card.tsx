import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: LucideIcon
    iconColor?: string
}

export function StatsCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "text-primary",
}: StatsCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={cn("h-5 w-5", iconColor)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
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
        </Card>
    )
}
