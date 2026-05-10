"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
    ArrowLeft, Heart, Share2, Phone, Mail, 
    Bed, Bath, Ruler, Home, MapPin, Eye, Clock,
    Edit, Star, Building, MessageCircle, ChevronLeft, ChevronRight, X
} from "lucide-react"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Property, PropertyStatus, PropertyType } from "@/types/property"
import { cn } from "@/lib/utils"
import { PropertyCard } from "@/components/properties/property-card"
import { useProperty, useRelatedProperties, useToggleFavorite } from "@/hooks/use-properties"
import { useAuth } from "@/lib/auth-context"
import { formatDateOnly, getUserTimezone } from "@/lib/date-utils"

const statusColors: Record<PropertyStatus, string> = {
    available: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    pending: "bg-realty-gold/20 text-realty-gold-dark border-realty-gold/30",
    sold: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    off_market: "bg-rose-500/10 text-rose-700 border-rose-500/20",
}

function parseImages(images: string[] | string | undefined): string[] {
    const FALLBACK = [
        'https://images.unsafe-splash.com/photo-15-60448-204-e02f11c3d0e2?w=800',
        'https://images.unsafe-splash.com/photo-16-00-60-76879-39-ce8a6c25-118c?w=800',
        'https://images.unsafe-splash.com/photo-16-00-585-15-43-40-be6-eb56a0c?w=800',
    ]
    
    if (!images) return FALLBACK
    if (Array.isArray(images)) {
        const valid = images.filter(Boolean)
        return valid.length > 0 ? valid : FALLBACK
    }
    
    if (typeof images === 'string') {
        let cleaned = images.trim()
        
        try {
            let parsed = JSON.parse(cleaned)
            if (Array.isArray(parsed)) {
                const valid = parsed.filter(Boolean)
                if (valid.length > 0) return valid
            } else if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed)
                    if (Array.isArray(parsed)) {
                        const valid = parsed.filter(Boolean)
                        if (valid.length > 0) return valid
                    }
                } catch {}
            }
        } catch {}
        
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

const statusLabels: Record<PropertyStatus, string> = {
    available: "Available",
    pending: "Pending",
    sold: "Sold",
    off_market: "Off Market",
}

const typeLabels: Record<PropertyType, string> = {
    apartment: "Apartment",
    house: "House",
    condo: "Condo",
    townhouse: "Townhouse",
    commercial: "Commercial",
    land: "Land",
}

export default function PropertyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const propertyId = params.id as string
    
    const { data: property, isLoading, isError } = useProperty(propertyId)
    const { data: relatedProperties = [] } = useRelatedProperties(propertyId)
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const toggleFavorite = useToggleFavorite()
    const { user } = useAuth()
    const timezone = getUserTimezone(user)

    const parsedImages = React.useMemo(() => parseImages(property?.images), [property?.images])
    const firstImage = parsedImages.length > 0 && parsedImages[0]?.startsWith('http') ? parsedImages[0] : null

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index)
        setLightboxOpen(true)
    }

    const nextImage = () => {
        if (!property) return
        setCurrentImageIndex((prev) => (prev + 1) % parsedImages.length)
    }

    const prevImage = () => {
        if (!property) return
        setCurrentImageIndex((prev) => (prev - 1 + parsedImages.length) % parsedImages.length)
    }

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
            if (e.key === "Escape") setLightboxOpen(false)
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [lightboxOpen])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (date: Date | string) => {
        return formatDateOnly(date, timezone)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (isError || !property) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The property you're looking for doesn't exist.
                    </p>
                    <Button onClick={() => router.push("/properties")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Properties
                    </Button>
                </div>
            </div>
        )
    }

    const rating = property.rating || 0

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => router.push("/properties")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/properties" className="hover:text-foreground">Properties</Link>
                <span>/</span>
                <span className="text-foreground">{property.title}</span>
            </div>

            {/* Image Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6 h-[400px]">
                <div 
                    className="md:col-span-2 md:row-span-2 relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => firstImage ? openLightbox(0) : undefined}
                >
                    {firstImage ? (
                        <Image
                            src={firstImage}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                <div 
                    className="hidden md:block relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => firstImage ? openLightbox(1) : undefined}
                >
                    {firstImage && parsedImages[1] ? (
                        <Image
                            src={parsedImages[1]}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : firstImage ? (
                        <Image
                            src={firstImage}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                <div 
                    className="hidden md:block relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => firstImage ? openLightbox(2) : undefined}
                >
                    {firstImage && parsedImages[2] ? (
                        <Image
                            src={parsedImages[2]}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : firstImage ? (
                        <Image
                            src={firstImage}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                    {parsedImages.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/40">
                            <span className="text-white font-semibold">+{parsedImages.length - 3} photos</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-black flex flex-col items-center justify-between overflow-hidden shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Image Gallery</DialogTitle>
                        <DialogDescription>Viewing property images for {property.title}</DialogDescription>
                    </DialogHeader>
                    
                    {/* Top Bar / Close Button area */}
                    <div className="absolute top-4 right-4 z-[60]">
                        <button 
                            onClick={() => setLightboxOpen(false)}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all group"
                        >
                            <X className="h-8 w-8 transition-transform group-hover:rotate-90" />
                        </button>
                    </div>

                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Main Interaction Area: Image + Arrows */}
                        <div className="relative w-full flex-1 flex items-center justify-center p-4">
                            {/* Navigation Buttons - Far Left/Right */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-6 z-50 p-4 text-white/50 hover:text-white transition-all transform active:scale-95 group"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-10 w-10 md:h-12 md:w-12 stroke-[1.5px]" />
                            </button>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-6 z-50 p-4 text-white/50 hover:text-white transition-all transform active:scale-95 group"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-10 w-10 md:h-12 md:w-12 stroke-[1.5px]" />
                            </button>

                            {/* Main Image Container */}
                            <div className="relative w-full h-[70vh] flex flex-col items-center justify-center">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={parsedImages[currentImageIndex]}
                                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                    
                                    {/* Text Overlay (matching screenshot style) */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white space-y-1">
                                        <p className="text-sm font-medium drop-shadow-md opacity-90">
                                            Property Image {currentImageIndex + 1}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest opacity-60 drop-shadow-sm">
                                            {property.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Tray - Bottom */}
                        <div className="w-full bg-black/40 backdrop-blur-md border-t border-white/10 p-4">
                            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-5xl mx-auto">
                                {parsedImages.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded overflow-hidden transition-all duration-200 border-2",
                                            currentImageIndex === idx 
                                                ? "border-realty-gold scale-105 shadow-[0_0_15px_rgba(197,160,89,0.3)] z-10" 
                                                : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <span className="sr-only">Select image {idx + 1}</span>
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Property Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-3xl font-bold tracking-tight">{formatPrice(property.price)}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={cn(statusColors[property.status])}>
                                    {statusLabels[property.status]}
                                </Badge>
                                <Badge variant="secondary">
                                    {typeLabels[property.type]}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Key Features */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {property.type !== 'land' && property.bedrooms && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Bed className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.bedrooms}</p>
                                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                                    </div>
                                )}
                                {property.type !== 'land' && property.bathrooms && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Bath className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.bathrooms}</p>
                                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                                    </div>
                                )}
                                <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                    <Ruler className="h-5 w-5 mb-2 text-muted-foreground" />
                                    <p className="text-xl font-semibold">{property.sqft.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{property.type === 'land' ? 'Plot Size (sqft)' : 'Sq Ft'}</p>
                                </div>
                                {property.type !== 'land' && property.yearBuilt && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Home className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.yearBuilt}</p>
                                        <p className="text-xs text-muted-foreground">Year Built</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Details */}
                    {(property.basePrice || property.pricePerSqft || property.bookingAmount || property.paymentPlan || property.plc || property.gst || property.parking) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Financial Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {property.basePrice && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold text-realty-gold">{formatPrice(property.basePrice)}</p>
                                            <p className="text-xs text-muted-foreground">Base Price</p>
                                        </div>
                                    )}
                                    {property.pricePerSqft && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold">₹{property.pricePerSqft.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Price / sqft</p>
                                        </div>
                                    )}
                                    {property.bookingAmount && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold">{formatPrice(property.bookingAmount)}</p>
                                            <p className="text-xs text-muted-foreground">Booking Amount</p>
                                        </div>
                                    )}
                                    {property.plc && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold">{formatPrice(property.plc)}</p>
                                            <p className="text-xs text-muted-foreground">PLC</p>
                                        </div>
                                    )}
                                    {property.gst && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold">{property.gst}%</p>
                                            <p className="text-xs text-muted-foreground">GST</p>
                                        </div>
                                    )}
                                    {property.parking && (
                                        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                            <p className="text-xl font-semibold">{property.parking}</p>
                                            <p className="text-xs text-muted-foreground">Parking</p>
                                        </div>
                                    )}
                                </div>
                                {property.paymentPlan && (
                                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Payment Plan</p>
                                        <p className="font-medium">{property.paymentPlan}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Property Specifications */}
                    {(property.carpetArea || property.builtUpArea || property.superBuiltUpArea || property.mlsId || property.launchDate) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Property Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {property.carpetArea && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Carpet Area</span>
                                            <span className="font-medium">{property.carpetArea.toLocaleString()} sqft</span>
                                        </div>
                                    )}
                                    {property.builtUpArea && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Built-up Area</span>
                                            <span className="font-medium">{property.builtUpArea.toLocaleString()} sqft</span>
                                        </div>
                                    )}
                                    {property.superBuiltUpArea && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Super Built-up Area</span>
                                            <span className="font-medium">{property.superBuiltUpArea.toLocaleString()} sqft</span>
                                        </div>
                                    )}
                                    {property.mlsId && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">MLS ID</span>
                                            <span className="font-medium">{property.mlsId}</span>
                                        </div>
                                    )}
                                    {property.launchDate && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Launch Date</span>
                                            <span className="font-medium">{formatDate(property.launchDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Project Details */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Project Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium">{statusLabels[property.status]}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Location</span>
                                    <span className="font-medium">{property.city}, {property.state}</span>
                                </div>
                                {property.reraNumber && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">RERA ID</span>
                                        <span className="font-medium text-realty-gold">{property.reraNumber}</span>
                                    </div>
                                )}
                                {property.dtcpApproval && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Approval</span>
                                        <span className="font-medium">{property.dtcpApproval}</span>
                                    </div>
                                )}
                                {property.totalLandArea && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Total Land Area</span>
                                        <span className="font-medium">{property.totalLandArea} Acres</span>
                                    </div>
                                )}
                                {property.unitCount && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Total Units</span>
                                        <span className="font-medium">{property.unitCount} Plots</span>
                                    </div>
                                )}
                                {(property.minPlotSize || property.maxPlotSize) && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Plot Sizes</span>
                                        <span className="font-medium">
                                            {property.minPlotSize?.toLocaleString()}{property.minPlotSize && property.maxPlotSize ? ' - ' : ''}{property.maxPlotSize?.toLocaleString()} sqft
                                        </span>
                                    </div>
                                )}
                                {property.ratePerSqft && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Rate per Sq.Ft</span>
                                        <span className="font-medium">₹{property.ratePerSqft.toLocaleString()}</span>
                                    </div>
                                )}
                                {property.constructionStatus && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Construction</span>
                                        <span className="font-medium">{property.constructionStatus}</span>
                                    </div>
                                )}
                                {property.reraWebsite && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">RERA Website</span>
                                        <a 
                                            href={property.reraWebsite.startsWith('http') ? property.reraWebsite : `https://${property.reraWebsite}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-realty-gold hover:underline"
                                        >
                                            View Registration
                                        </a>
                                    </div>
                                )}
                                {property.ccUrl && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">CC Certificate</span>
                                        <a 
                                            href={property.ccUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-realty-gold hover:underline"
                                        >
                                            View Certificate
                                        </a>
                                    </div>
                                )}
                                {property.ocUrl && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">OC Certificate</span>
                                        <a 
                                            href={property.ocUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-realty-gold hover:underline"
                                        >
                                            View Certificate
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {property.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {property.features.map((feature, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Floor Plans */}
                    {property.floorPlans && property.floorPlans.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Floor Plans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 font-medium">Plot Size</th>
                                                <th className="text-right py-2 font-medium">Price</th>
                                                {property.floorPlans[0]?.planImage && (
                                                    <th className="text-center py-2 font-medium">Plan</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {property.floorPlans.map((fp, idx) => (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="py-3">{fp.plotSize?.toLocaleString()} sqft{fp.label && <span className="text-muted-foreground ml-1">({fp.label})</span>}</td>
                                                    <td className="text-right py-3 font-medium text-realty-gold">{formatPrice(fp.price || 0)}</td>
                                                    {fp.planImage && (
                                                        <td className="py-3 text-center">
                                                            <Image 
                                                                src={fp.planImage} 
                                                                alt={`Floor plan ${idx + 1}`}
                                                                width={60}
                                                                height={40}
                                                                className="rounded object-cover inline-block"
                                                            />
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Nearby Infrastructure */}
                    {property.nearbyInfrastructures && property.nearbyInfrastructures.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Nearby Infrastructure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['school', 'hospital', 'transit', 'restaurant', 'resort', 'shopping', 'other'].map(category => {
                                        const items = property.nearbyInfrastructures?.filter(ni => ni.category === category) || []
                                        if (items.length === 0) return null
                                        return (
                                            <div key={category}>
                                                <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">{category}</h4>
                                                <div className="space-y-1">
                                                    {items.map((ni, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span>{ni.name}</span>
                                                            <span className="text-muted-foreground">{ni.distance}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Builder Card */}
                    {property.builder && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Builder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {property.builder.logo ? (
                                        <Image 
                                            src={property.builder.logo} 
                                            alt={property.builder.name}
                                            width={48}
                                            height={48}
                                            className="rounded-lg object-cover"
                                        />
                                    ) : (
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-realty-gold text-realty-navy">
                                                {property.builder.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div>
                                        <p className="font-semibold">{property.builder.name}</p>
                                        <p className="text-xs text-muted-foreground">Project Developer</p>
                                    </div>
                                </div>
                                {property.builder.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {property.builder.description}
                                    </p>
                                )}
                                {property.builder.website && (
                                    <Button variant="outline" className="w-full h-8" size="sm" asChild>
                                        <a href={property.builder.website} target="_blank" rel="noopener noreferrer">
                                            View Website
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Agent Contact Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Listed By</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Indica" />
                                    <AvatarFallback>IW</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{property.agent?.name || "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground">Listing Agent</p>
                                </div>
                            </div>
                            
                            {property.agent?.phone && (
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <Phone className="mr-2 h-3 w-3" />
                                    {property.agent.phone}
                                </Button>
                            )}
                            {property.agent?.whatsapp && (
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <MessageCircle className="mr-2 h-3 w-3" />
                                    {property.agent.whatsapp}
                                </Button>
                            )}
                            {property.agent?.email && (
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <Mail className="mr-2 h-3 w-3" />
                                    Send Email
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Property Stats */}
                    <Card>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Eye className="h-3 w-3" />
                                    <span>Views</span>
                                </div>
                                <span className="font-medium">{property.views}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Listed</span>
                                </div>
                                <span className="font-medium">{formatDate(property.listed)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <Button variant="ghost" size="sm" className="h-8" onClick={() => toggleFavorite.mutate(propertyId)}>
                                    <Heart className={cn("mr-1 h-3 w-3", property?.favorited && "fill-current text-rose-500")} />
                                    <span className="text-xs">{property?.favorited ? "Saved" : "Save"}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8">
                                    <Share2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Related Properties */}
            {relatedProperties.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-semibold tracking-tight mb-6">Related Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedProperties.map(relatedProperty => (
                            <PropertyCard
                                key={relatedProperty.id}
                                property={relatedProperty}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}