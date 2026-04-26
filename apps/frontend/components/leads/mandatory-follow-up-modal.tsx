"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateLead, useLogLeadActivity } from "@/hooks/use-leads"
import { LeadStatus } from "@/types/lead"
import { toast } from "sonner"
import { toISOStringFromLocal } from "@/lib/date-utils"

interface MandatoryFollowUpModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    leadId: string
    currentStatus: string
    onComplete?: () => void
}

export function MandatoryFollowUpModal({ open, onOpenChange, leadId, currentStatus, onComplete }: MandatoryFollowUpModalProps) {
    const updateLead = useUpdateLead()
    const logLeadActivity = useLogLeadActivity()
    const [status, setStatus] = React.useState<LeadStatus>(currentStatus as LeadStatus)
    const [followUpAt, setFollowUpAt] = React.useState("")
    const [notes, setNotes] = React.useState("")

    React.useEffect(() => {
        if (open && currentStatus) {
            setStatus(currentStatus as LeadStatus)
        }
    }, [open, currentStatus])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await updateLead.mutateAsync({
                id: leadId,
                status,
                followUpAt: toISOStringFromLocal(followUpAt) || undefined,
            })
            
            if (notes.trim()) {
                await logLeadActivity.mutateAsync({
                    leadId,
                    action: "outcome_logged",
                    description: notes,
                })
            }
            
            toast.success("Outcome logged and follow-up scheduled.")
            setNotes("")
            setFollowUpAt("")
            onOpenChange(false)
            onComplete?.()
        } catch (error) {
            toast.error("Failed to update lead")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl text-realty-navy font-bold">Log Outcome & Set Next Action</DialogTitle>
                    <DialogDescription>
                        Log the outcome of this interaction and schedule the next follow-up.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label>What was the outcome?</Label>
                        <Input 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Customer is interested but needs a week to discuss with family..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Update Pipeline Stage?</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="rnr">Ringing No Response</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="site_visit_scheduled">Visit Scheduled</SelectItem>
                                <SelectItem value="site_visit_done">Visit Done</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="won">Won / Booked</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex gap-2 items-center text-muted-foreground">
                            Next Follow-Up (Optional)
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input 
                                type="datetime-local" 
                                value={followUpAt}
                                onChange={(e) => setFollowUpAt(e.target.value)}
                                className="bg-muted/30 pl-10"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-realty-navy hover:bg-realty-navy-light text-white">
                            Log & Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
