"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Bed, Bath, Ruler, Eye } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Property } from "@/types/property"
import { cn } from "@/lib/utils"
import { useToggleFavorite } from "@/hooks/use-properties"

const statusColors = {
    available: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    pending: "bg-realty-gold/20 text-realty-gold-dark border-realty-gold/30",
    sold: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    off_market: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
}

const statusLabels = {
    available: "Available",
    pending: "Pending",
    sold: "Sold",
    off_market: "Off Market",
}

type PropertyCardVariant = "grid" | "compact" | "list"

interface PropertyCardProps {
    property: Property
    onFavoriteToggle?: (id: string) => void
    onClick?: (property: Property) => void
    variant?: PropertyCardVariant
}

export function PropertyCard({ property, onFavoriteToggle, onClick, variant = "grid" }: PropertyCardProps) {
    const router = useRouter()
    const toggleFavorite = useToggleFavorite()
    
    const handleClick = () => {
        if (onClick) {
            onClick(property)
        } else {
            router.push(`/properties/${property.id}`)
        }
    }
    
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(property.price)

    const isCompact = variant === "compact"
    const isList = variant === "list"

    if (isList) {
        return (
            <Card
                className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer flex"
                onClick={handleClick}
            >
                <div className="relative w-48 min-w-48 aspect-square sm:aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                            property.favorited && "text-rose-500"
                        )}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite.mutate(property.id)
                        }}
                    >
                        <Heart className={cn("h-3 w-3", property.favorited && "fill-current")} />
                    </Button>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold tabular-nums">{formattedPrice}</h3>
                                <h4 className="font-semibold text-base line-clamp-1">{property.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {property.address}, {property.city}, {property.state}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{property.views}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                            {property.bedrooms && (
                                <div className="flex items-center gap-1">
                                    <Bed className="h-3 w-3 text-muted-foreground" />
                                    <span>{property.bedrooms} bd</span>
                                </div>
                            )}
                            {property.bathrooms && (
                                <div className="flex items-center gap-1">
                                    <Bath className="h-3 w-3 text-muted-foreground" />
                                    <span>{property.bathrooms} ba</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Ruler className="h-3 w-3 text-muted-foreground" />
                                <span>{property.sqft.toLocaleString()} sqft</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs font-medium", statusColors[property.status])}>
                                {statusLabels[property.status]}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-xs">
                                {property.type}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                "group overflow-hidden hover:shadow-lg transition-all cursor-pointer",
                isCompact ? "text-sm" : ""
            )}
            onClick={handleClick}
        >
            <div className={cn("relative overflow-hidden bg-muted", isCompact ? "aspect-square" : "aspect-[4/3]")}>
                <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
                <div className={cn("absolute flex gap-1", isCompact ? "top-2 left-2" : "top-3 left-3")}>
                    <Badge
                        variant="outline"
                        className={cn("font-medium", statusColors[property.status], isCompact && "text-[10px] px-1")}
                    >
                        {statusLabels[property.status]}
                    </Badge>
                    <Badge variant="secondary" className={cn("capitalize", isCompact && "text-[10px] px-1")}>
                        {property.type}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                        property.favorited && "text-rose-500",
                        isCompact ? "top-2 right-2 h-6 w-6" : "top-3 right-3 h-8 w-8"
                    )}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite.mutate(property.id)
                    }}
                >
                    <Heart className={cn(isCompact ? "h-3 w-3" : "h-4 w-4", property.favorited && "fill-current")} />
                </Button>
            </div>

            <CardContent className={cn("space-y-2", isCompact ? "p-3" : "p-4")}>
                <div className="flex items-baseline justify-between">
                    <h3 className={cn("font-bold tabular-nums", isCompact ? "text-base" : "text-2xl")}>{formattedPrice}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className={cn("h-3 w-3", isCompact && "h-2 w-2")} />
                        <span>{property.views}</span>
                    </div>
                </div>

                <h4 className={cn("font-semibold line-clamp-1", isCompact ? "text-sm" : "text-lg")}>{property.title}</h4>

                <p className="text-sm text-muted-foreground line-clamp-1">
                    {property.address}, {property.city}, {property.state}
                </p>

                <div className={cn("flex items-center gap-3 text-sm", isCompact ? "gap-2 text-xs" : "gap-4")}>
                    {property.bedrooms && (
                        <div className="flex items-center gap-1">
                            <Bed className={cn("text-muted-foreground", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                            <span>{property.bedrooms} bd</span>
                        </div>
                    )}
                    {property.bathrooms && (
                        <div className="flex items-center gap-1">
                            <Bath className={cn("text-muted-foreground", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                            <span>{property.bathrooms} ba</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Ruler className={cn("text-muted-foreground", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                        <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
            </CardContent>

            {!isCompact && (
                <CardFooter className="p-4 pt-0 border-t bg-muted/50">
                    <div className="flex items-center justify-between w-full text-sm">
                        <span className="text-muted-foreground">Listed by {property.agent?.name || "Unknown"}</span>
                        <span className="text-muted-foreground">
                            {new Date(property.listed).toLocaleDateString()}
                        </span>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}