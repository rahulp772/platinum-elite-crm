"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createProperty } from "@/app/actions/properties"
import { PropertyStatus, PropertyType } from "@/types/property"
import { useBuilders } from "@/hooks/use-builders"
import { toast } from "sonner"
import { Building2, MapPin, ShieldCheck, Banknote, Calendar } from "lucide-react"

interface AddPropertyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("basic")
    const [listingType, setListingType] = React.useState<"sell" | "rent">("sell")
    const { data: builders } = useBuilders()

    const tabs = ["basic", "location", "india", "financial"]
    const currentTabIndex = tabs.indexOf(activeTab)
    const isLastTab = currentTabIndex === tabs.length - 1

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isLastTab) {
            setActiveTab(tabs[currentTabIndex + 1])
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        const propertyData = {
            title: formData.get('title') as string,
            price: Number(formData.get('price')),
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zipCode: formData.get('zipCode') as string,
            bedrooms: Number(formData.get('bedrooms')) || undefined,
            bathrooms: Number(formData.get('bathrooms')) || undefined,
            sqft: Number(formData.get('sqft')),
            type: formData.get('type') as PropertyType,
            status: formData.get('status') as PropertyStatus,
            description: formData.get('description') as string,
            builderId: formData.get('builderId') as string || undefined,
            reraNumber: formData.get('reraNumber') as string || undefined,
            reraAuthority: formData.get('reraAuthority') as string || undefined,
            carpetArea: Number(formData.get('carpetArea')) || undefined,
            superBuiltUpArea: Number(formData.get('superBuiltUpArea')) || undefined,
            possessionDate: formData.get('possessionDate') as string || undefined,
            constructionStatus: formData.get('constructionStatus') as string || undefined,
            // New plot/project fields
            totalLandArea: Number(formData.get('totalLandArea')) || undefined,
            unitCount: Number(formData.get('unitCount')) || undefined,
            minPlotSize: Number(formData.get('minPlotSize')) || undefined,
            maxPlotSize: Number(formData.get('maxPlotSize')) || undefined,
            ratePerSqft: Number(formData.get('ratePerSqft')) || undefined,
            dtcpApproval: formData.get('dtcpApproval') as string || undefined,
            images: ["https://images.unsplash.com/photo-1600585154340-be6199f7a096?q=80&w=2070&auto=format&fit=crop"],
            features: ["Modern Kitchen", "Hardwood Floors"],
        }

        try {
            setIsSubmitting(true)
            await createProperty(propertyData)
            toast.success("Property created successfully")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create property:", error)
            toast.error("Failed to create property. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl rounded-[40px] overflow-hidden p-0 gap-0 bg-background border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 bg-realty-navy text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Building2 className="h-24 w-24" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold">List New Property</DialogTitle>
                            <DialogDescription className="text-realty-gold-light font-medium">
                                Professional property onboarding with RERA compliance.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-8 pt-4 border-b border-border bg-accent/30">
                            <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                                <TabsTrigger value="basic" className="data-[state=active]:bg-transparent data-[state=active]:border-b-[3px] data-[state=active]:border-realty-gold data-[state=active]:text-realty-gold h-full rounded-none px-2 font-bold transition-all">Basic Details</TabsTrigger>
                                <TabsTrigger value="location" className="data-[state=active]:bg-transparent data-[state=active]:border-b-[3px] data-[state=active]:border-realty-gold data-[state=active]:text-realty-gold h-full rounded-none px-2 font-bold transition-all">Location</TabsTrigger>
                                <TabsTrigger value="india" className="data-[state=active]:bg-transparent data-[state=active]:border-b-[3px] data-[state=active]:border-realty-gold data-[state=active]:text-realty-gold h-full rounded-none px-2 font-bold transition-all">RERA & India</TabsTrigger>
                                <TabsTrigger value="financial" className="data-[state=active]:bg-transparent data-[state=active]:border-b-[3px] data-[state=active]:border-realty-gold data-[state=active]:text-realty-gold h-full rounded-none px-2 font-bold transition-all">Financials</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="px-8 pt-6 pb-12 h-[520px] overflow-y-auto custom-scrollbar">
                            <TabsContent value="basic" className="mt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="listingType">Listing Intent</Label>
                                        <div className="flex p-1 bg-muted rounded-xl gap-1">
                                            <Button 
                                                type="button"
                                                variant={listingType === "sell" ? "default" : "ghost"}
                                                className={cn("flex-1 rounded-lg h-9 font-bold", listingType === "sell" && "bg-realty-navy text-white shadow-sm")}
                                                onClick={() => setListingType("sell")}
                                            >
                                                For Sell
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant={listingType === "rent" ? "default" : "ghost"}
                                                className={cn("flex-1 rounded-lg h-9 font-bold", listingType === "rent" && "bg-realty-navy text-white shadow-sm")}
                                                onClick={() => setListingType("rent")}
                                            >
                                                For Rent
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Property Title *</Label>
                                        <Input id="title" name="title" placeholder="E.g. Godrej Zenith Sector 89" required className="rounded-xl h-11 bg-background" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="builderId">Developer / Builder</Label>
                                        <Select name="builderId">
                                            <SelectTrigger className="rounded-xl h-11">
                                                <SelectValue placeholder="Select Builder" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {builders?.map(builder => (
                                                    <SelectItem key={builder.id} value={builder.id}>{builder.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Property Type</Label>
                                        <Select name="type" defaultValue="apartment">
                                            <SelectTrigger id="type" className="rounded-xl h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="apartment">Apartment / Flat</SelectItem>
                                                <SelectItem value="house">Villa / Independent House</SelectItem>
                                                <SelectItem value="condo">Penthouse</SelectItem>
                                                <SelectItem value="commercial">Commercial Space</SelectItem>
                                                <SelectItem value="land">Residential Plot</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Listing Status</Label>
                                        <Select name="status" defaultValue="available">
                                            <SelectTrigger id="status" className="rounded-xl h-11 bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="pending">{listingType === "sell" ? "Under Negotiation" : "Pending Verification"}</SelectItem>
                                                <SelectItem value="sold">{listingType === "sell" ? "Sold Out" : "Rented / Leased"}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                                        <Input id="bedrooms" name="bedrooms" type="number" placeholder="3" className="rounded-xl h-11 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms">Bathrooms</Label>
                                        <Input id="bathrooms" name="bathrooms" type="number" step="0.5" placeholder="2.5" className="rounded-xl h-11 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sqft">Total Area (Sq.Ft) *</Label>
                                        <Input id="sqft" name="sqft" type="number" placeholder="1850" required className="rounded-xl h-11 bg-background" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Marketing Description *</Label>
                                    <Textarea id="description" name="description" placeholder="Highlights of the project..." className="resize-none rounded-xl" rows={3} required />
                                </div>
                            </TabsContent>

                            <TabsContent value="location" className="mt-0 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address / Sector *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="address" name="address" placeholder="Sector 89, New Gurgaon" required className="pl-10 rounded-xl h-11" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input id="city" name="city" placeholder="Gurugram" required className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Input id="state" name="state" placeholder="Haryana" required className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">PIN Code *</Label>
                                        <Input id="zipCode" name="zipCode" placeholder="122001" required className="rounded-xl h-11" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="india" className="mt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4 border-l-4 border-realty-gold pl-4 bg-realty-gold/5 py-4 rounded-r-2xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="reraNumber" className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-realty-gold" />
                                            RERA Reg. Number
                                        </Label>
                                        <Input id="reraNumber" name="reraNumber" placeholder="RC/REP/HARERA/GGM/..." className="rounded-xl h-11 border-realty-gold/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reraAuthority">RERA Authority</Label>
                                        <Select name="reraAuthority" defaultValue="HARERA">
                                            <SelectTrigger className="rounded-xl h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="MahaRERA">MahaRERA (Maharashtra)</SelectItem>
                                                <SelectItem value="HARERA">HARERA (Haryana)</SelectItem>
                                                <SelectItem value="UPRERA">UPRERA (Uttar Pradesh)</SelectItem>
                                                <SelectItem value="GujRERA">GujRERA (Gujarat)</SelectItem>
                                                <SelectItem value="KRERA">KRERA (Karnataka)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="carpetArea">Carpet Area (Sq.Ft) *</Label>
                                        <Input id="carpetArea" name="carpetArea" type="number" placeholder="1250" className="rounded-xl h-11" />
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-wider">Mandatory under RERA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="superBuiltUpArea">Super Built-up Area</Label>
                                        <Input id="superBuiltUpArea" name="superBuiltUpArea" type="number" placeholder="1850" className="rounded-xl h-11" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="constructionStatus">Construction Status</Label>
                                        <Select name="constructionStatus" defaultValue="under_construction">
                                            <SelectTrigger className="rounded-xl h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="under_construction">Under Construction</SelectItem>
                                                <SelectItem value="ready_to_move">Ready to Move (OC Received)</SelectItem>
                                                <SelectItem value="new_launch">New Launch</SelectItem>
                                                <SelectItem value="ready_to_construct">Ready to Construct (Plots)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="possessionDate" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Expected Possession
                                        </Label>
                                        <Input id="possessionDate" name="possessionDate" type="date" className="rounded-xl h-11" />
                                    </div>
                                </div>

                                {/* Plot/Project Specific Fields */}
                                <div className="border-l-4 border-teal-500 pl-4 bg-teal-500/5 py-4 rounded-r-2xl mt-4">
                                    <h4 className="font-semibold text-sm text-teal-700 mb-4">Plot / Project Details (for Plotted Developments)</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalLandArea">Total Land (Acres)</Label>
                                            <Input id="totalLandArea" name="totalLandArea" type="number" step="0.01" placeholder="4.68" className="rounded-xl h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unitCount">Total Units/Plots</Label>
                                            <Input id="unitCount" name="unitCount" type="number" placeholder="31" className="rounded-xl h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dtcpApproval">DTCP/CMDA Approval</Label>
                                            <Select name="dtcpApproval">
                                                <SelectTrigger className="rounded-xl h-11">
                                                    <SelectValue placeholder="Select Approval" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="CMDA">CMDA Approved</SelectItem>
                                                    <SelectItem value="DTCP">DTCP Approved</SelectItem>
                                                    <SelectItem value="DTCP & RERA">DTCP & RERA</SelectItem>
                                                    <SelectItem value="NA">Not Applicable (Pre-RERA)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minPlotSize">Min Plot Size (sqft)</Label>
                                            <Input id="minPlotSize" name="minPlotSize" type="number" placeholder="2400" className="rounded-xl h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxPlotSize">Max Plot Size (sqft)</Label>
                                            <Input id="maxPlotSize" name="maxPlotSize" type="number" placeholder="3045" className="rounded-xl h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ratePerSqft">Rate per Sq.Ft (₹)</Label>
                                            <Input id="ratePerSqft" name="ratePerSqft" type="number" placeholder="10883" className="rounded-xl h-11" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="financial" className="mt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4" />
                                            {listingType === "sell" ? "Asking Price (₹) *" : "Monthly Rent (₹) *"}
                                        </Label>
                                        <Input id="price" name="price" type="number" placeholder="12500000" required className="rounded-xl h-11 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bookingAmount">{listingType === "sell" ? "Booking Amount (₹)" : "Security Deposit (₹)"}</Label>
                                        <Input id="bookingAmount" name="bookingAmount" type="number" placeholder="500000" className="rounded-xl h-11 bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentPlan">Payment Plan Overview</Label>
                                    <Select name="paymentPlan" defaultValue="clp">
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="clp">Construction Linked Plan (CLP)</SelectItem>
                                            <SelectItem value="plp">Possession Linked Plan (PLP)</SelectItem>
                                            <SelectItem value="dp">Down Payment Plan</SelectItem>
                                            <SelectItem value="flexible">Flexible / Subvention Plan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter className="px-8 py-6 border-t border-border bg-accent/20">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 font-bold">
                            Cancel
                        </Button>
                        <Button 
                            type={isLastTab ? "submit" : "button"} 
                            onClick={isLastTab ? undefined : handleNext}
                            disabled={isSubmitting} 
                            className="bg-realty-navy text-white hover:bg-realty-navy-light font-bold rounded-xl h-11 px-10 shadow-lg shadow-realty-navy/20 min-w-[180px]"
                        >
                            {isSubmitting ? "Processing..." : isLastTab ? "Complete Listing" : "Continue to Next"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
