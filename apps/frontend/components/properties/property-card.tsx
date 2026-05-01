"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Bed, Bath, Ruler, Eye, Camera, Map } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Property } from "@/types/property"
import { cn } from "@/lib/utils"
import { useToggleFavorite } from "@/hooks/use-properties"

function parsePropertyImages(images: string[] | string | undefined): string[] {
    const FALLBACK = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.photo/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6eb56a0c?w=800',
    ]
    
    if (!images) return FALLBACK
    if (Array.isArray(images)) {
        const valid = images.filter(Boolean)
        return valid.length > 0 ? valid : FALLBACK
    }
    
    if (typeof images === 'string') {
        let cleaned = images.trim()
        
        // Try direct parse (normal JSON array)
        try {
            let parsed = JSON.parse(cleaned)
            if (Array.isArray(parsed)) {
                const valid = parsed.filter(Boolean)
                if (valid.length > 0) return valid
            } else if (typeof parsed === 'string') {
                // Try parsing the inner string (double-encoded)
                try {
                    parsed = JSON.parse(parsed)
                    if (Array.isArray(parsed)) {
                        const valid = parsed.filter(Boolean)
                        if (valid.length > 0) return valid
                    }
                } catch {}
            }
        } catch {}
        
        // Try comma--separated format (TypeORM simple-array)
        if (cleaned.includes(',"') || cleaned.includes('",') || cleaned.includes(',')) {
            const parts = cleaned.split(',')
            const valid = parts.map(s => {
                s = s.trim()
                if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1)
                if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1)
                return s.replace(/\\"/g, '"').replace(/^"|"$/g, '')
            }).filter(Boolean)
            if (valid.length > 0) return valid
        }
        
        return cleaned ? [cleaned] : FALLBACK
    }
    
    return FALLBACK
}

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

    const propertyImages = parsePropertyImages(property.images)
    const isCompact = variant === "compact"
    const isList = variant === "list"

    if (isList) {
        return (
            <Card
                className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer rounded-2xl border border-border bg-card mb-4"
                onClick={handleClick}
            >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 p-3 items-center">
                    {/* Column 1: Image & Basic Info (5 cols) */}
                    <div className="md:col-span-5 flex items-center gap-4 w-full">
                        <div className="relative h-24 w-32 min-w-[128px] rounded-xl overflow-hidden bg-muted shadow-sm">
                            {propertyImages && propertyImages.length > 0 && propertyImages[0] ? (
                                propertyImages[0] && propertyImages[0].startsWith('http') ? (
                                    <Image
                                        src={propertyImages[0]}
                                        alt={property.title}
                                        fill
                                        sizes="128px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                        <span className="text-muted-foreground text-[10px]">No Image</span>
                                    </div>
                                )
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                    <span className="text-muted-foreground text-[10px]">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                                <Camera className="h-2.5 w-2.5" />
                                <span>{propertyImages?.length || 0}</span>
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h4 className="font-semibold text-foreground truncate text-base tracking-tight">{property.title}</h4>
                            <p className="text-muted-foreground text-xs truncate mt-0.5 tracking-tight">
                                {property.address}, {property.city}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    property.status === 'available' ? "bg-realty-gold" : "bg-muted-foreground/30"
                                )} />
                                <span className="text-[10px] font-bold text-realty-gold uppercase tracking-wider">
                                    For {property.status === 'available' ? 'sale' : property.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Price (2 cols) */}
                    <div className="md:col-span-2 flex flex-col justify-center w-full md:border-l md:pl-6 border-border">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Price</span>
                        <h3 className="text-xl font-bold text-foreground tabular-nums mt-1 tracking-tight">
                            {formattedPrice}
                        </h3>
                    </div>

                    {/* Column 3: Specs (3 cols) */}
                    <div className="md:col-span-3 flex items-center gap-6 w-full md:border-l md:pl-6 border-border">
                        {property.bedrooms && (
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Beds</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-bold text-foreground tracking-tight">{property.bedrooms}</span>
                                </div>
                            </div>
                        )}
                        {property.bathrooms && (
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Baths</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-bold text-foreground tracking-tight">{property.bathrooms}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sqft</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-bold text-foreground tracking-tight">{property.sqft.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Actions (2 cols) */}
                    <div className="md:col-span-2 flex items-center justify-end gap-3 w-full">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <Map className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-xl border-border transition-all",
                                property.favorited ? "text-realty-gold bg-realty-gold/10 border-realty-gold/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite.mutate(property.id)
                            }}
                        >
                            <Heart className={cn("h-4 w-4", property.favorited && "fill-current")} />
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                "group overflow-hidden hover:shadow-xl transition-all cursor-pointer rounded-[2rem] border border-border bg-card",
                isCompact ? "text-sm" : ""
            )}
            onClick={handleClick}
        >
            {/* Image Section */}
            <div className={cn("relative overflow-hidden", isCompact ? "aspect-square" : "aspect-[4/3]")}>
                {propertyImages && propertyImages.length > 0 && propertyImages[0] ? (
                    propertyImages[0] && propertyImages[0].startsWith('http') ? (
                        <Image
                            src={propertyImages[0]}
                            alt={property.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                    )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                )}
                
                {/* Photo Count Badge */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium">
                    <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>{propertyImages?.length || 0}</span>
                </div>

            </div>

            {/* Details Section */}
            <CardContent className={cn("p-3 sm:p-4 md:p-5 pt-3 sm:pt-4 space-y-2 sm:space-y-3", isCompact ? "p-2 sm:p-3" : "")}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            property.status === 'available' ? "bg-realty-gold" : "bg-muted-foreground/30"
                        )} />
                        <span className="text-xs sm:text-sm font-semibold text-realty-gold capitalize">
                            For {property.status === 'available' ? 'sale' : property.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Handle map click
                            }}
                        >
                            <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border transition-colors",
                                property.favorited ? "text-realty-gold bg-realty-gold/10 border-realty-gold/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite.mutate(property.id)
                            }}
                        >
                            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className={cn("font-bold text-foreground tabular-nums tracking-tight", isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl md:text-2xl")}>
                        {formattedPrice}
                    </h3>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground text-xs sm:text-sm">
                    {property.bedrooms && (
                        <div className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-medium"><span className="font-bold text-foreground">{property.bedrooms}</span> bed</span>
                        </div>
                    )}
                    {property.bathrooms && (
                        <div className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-medium"><span className="font-bold text-foreground">{property.bathrooms}</span> bath</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium"><span className="font-bold text-foreground">{property.sqft.toLocaleString()}</span> sqft</span>
                    </div>
                </div>

                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>


            </CardContent>
        </Card>
    )
}