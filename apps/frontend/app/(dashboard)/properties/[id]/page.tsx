"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
    ArrowLeft, Heart, Share2, Phone, Mail, Calendar, 
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockProperties } from "@/lib/mock-data/properties"
import { Property, PropertyStatus, PropertyType } from "@/types/property"
import { cn } from "@/lib/utils"
import { PropertyCard } from "@/components/properties/property-card"

const statusColors: Record<PropertyStatus, string> = {
    available: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    pending: "bg-realty-gold/20 text-realty-gold-dark border-realty-gold/30",
    sold: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    off_market: "bg-rose-500/10 text-rose-700 border-rose-500/20",
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
    
    const property = mockProperties.find(p => p.id === propertyId)
    const [isFavorite, setIsFavorite] = React.useState(property?.favorited || false)
    const [tourFullName, setTourFullName] = React.useState("")
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index)
        setLightboxOpen(true)
    }

    const nextImage = () => {
        if (!property) return
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }

    const prevImage = () => {
        if (!property) return
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
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

    const relatedProperties = mockProperties
        .filter(p => p.id !== propertyId && p.type === property?.type)
        .slice(0, 3)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    if (!property) {
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

    const mlsId = `MLS-${property.id.padStart(6, '0')}`
    const rating = 4.8
    const agentPhone = "(555) 123-4567"
    const agentWhatsApp = "+1 555-123-4567"
    const agentAddress = "123 Real Estate Blvd, New York, NY 10001"

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
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                </div>
                <div 
                    className="hidden md:block relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => openLightbox(1)}
                >
                    <Image
                        src={property.images[1] || property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div 
                    className="hidden md:block relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => openLightbox(2)}
                >
                    <Image
                        src={property.images[2] || property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {property.images.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/40">
                            <span className="text-white font-semibold">+{property.images.length - 3} photos</span>
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
                                        src={property.images[currentImageIndex]}
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
                                {property.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded overflow-hidden transition-all duration-200 border-2",
                                            currentImageIndex === idx 
                                                ? "border-rose-500 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10" 
                                                : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
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
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-medium">{rating}</span>
                                <span className="text-sm text-muted-foreground">(24 reviews)</span>
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
                                {property.bedrooms && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Bed className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.bedrooms}</p>
                                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Bath className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.bathrooms}</p>
                                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                                    </div>
                                )}
                                <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                    <Ruler className="h-5 w-5 mb-2 text-muted-foreground" />
                                    <p className="text-xl font-semibold">{property.sqft.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Sq Ft</p>
                                </div>
                                {property.yearBuilt && (
                                    <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                                        <Home className="h-5 w-5 mb-2 text-muted-foreground" />
                                        <p className="text-xl font-semibold">{property.yearBuilt}</p>
                                        <p className="text-xs text-muted-foreground">Year Built</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Areas & Lot */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Areas & Lot</CardTitle>
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
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Living Space</span>
                                    <span className="font-medium">{property.sqft.toLocaleString()} sqft</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">MLS ID</span>
                                    <span className="font-medium">{mlsId}</span>
                                </div>
                                {property.lotSize && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Lot Size</span>
                                        <span className="font-medium">{property.lotSize.toLocaleString()} sqft</span>
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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
                                    <p className="font-semibold">{property.agent}</p>
                                    <p className="text-xs text-muted-foreground">Listing Agent</p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">{agentAddress}</p>

                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <Phone className="mr-2 h-3 w-3" />
                                    {agentPhone}
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <MessageCircle className="mr-2 h-3 w-3" />
                                    {agentWhatsApp}
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-9" size="sm">
                                    <Mail className="mr-2 h-3 w-3" />
                                    Send Email
                                </Button>
                            </div>

                            <Button className="w-full h-9">
                                <Building className="mr-2 h-4 w-4" />
                                View My Property
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Schedule Tour */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Schedule Tour</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Schedule a tour to see this property in person.
                            </p>
                            
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="tour-property-id" className="text-xs">Property ID</Label>
                                    <Input 
                                        id="tour-property-id" 
                                        value={property.id}
                                        disabled
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tour-property-name" className="text-xs">Property Name</Label>
                                    <Input 
                                        id="tour-property-name" 
                                        value={property.title}
                                        disabled
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tour-full-name" className="text-xs">Full Name</Label>
                                    <Input 
                                        id="tour-full-name" 
                                        placeholder="Enter your full name"
                                        value={tourFullName}
                                        onChange={(e) => setTourFullName(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>

                            <Button className="w-full h-9">
                                <Calendar className="mr-2 h-4 w-4" />
                                Request Tour
                            </Button>
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
                                <Button variant="ghost" size="sm" className="h-8" onClick={() => setIsFavorite(!isFavorite)}>
                                    <Heart className={cn("mr-1 h-3 w-3", isFavorite && "fill-current text-rose-500")} />
                                    <span className="text-xs">{isFavorite ? "Saved" : "Save"}</span>
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