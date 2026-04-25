"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Loader2, PhoneCall, CalendarDays, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export function AgentDashboardView() {
    const { data: leads, isLoading } = useQuery({
        queryKey: ["my-leads"],
        queryFn: async () => {
            const res = await api.get("/leads/my-leads")
            return res.data
        }
    })

    if (isLoading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const now = new Date()
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Filter leads
    const overdueLeads = leads?.filter((lead: any) => lead.followUpAt && new Date(lead.followUpAt) < now && !["won", "lost", "booked"].includes(lead.status)) || []
    const todayLeads = leads?.filter((lead: any) => lead.followUpAt && new Date(lead.followUpAt) >= now && new Date(lead.followUpAt) <= todayEnd && !["won", "lost", "booked"].includes(lead.status)) || []
    const newLeads = leads?.filter((lead: any) => lead.status === "new") || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agent Action Center</h1>
                <p className="text-muted-foreground">
                    Focus on what matters. Clear your follow-ups to hit your targets.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Overdue */}
                <Card className="border-destructive bg-destructive/5 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-destructive">Overdue Follow-ups</CardTitle>
                        <PhoneCall className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-destructive">{overdueLeads.length}</div>
                        <p className="text-xs text-destructive/80 mt-1">Requires immediate action</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {overdueLeads.slice(0, 3).map((lead: any) => (
                                <Link key={lead.id} href={`/leads/${lead.id}`}>
                                    <div className="flex justify-between items-center bg-background p-2 rounded border border-destructive/20 hover:bg-destructive/10 transition-colors">
                                        <span className="font-semibold text-sm truncate">{lead.name}</span>
                                        <span className="text-xs text-destructive">{format(new Date(lead.followUpAt), 'h:mm a')}</span>
                                    </div>
                                </Link>
                            ))}
                            {overdueLeads.length > 3 && (
                                <Link href="/leads?filter=overdue" className="text-xs text-center text-destructive hover:underline mt-1">View all {overdueLeads.length}</Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Today */}
                <Card className="border-amber-500/50 bg-amber-500/5 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-amber-600 dark:text-amber-500">Today's Tasks</CardTitle>
                        <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-500">{todayLeads.length}</div>
                        <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">Scheduled for today</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {todayLeads.slice(0, 3).map((lead: any) => (
                                <Link key={lead.id} href={`/leads/${lead.id}`}>
                                    <div className="flex justify-between items-center bg-background p-2 rounded border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                                        <span className="font-semibold text-sm truncate">{lead.name}</span>
                                        <span className="text-xs text-amber-600 dark:text-amber-500">{format(new Date(lead.followUpAt), 'h:mm a')}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* New */}
                <Card className="border-emerald-500/50 bg-emerald-500/5 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-500">New Leads</CardTitle>
                        <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{newLeads.length}</div>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">Pending first contact</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {newLeads.slice(0, 3).map((lead: any) => (
                                <Link key={lead.id} href={`/leads/${lead.id}`}>
                                    <div className="flex justify-between items-center bg-background p-2 rounded border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                                        <span className="font-semibold text-sm truncate">{lead.name}</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-500">{format(new Date(lead.createdAt), 'h:mm a')}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button asChild size="lg" className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground font-bold">
                    <Link href="/leads">Go to All Leads</Link>
                </Button>
            </div>
        </div>
    )
}
