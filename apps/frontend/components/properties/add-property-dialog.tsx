"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
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
import { useCreateProperty } from "@/hooks/use-properties"
import { PropertyStatus, PropertyType } from "@/types/property"

interface AddPropertyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
    const createProperty = useCreateProperty()
    
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
            images: ["https://images.unsplash.com/photo-1600585154340-be6199f7a096?q=80&w=2070&auto=format&fit=crop"], // Placeholder
            features: ["Modern Kitchen", "Hardwood Floors"], // Placeholder
        }

        try {
            await createProperty.mutateAsync(propertyData)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create property:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        Enter the property details to add it to your listings.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Property Title *</Label>
                                <Input id="title" name="title" placeholder="Modern Downtown Loft" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($) *</Label>
                                <Input id="price" name="price" type="number" placeholder="850000" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Input id="address" name="address" placeholder="123 Main Street" required />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input id="city" name="city" placeholder="New York" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input id="state" name="state" placeholder="NY" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code *</Label>
                                <Input id="zipCode" name="zipCode" placeholder="10001" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bedrooms">Bedrooms</Label>
                                <Input id="bedrooms" name="bedrooms" type="number" placeholder="3" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bathrooms">Bathrooms</Label>
                                <Input id="bathrooms" name="bathrooms" type="number" step="0.5" placeholder="2.5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sqft">Square Feet *</Label>
                                <Input id="sqft" name="sqft" type="number" placeholder="1500" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Property Type</Label>
                                <Select name="type" defaultValue="apartment">
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                        <SelectItem value="condo">Condo</SelectItem>
                                        <SelectItem value="townhouse">Townhouse</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue="available">
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="sold">Sold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" placeholder="Property description..." className="resize-none" required />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createProperty.isPending}>
                            {createProperty.isPending ? "Adding..." : "Add Property"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
