"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useCreateLead } from "@/hooks/use-leads"
import { LeadStatus, LeadSource, PropertyType } from "@/types/lead"

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
    { value: "1 BHK", label: "1 BHK" },
    { value: "2 BHK", label: "2 BHK" },
    { value: "3 BHK", label: "3 BHK" },
    { value: "4 BHK", label: "4 BHK" },
    { value: "5 BHK", label: "5 BHK" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Plot", label: "Plot" },
    { value: "Row House", label: "Row House" },
    { value: "Villa", label: "Villa" },
    { value: "Apartment", label: "Apartment" },
]

const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
    { value: "website", label: "Website" },
    { value: "99acres", label: "99acres" },
    { value: "magicbricks", label: "MagicBricks" },
    { value: "housing.com", label: "Housing.com" },
    { value: "google_ads", label: "Google Ads" },
    { value: "facebook", label: "Facebook" },
    { value: "channel_partner", label: "Channel Partner" },
    { value: "referral", label: "Referral" },
    { value: "social", label: "Social Media" },
    { value: "cold_call", label: "Cold Call" },
    { value: "event", label: "Event" },
]

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "rnr", label: "Ringing No Response" },
    { value: "qualified", label: "Qualified" },
    { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
    { value: "site_visit_done", label: "Site Visit Done" },
    { value: "negotiation", label: "Negotiation" },
    { value: "booked", label: "Booked" },
    { value: "lost", label: "Lost" },
]

function formatBudget(value: number): string {
    if (value >= 10000000) {
        return `${(value / 10000000).toFixed(1)} Cr`
    } else if (value >= 100000) {
        return `${(value / 100000).toFixed(1)} L`
    }
    return value.toString()
}

function parseBudget(value: string): number {
    const num = parseFloat(value)
    if (isNaN(num)) return 0
    const upperValue = value.toUpperCase().trim()
    if (upperValue.endsWith("CR")) {
        return parseFloat(value) * 10000000
    } else if (upperValue.endsWith("L")) {
        return parseFloat(value) * 100000
    }
    return num
}

export function AddLeadDialog() {
    const [open, setOpen] = React.useState(false)
    const createLead = useCreateLead()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        const budgetMin = parseBudget(formData.get('budgetMin') as string)
        const budgetMax = parseBudget(formData.get('budgetMax') as string)
        
        const leadData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            status: formData.get('status') as LeadStatus,
            source: formData.get('source') as LeadSource,
            budgetMin,
            budgetMax,
            preferredLocation: formData.get('preferredLocation') as string,
            propertyType: formData.get('propertyType') as PropertyType,
            bedroom: Number(formData.get('bedroom')) || undefined,
            notes: formData.get('notes') as string,
            whatsappNumber: formData.get('whatsappNumber') as string,
        }

        try {
            await createLead.mutateAsync(leadData)
            setOpen(false)
            e.currentTarget.reset()
        } catch (error) {
            console.error("Failed to create lead:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                        Enter the lead's information to add them to your CRM.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                <Input id="whatsappNumber" name="whatsappNumber" type="tel" placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue="new">
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAD_STATUSES.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source">Source</Label>
                                <Select name="source" defaultValue="website">
                                    <SelectTrigger id="source">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAD_SOURCES.map(source => (
                                            <SelectItem key={source.value} value={source.value}>
                                                {source.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                                <Input id="budgetMin" name="budgetMin" type="text" placeholder="e.g. 50 L" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                                <Input id="budgetMax" name="budgetMax" type="text" placeholder="e.g. 1 Cr" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="preferredLocation">Preferred Location</Label>
                                <Input id="preferredLocation" name="preferredLocation" placeholder="e.g. Powai, Mumbai" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="propertyType">Property Type</Label>
                                <Select name="propertyType">
                                    <SelectTrigger id="propertyType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROPERTY_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bedroom">Bedroom</Label>
                                <Select name="bedroom">
                                    <SelectTrigger id="bedroom">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" name="notes" placeholder="Additional information..." />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createLead.isPending}>
                            {createLead.isPending ? "Adding..." : "Add Lead"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}