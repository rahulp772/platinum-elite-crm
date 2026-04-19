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
import { useCreateDeal } from "@/hooks/use-deals"
import { DealStage, DealPriority } from "@/types/deal"

interface AddDealDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddDealDialog({ open, onOpenChange }: AddDealDialogProps) {
    const createDeal = useCreateDeal()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        const dealData = {
            title: formData.get('title') as string,
            value: Number(formData.get('value')),
            stage: formData.get('stage') as DealStage,
            priority: formData.get('priority') as DealPriority,
            customerName: formData.get('customerName') as string,
            customerEmail: formData.get('customerEmail') as string,
            expectedCloseDate: new Date(), // Default for now
        }

        try {
            await createDeal.mutateAsync(dealData)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create deal:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Deal</DialogTitle>
                    <DialogDescription>
                        Enter the deal information to track a new opportunity.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Deal Title *</Label>
                                <Input id="title" name="title" placeholder="Downtown Loft Purchase" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Deal Value ($) *</Label>
                                <Input id="value" name="value" type="number" placeholder="850000" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name *</Label>
                                <Input id="customerName" name="customerName" placeholder="Alice Freeman" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerEmail">Customer Email *</Label>
                                <Input id="customerEmail" name="customerEmail" type="email" placeholder="alice@example.com" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stage">Stage</Label>
                                <Select name="stage" defaultValue="lead">
                                    <SelectTrigger id="stage">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                        <SelectItem value="under_contract">Under Contract</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select name="priority" defaultValue="medium">
                                    <SelectTrigger id="priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createDeal.isPending}>
                            {createDeal.isPending ? "Creating..." : "Create Deal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
