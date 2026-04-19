import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Deal {
    id: string
    title: string
    value: number
    probability: number
    client: string
    stage: string
}

const deals: Deal[] = [
    {
        id: "1",
        title: "Downtown Apartment",
        value: 450000,
        probability: 85,
        client: "Sarah Johnson",
        stage: "Negotiation",
    },
    {
        id: "2",
        title: "Suburban House",
        value: 650000,
        probability: 70,
        client: "Michael Chen",
        stage: "Proposal",
    },
    {
        id: "3",
        title: "Commercial Space",
        value: 1200000,
        probability: 60,
        client: "Tech Startup Inc.",
        stage: "Discussion",
    },
]

export function ActiveDealsWidget() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Active Deals</CardTitle>
                <Link href="/deals">
                    <Button variant="ghost" size="sm">
                        View All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {deals.map((deal) => (
                    <div
                        key={deal.id}
                        className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{deal.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                    {deal.stage}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{deal.client}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg font-bold tabular-nums">
                                    ${(deal.value / 1000).toFixed(0)}k
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-realty-gold" />
                                    {deal.probability}% probability
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
