"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Building2, Globe, MapPin, CheckCircle2, Layout, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Builder } from "@/types/builder"
import { cn } from "@/lib/utils"

interface BuilderCardProps {
    builder: Builder
    variant?: "grid" | "list"
}

export function BuilderCard({ builder, variant = "grid" }: BuilderCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/builders/${builder.id}`)
    }

    if (variant === "list") {
        return (
            <Card
                className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer rounded-2xl border border-border bg-card mb-4"
                onClick={handleClick}
            >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 items-center">
                    <div className="md:col-span-1 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border">
                            {builder.logo ? (
                                <Image src={builder.logo} alt={builder.name} width={64} height={64} className="object-cover" />
                            ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-4 flex flex-col min-w-0">
                        <h4 className="font-bold text-foreground text-lg tracking-tight">{builder.name}</h4>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{builder.headquarters || "Not specified"}</span>
                        </div>
                    </div>
                    <div className="md:col-span-5 flex items-center justify-around w-full">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                            <span className="text-sm font-bold">{builder.totalProjects}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ongoing</span>
                            <span className="text-sm font-bold text-realty-gold">{builder.ongoingProjects}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Completed</span>
                            <span className="text-sm font-bold text-teal-500">{builder.completedProjects}</span>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-xl">View Details</Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card
            className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer rounded-2xl border border-border bg-card h-full flex flex-col"
            onClick={handleClick}
        >
            <CardContent className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border shadow-sm">
                        {builder.logo ? (
                            <Image src={builder.logo} alt={builder.name} width={64} height={64} className="object-cover" />
                        ) : (
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                    {builder.ongoingProjects > 0 && (
                        <Badge className="bg-realty-gold/10 text-realty-gold border-realty-gold/20 hover:bg-realty-gold/20">
                            Active Projects
                        </Badge>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight line-clamp-1">{builder.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                        {builder.description || "Leading real estate developer with a focus on quality and innovation."}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-accent/50 rounded-xl p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total</p>
                        <p className="text-sm font-bold">{builder.totalProjects}</p>
                    </div>
                    <div className="bg-realty-gold/10 rounded-xl p-2 text-center">
                        <p className="text-[10px] text-realty-gold uppercase font-semibold">Live</p>
                        <p className="text-sm font-bold">{builder.ongoingProjects}</p>
                    </div>
                    <div className="bg-teal-500/10 rounded-xl p-2 text-center">
                        <p className="text-[10px] text-teal-600 uppercase font-semibold">Done</p>
                        <p className="text-sm font-bold">{builder.completedProjects}</p>
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="truncate">{builder.website || "No website"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Founded: {builder.foundedYear || "N/A"}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-accent/20 border-t border-border/50">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-10">
                    View Portfolio
                </Button>
            </CardFooter>
        </Card>
    )
}
