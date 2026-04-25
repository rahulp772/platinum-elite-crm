"use client"

import * as React from "react"
import { Briefcase, DollarSign, Calendar, Building, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { toISOStringFromLocal } from "@/lib/date-utils"

interface ConvertToDealModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: {
        id: string
        name: string
        email: string
        budgetMax?: number
        preferredLocation?: string
    }
    onSuccess: () => void
}

export function ConvertToDealModal({
    open,
    onOpenChange,
    lead,
    onSuccess,
}: ConvertToDealModalProps) {
    const [title, setTitle] = React.useState(`Deal - ${lead.name}`)
    const [value, setValue] = React.useState(lead.budgetMax?.toString() || "")
    const [stage, setStage] = React.useState("lead")
    const [expectedCloseDate, setExpectedCloseDate] = React.useState("")
    const [notes, setNotes] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Please enter a deal title")
            return
        }
        
        setIsSubmitting(true)
        try {
            await api.post("/deals", {
                title,
                value: parseFloat(value) || 0,
                stage,
                customerName: lead.name,
                customerEmail: lead.email,
                expectedCloseDate: toISOStringFromLocal(expectedCloseDate) || null,
                notes: notes || null,
            })
            
            toast.success("Deal created successfully!")
            onSuccess()
            handleClose()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create deal")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setTitle(`Deal - ${lead.name}`)
        setValue(lead.budgetMax?.toString() || "")
        setStage("lead")
        setExpectedCloseDate("")
        setNotes("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Convert Lead to Deal
                    </DialogTitle>
                    <DialogDescription>
                        Create a new deal from {lead.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="deal-title">Deal Title</Label>
                        <Input
                            id="deal-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter deal title"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deal-value">Deal Value (₹)</Label>
                            <Input
                                id="deal-value"
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deal-stage">Stage</Label>
                            <Select value={stage} onValueChange={setStage}>
                                <SelectTrigger>
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expected-close">Expected Close Date</Label>
                        <Input
                            id="expected-close"
                            type="date"
                            value={expectedCloseDate}
                            onChange={(e) => setExpectedCloseDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deal-notes">Notes</Label>
                        <Textarea
                            id="deal-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this deal..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Deal"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}