"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentPerformance } from "@/types/analytics"

interface AgentLeaderboardProps {
    data: AgentPerformance[]
}

export function AgentLeaderboard({ data }: AgentLeaderboardProps) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {data.map((agent, index) => (
                        <div key={agent.id} className="flex items-center">
                            <div className="flex items-center gap-4 w-[40%]">
                                <span className="text-muted-foreground font-mono text-sm w-4">
                                    {index + 1}
                                </span>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={agent.avatar} alt={agent.name} />
                                    <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{agent.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {agent.deals} deals closed
                                    </p>
                                </div>
                            </div>
                            <div className="w-[30%] text-right">
                                <div className="text-sm font-bold">
                                    ${(agent.revenue / 1000000).toFixed(1)}M
                                </div>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                            </div>
                            <div className="w-[30%] text-right">
                                <div className="text-sm font-bold text-realty-gold">
                                    {agent.conversionRate}%
                                </div>
                                <p className="text-xs text-muted-foreground">Conversion</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
