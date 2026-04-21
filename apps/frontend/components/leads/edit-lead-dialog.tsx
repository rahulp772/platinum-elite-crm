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
import { useUpdateLead, useUsers } from "@/hooks/use-leads"
import { Lead, LeadStatus } from "@/types/lead"

interface EditLeadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead | null
}

export function EditLeadDialog({ open, onOpenChange, lead }: EditLeadDialogProps) {
    const updateLead = useUpdateLead()
    const { data: users } = useUsers()
    
    const [formData, setFormData] = React.useState<{
        status: LeadStatus
        assignedToId: string
        followUpAt: string
        notes: string
    }>({
        status: lead?.status || "new",
        assignedToId: lead?.assignedTo?.id || "",
        followUpAt: "",
        notes: lead?.notes || "",
    })

    React.useEffect(() => {
        if (lead) {
            setFormData({
                status: (lead.status as LeadStatus) || "new",
                assignedToId: lead.assignedTo?.id || "",
                followUpAt: lead.followUpAt ? new Date(lead.followUpAt).toISOString().slice(0, 16) : "",
                notes: lead.notes || "",
            })
        }
    }, [lead])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!lead) return

        const data = new FormData(e.currentTarget)
        
        const updateData = {
            id: lead.id,
            status: data.get('status') as Lead["status"],
            assignedToId: data.get('assignedToId') as string || undefined,
            followUpAt: data.get('followUpAt') ? new Date(data.get('followUpAt') as string).toISOString() : undefined,
            notes: data.get('notes') as string,
        }

        try {
            await updateLead.mutateAsync(updateData)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update lead:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Lead</DialogTitle>
                    <DialogDescription>
                        Update the lead's information and status.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as LeadStatus }))}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="interested">Interested</SelectItem>
                                        <SelectItem value="not_interested">Not Interested</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assignedToId">Assigned To</Label>
                                <Select name="assignedToId" value={formData.assignedToId || "unassigned"} onValueChange={(v) => setFormData(prev => ({ ...prev, assignedToId: v === "unassigned" ? "" : v }))}>
                                    <SelectTrigger id="assignedToId">
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="followUpAt">Follow Up Date & Time</Label>
                                <Input 
                                    id="followUpAt" 
                                    name="followUpAt" 
                                    type="datetime-local" 
                                    value={formData.followUpAt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, followUpAt: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" name="notes" defaultValue={lead?.notes} placeholder="Additional information..." />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateLead.isPending}>
                            {updateLead.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}