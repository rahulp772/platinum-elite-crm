import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface FunnelStage {
    name: string
    count: number
    color: string
}

const stages: FunnelStage[] = [
    { name: "New", count: 45, color: "bg-realty-navy-light" },
    { name: "Contacted", count: 32, color: "bg-indigo-600" },
    { name: "Qualified", count: 18, color: "bg-teal-600" },
    { name: "Won", count: 12, color: "bg-realty-gold" },
]

export function LeadFunnelWidget() {
    const total = stages.reduce((sum, stage) => sum + stage.count, 0)

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Lead Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {stages.map((stage, index) => {
                    const percentage = (stage.count / total) * 100

                    return (
                        <div key={stage.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                                    <span className="text-sm font-medium">{stage.name}</span>
                                </div>
                                <Badge variant="secondary" className="tabular-nums">
                                    {stage.count}
                                </Badge>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
