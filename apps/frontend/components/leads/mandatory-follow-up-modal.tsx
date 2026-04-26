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
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, CheckCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateLead, useLogLeadActivity, useLeadProperties, useLeadActivities } from "@/hooks/use-leads"
import { useAuth } from "@/lib/auth-context"
import { LeadStatus } from "@/types/lead"
import { toast } from "sonner"
import { toISOStringFromLocal, formatDateTimeInTimezone, getUserTimezone } from "@/lib/date-utils"

interface MandatoryFollowUpModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    leadId: string
    currentStatus: string
    onComplete?: () => void
}

export function MandatoryFollowUpModal({ open, onOpenChange, leadId, currentStatus, onComplete }: MandatoryFollowUpModalProps) {
    const { user } = useAuth()
    const updateLead = useUpdateLead()
    const logLeadActivity = useLogLeadActivity()
    const { data: properties, isLoading: isLoadingProperties } = useLeadProperties()
    const { data: activities } = useLeadActivities(leadId)
    
    const [status, setStatus] = React.useState<LeadStatus>(currentStatus as LeadStatus)
    const [followUpAt, setFollowUpAt] = React.useState("")
    const [notes, setNotes] = React.useState("")
    const [selectedProperties, setSelectedProperties] = React.useState<string[]>([])
    const [selectedVisitId, setSelectedVisitId] = React.useState<string>("")
    const [visitFeedback, setVisitFeedback] = React.useState("")
    
    const timezone = getUserTimezone(user)

    const showFollowUp = status !== "won" && status !== "lost"
    const showPropertyPicker = status === "site_visit_scheduled"
    const showVisitSelector = status === "site_visit_done"

    const scheduledVisits = activities?.filter((a: any) => a.action === 'site_visit_scheduled') || []

    React.useEffect(() => {
        if (open && currentStatus) {
            setStatus(currentStatus as LeadStatus)
            setSelectedProperties([])
            setSelectedVisitId("")
            setVisitFeedback("")
        }
    }, [open, currentStatus])

    const toggleProperty = (propertyId: string) => {
        setSelectedProperties(prev => 
            prev.includes(propertyId) 
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (status === "site_visit_scheduled" && !followUpAt) {
                toast.error("Please select a visit date and time")
                return
            }

            if (status === "site_visit_done" && !selectedVisitId && scheduledVisits.length > 0) {
                toast.error("Please select which visit was completed")
                return
            }

            if (status === "site_visit_scheduled") {
                const visitDateISO = toISOStringFromLocal(followUpAt)
                if (!visitDateISO) {
                    toast.error("Invalid date format")
                    return
                }

                await updateLead.mutateAsync({
                    id: leadId,
                    status,
                    siteVisitScheduledAt: visitDateISO,
                })

                const propertyDetails = selectedProperties.length > 0 
                    ? properties?.filter(p => selectedProperties.includes(p.id)).map(p => p.title).join(', ')
                    : null

                await logLeadActivity.mutateAsync({
                    leadId,
                    action: "site_visit_scheduled",
                    description: `Visit scheduled for ${new Date(visitDateISO).toLocaleDateString()}${propertyDetails ? ` - ${propertyDetails}` : ''}`,
                })

                toast.success("Visit scheduled successfully")
            } 
            else if (status === "site_visit_done") {
                await updateLead.mutateAsync({
                    id: leadId,
                    status,
                    siteVisitDoneAt: new Date().toISOString(),
                })

                const completedVisit = scheduledVisits.find(v => v.id === selectedVisitId)
                await logLeadActivity.mutateAsync({
                    leadId,
                    action: "site_visit_done",
                    description: visitFeedback || `Visit completed${completedVisit ? ` - ${new Date(completedVisit.timestamp).toLocaleDateString()}` : ''}`,
                })

                toast.success("Visit marked as completed")
            } 
            else {
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
            }
            
            setNotes("")
            setFollowUpAt("")
            setSelectedProperties([])
            setSelectedVisitId("")
            setVisitFeedback("")
            onOpenChange(false)
            onComplete?.()
        } catch (error) {
            toast.error("Failed to update lead")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl text-realty-navy dark:text-white font-bold">Log Outcome & Set Next Action</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        Log the outcome of this interaction and schedule the next follow-up.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label className="dark:text-gray-200">Update Pipeline Stage</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
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

                    {showPropertyPicker && (
                        <div className="space-y-3">
                            <Label className="dark:text-gray-200 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Select Properties (Optional)
                                </span>
                                {selectedProperties.length > 0 && (
                                    <span className="text-xs text-realty-gold font-medium">({selectedProperties.length} selected)</span>
                                )}
                            </Label>
                            <div className="max-h-40 overflow-y-auto border rounded-lg dark:border-gray-700 bg-muted/20">
                                {isLoadingProperties ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-realty-gold" />
                                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                                    </div>
                                ) : properties?.length ? (
                                    <div className="divide-y divide-border dark:divide-gray-700">
                                        {properties.map((property: any) => (
                                            <div 
                                                key={property.id}
                                                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                                                    selectedProperties.includes(property.id) ? 'bg-realty-gold/10' : ''
                                                }`}
                                                onClick={() => toggleProperty(property.id)}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                    selectedProperties.includes(property.id) 
                                                        ? 'border-realty-gold bg-realty-gold' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                    {selectedProperties.includes(property.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{property.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{property.address || 'No address'}</p>
                                                </div>
                                                <span className="text-xs font-semibold text-realty-gold whitespace-nowrap">
                                                    ₹{property.price ? (property.price / 100000).toFixed(0) : 0}L
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 text-center text-sm text-muted-foreground">
                                        No available properties
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showVisitSelector && (
                        <div className="space-y-3">
                            <Label className="dark:text-gray-200 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Which visit was completed?
                            </Label>
                            <div className="max-h-40 overflow-y-auto border rounded-lg dark:border-gray-700 bg-muted/20 space-y-2 p-2">
                                {scheduledVisits.length > 0 ? (
                                    scheduledVisits.map((visit: any, idx: number) => (
                                        <div 
                                            key={visit.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedVisitId === visit.id 
                                                    ? 'border-realty-gold bg-realty-gold/10' 
                                                    : 'border-border hover:bg-muted'
                                            }`}
                                            onClick={() => setSelectedVisitId(visit.id)}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedVisitId === visit.id 
                                                    ? 'border-realty-gold bg-realty-gold' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                                {selectedVisitId === visit.id && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Visit #{idx + 1}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.timestamp ? formatDateTimeInTimezone(visit.timestamp, timezone) : 'Date not set'}
                                                </p>
                                                {visit.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">{visit.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center">
                                        <p className="text-sm text-muted-foreground">No scheduled visits found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Schedule a visit first to mark it as done</p>
                                    </div>
                                )}
                            </div>
                            {selectedVisitId && (
                                <Textarea 
                                    value={visitFeedback}
                                    onChange={(e) => setVisitFeedback(e.target.value)}
                                    placeholder="Visit feedback (optional)..."
                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 resize-none"
                                    rows={2}
                                />
                            )}
                        </div>
                    )}

                    {!showPropertyPicker && !showVisitSelector && (
                        <>
                            <div className="space-y-2">
                                <Label className="dark:text-gray-200">What was the outcome?</Label>
                                <Textarea 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., Customer is interested but needs a week to discuss with family..."
                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 resize-none"
                                    rows={2}
                                />
                            </div>

                            {showFollowUp && (
                                <div className="space-y-2">
                                    <Label className="flex gap-2 items-center text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Next Follow-Up (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            type="datetime-local" 
                                            value={followUpAt}
                                            onChange={(e) => setFollowUpAt(e.target.value)}
                                            className="bg-muted/30 dark:bg-muted/50 pl-10"
                                        />
                                    </div>
                                </div>
                            )}
                            {!showFollowUp && (
                                <div className="p-3 bg-muted/50 dark:bg-muted/30 rounded-lg text-sm text-muted-foreground">
                                    {status === "won" ? "🎉 Deal won! No follow-up needed." : "Lead marked as lost. No follow-up needed."}
                                </div>
                            )}
                        </>
                    )}

                    {showPropertyPicker && (
                        <div className="space-y-2">
                            <Label className="flex gap-2 items-center text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Visit Date & Time
                            </Label>
                            <div className="relative">
                                <Input 
                                    type="datetime-local" 
                                    value={followUpAt}
                                    onChange={(e) => setFollowUpAt(e.target.value)}
                                    className="bg-muted/30 dark:bg-muted/50 pl-10"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {status === "site_visit_scheduled" ? "Schedule Visit" : 
                             status === "site_visit_done" ? "Mark as Done" : 
                             "Log & Schedule"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}