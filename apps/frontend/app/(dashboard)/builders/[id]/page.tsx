"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { 
    Building2, 
    Globe, 
    MapPin, 
    Calendar, 
    ChevronLeft, 
    ExternalLink,
    Mail,
    Phone,
    Users,
    LayoutGrid,
    List,
    TrendingUp,
    CheckCircle2,
    Clock,
    Plus,
    Search
} from "lucide-react"
import { useBuilder } from "@/hooks/use-builders"
import { useProperties } from "@/hooks/use-properties"
import { useLeads } from "@/hooks/use-leads"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyCard } from "@/components/properties/property-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

export default function BuilderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [propertyView, setPropertyView] = React.useState<"grid" | "list">("grid")

    const { data: builder, isLoading: isBuilderLoading } = useBuilder(id)

    const { data: propertiesData, isLoading: isPropertiesLoading } = useProperties({ builderId: id, limit: 100 })
    const { data: leadsData, isLoading: isLeadsLoading } = useLeads({ builderId: id, limit: 100 })

    if (isBuilderLoading) {
        return <BuilderDetailSkeleton />
    }

    if (!builder) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Builder Not Found</h2>
                <Button onClick={() => router.push("/builders")}>Back to Builders</Button>
            </div>
        )
    }

    const properties = propertiesData?.data || []
    const leads = leadsData?.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => router.push("/builders")}
                    className="group rounded-xl pl-2"
                >
                    <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Builders
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl">Edit Details</Button>
                    <Button className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light font-bold rounded-xl shadow-lg shadow-realty-gold/20">
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Builder Profile Header */}
            <div className="relative overflow-hidden rounded-[32px] bg-card border border-border/50 shadow-sm">
                <div className="h-32 bg-realty-navy/5" />
                <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row gap-8 items-end">
                    <div className="relative h-32 w-32 rounded-3xl overflow-hidden bg-card border-4 border-background shadow-xl flex items-center justify-center shrink-0">
                        {builder.logo ? (
                            <Image src={builder.logo} alt={builder.name} fill className="object-cover" />
                        ) : (
                            <Building2 className="h-12 w-12 text-realty-gold" />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight text-foreground">{builder.name}</h1>
                            <Badge className="bg-realty-gold/10 text-realty-gold border-realty-gold/20 hover:bg-realty-gold/20 rounded-lg px-3 py-1">
                                Verified Developer
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{builder.headquarters || "Global Headquarters"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <a href={builder.website} target="_blank" rel="noopener noreferrer" className="hover:text-realty-gold flex items-center gap-1">
                                    {builder.website?.replace(/^https?:\/\//, '') || "No website"}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Founded {builder.foundedYear || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Portfolio Value", value: "₹450 Cr+", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Ongoing Projects", value: builder.ongoingProjects || "12", icon: Clock, color: "text-realty-gold", bg: "bg-realty-gold/10" },
                    { label: "Completed Projects", value: builder.completedProjects || "45", icon: CheckCircle2, color: "text-teal-500", bg: "bg-teal-500/10" },
                    { label: "Total Units", value: "2,500+", icon: LayoutGrid, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 border border-border/50">
                        <TabsTrigger value="about" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            About Developer
                        </TabsTrigger>
                        <TabsTrigger value="properties" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            Project Portfolio ({properties.length})
                        </TabsTrigger>
                        <TabsTrigger value="leads" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            Interested Leads ({leads.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                placeholder="Filter current view..." 
                                className="pl-10 h-10 w-64 rounded-xl border border-border bg-card/50 text-sm focus:outline-none focus:ring-2 focus:ring-realty-gold/50"
                            />
                        </div>
                    </div>
                </div>

                <TabsContent value="about">
                    <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black tracking-tight">Developer Overview</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {builder.description || "Leading real estate developer with a commitment to excellence and innovation."}
                                    </p>
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50">
                                            <Mail className="h-5 w-5 text-realty-gold" />
                                            <span className="font-medium">contact@{builder.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50">
                                            <Phone className="h-5 w-5 text-realty-gold" />
                                            <span className="font-medium">+91 80 1234 5678</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black tracking-tight">Key Portfolio Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Presence</p>
                                            <p className="text-lg font-bold mt-1">12 Major Cities</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Awards</p>
                                            <p className="text-lg font-bold mt-1">25+ Design Awards</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Customers</p>
                                            <p className="text-lg font-bold mt-1">15,000+ Happy Families</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Sustainability</p>
                                            <p className="text-lg font-bold mt-1">LEED Certified</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="properties" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight">Portfolio Listings</h3>
                        <div className="flex items-center border rounded-xl p-1 bg-muted/50">
                            <Button 
                                variant={propertyView === "grid" ? "secondary" : "ghost"} 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg"
                                onClick={() => setPropertyView("grid")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant={propertyView === "list" ? "secondary" : "ghost"} 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg"
                                onClick={() => setPropertyView("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {properties.length > 0 ? (
                        <div className={
                            propertyView === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "flex flex-col gap-4"
                        }>
                            {properties.map(property => (
                                <PropertyCard key={property.id} property={property} variant={propertyView} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[30vh] border-2 border-dashed rounded-[32px] gap-4 bg-muted/10 border-muted-foreground/20">
                            <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                            <p className="text-lg font-bold text-muted-foreground">No projects listed for this builder yet.</p>
                            <Button variant="outline" className="rounded-xl">Add Project</Button>
                        </div>
                    )}
                </TabsContent>
                
                <TabsContent value="leads" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Interested Leads</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 italic">Note: Visibility is restricted based on your role hierarchy.</p>
                        </div>
                    </div>
                    {leads.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {leads.map(lead => (
                                <Card key={lead.id} className="rounded-2xl border-border/50 hover:border-realty-gold/30 hover:shadow-md transition-all cursor-pointer bg-card/50">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="h-10 w-10 rounded-xl border border-border shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.email}`} />
                                            <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground truncate text-sm">{lead.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 border-realty-gold/20 text-realty-gold">{lead.status}</Badge>
                                                <span className="truncate">{lead.phone || lead.email}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[30vh] border-2 border-dashed rounded-[32px] gap-4 bg-muted/10 border-muted-foreground/20">
                            <Users className="h-10 w-10 text-muted-foreground" />
                            <p className="text-lg font-bold text-muted-foreground">No leads specifically interested in this developer.</p>
                        </div>
                    )}
                </TabsContent>

            </Tabs>

        </div>
    )
}

function BuilderDetailSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>
            <Skeleton className="h-64 w-full rounded-[32px]" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-3xl" />)}
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
        </div>
    )
}
