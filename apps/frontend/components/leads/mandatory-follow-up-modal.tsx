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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateLead } from "@/hooks/use-leads"
import { LeadStatus } from "@/types/lead"
import { toast } from "sonner"

interface MandatoryFollowUpModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    leadId: string
    currentStatus: string
    onComplete?: () => void
}

export function MandatoryFollowUpModal({ open, onOpenChange, leadId, currentStatus, onComplete }: MandatoryFollowUpModalProps) {
    const updateLead = useUpdateLead()
    const [status, setStatus] = React.useState<LeadStatus>(currentStatus as LeadStatus)
    const [followUpAt, setFollowUpAt] = React.useState("")
    const [notes, setNotes] = React.useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!followUpAt) {
            toast.error("You must set a next follow-up date.")
            return
        }

        try {
            await updateLead.mutateAsync({
                id: leadId,
                status,
                followUpAt: new Date(followUpAt).toISOString(),
                notes: notes ? `Action Outcome: ${notes}` : undefined,
            })
            
            toast.success("Outcome logged and follow-up scheduled.")
            onOpenChange(false)
            onComplete?.()
        } catch (error) {
            toast.error("Failed to update lead")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* We remove the standard close button for "mandatory" effect by not allowing easy escape, 
                but for UX, clicking outside might still close it unless configured otherwise */}
            <DialogContent className="max-w-md sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl text-realty-navy font-bold">Log Outcome & Set Next Action</DialogTitle>
                    <DialogDescription>
                        You must log the outcome of this interaction and schedule the next follow-up before continuing.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label>What was the outcome?</Label>
                        <Input 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Customer is interested but needs a week to discuss with family..."
                            required
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
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="site_visit_scheduled">Visit Scheduled</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex gap-2 items-center text-rose-600 font-semibold">
                            Next Follow-Up (Required) *
                        </Label>
                        <Input 
                            type="datetime-local" 
                            value={followUpAt}
                            onChange={(e) => setFollowUpAt(e.target.value)}
                            className="bg-rose-50 border-rose-200"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!followUpAt} className="bg-realty-navy hover:bg-realty-navy-light text-white">
                            Log & Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
