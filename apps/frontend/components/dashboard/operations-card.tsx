"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, UserMinus, CheckCircle2, PlusCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface OperationsCardProps {
    stats: {
        openLeads: number
        unassignedLeads: number
        todayClosed: number
        todayNew: number
    }
}

export function OperationsCard({ stats }: OperationsCardProps) {
    const items = [
        {
            label: "Open Leads",
            value: stats.openLeads,
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50",
            href: "/leads?status=open"
        },
        {
            label: "Unassigned",
            value: stats.unassignedLeads,
            icon: UserMinus,
            color: "text-amber-600",
            bg: "bg-amber-50",
            href: "/leads?assignedToId=unassigned"
        },
        {
            label: "Today Closed",
            value: stats.todayClosed,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            href: "/leads?status=booked"
        },
        {
            label: "Today New",
            value: stats.todayNew,
            icon: PlusCircle,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            href: "/leads?date=today"
        }
    ]

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Lead Operations</CardTitle>
                <Link href="/leads" className="text-xs font-bold text-muted-foreground hover:text-realty-gold flex items-center gap-1 transition-colors uppercase tracking-wider">
                    View All <ArrowRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {items.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.href}
                            className="group p-4 rounded-xl border border-border/40 bg-background hover:border-realty-gold/30 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg transition-colors group-hover:bg-opacity-80", item.bg)}>
                                    <item.icon className={cn("h-4 w-4", item.color)} />
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                            </div>
                            <div className="text-3xl font-bold tracking-tight group-hover:text-realty-gold transition-colors">
                                {item.value}
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
