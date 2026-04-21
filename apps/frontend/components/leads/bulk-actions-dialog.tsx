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
import { useUpdateLead, useUsers, useLeads } from "@/hooks/use-leads"
import { Lead, LeadStatus } from "@/types/lead"

interface BulkActionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    leads: Lead[]
    onComplete: () => void
}

export function BulkActionsDialog({ open, onOpenChange, leads, onComplete }: BulkActionsDialogProps) {
    const updateLead = useUpdateLead()
    const { data: users } = useUsers()
    const { refetch } = useLeads()
    
    const [action, setAction] = React.useState<"status" | "assign" | "notes">("status")
    const [status, setStatus] = React.useState<LeadStatus>("new")
    const [assignedToId, setAssignedToId] = React.useState("")
    const [notes, setNotes] = React.useState("")

    const handleSubmit = async () => {
        try {
            for (const lead of leads) {
                const updates = {
                    id: lead.id,
                    ...(action === "status" && { status }),
                    ...(action === "assign" && { assignedToId: assignedToId || undefined }),
                    ...(action === "notes" && { notes }),
                }
                
                await updateLead.mutateAsync(updates)
            }
            
            await refetch()
            onComplete()
            onOpenChange(false)
        } catch (error) {
            console.error("Bulk action failed:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Bulk Actions</DialogTitle>
                    <DialogDescription>
                        Update {leads.length} selected lead{leads.length !== 1 ? "s" : ""} at once.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <Select value={action} onValueChange={(v) => setAction(v as "status" | "assign" | "notes")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status">Change Status</SelectItem>
                                <SelectItem value="assign">Assign to Agent</SelectItem>
                                <SelectItem value="notes">Add Notes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {action === "status" && (
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                                <SelectTrigger>
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
                    )}

                    {action === "assign" && (
                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={assignedToId} onValueChange={setAssignedToId}>
                                <SelectTrigger>
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
                    )}

                    {action === "notes" && (
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input 
                                placeholder="Add notes to all selected leads..." 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={updateLead.isPending}
                    >
                        {updateLead.isPending ? "Applying..." : "Apply"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}