"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useUpdateLead, useLogLeadActivity, useReassignLead, useUsers } from "@/hooks/use-leads"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Phone, MessageCircle, Calendar, ArrowLeft, Send, Sparkles as SparkleIcon, User, ArrowRightLeft, Mic, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MandatoryFollowUpModal } from "./mandatory-follow-up-modal"
import { CallOutcomeModal } from "./call-outcome-modal"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { LeadStatus } from "@/types/lead"

const quickActionsMap: Record<LeadStatus, { label: string; nextStatus: LeadStatus; description: string }[]> = {
    new: [
        { label: "Mark Contacted", nextStatus: "contacted", description: "I called them" },
        { label: "Add Note", nextStatus: "new", description: "Add info without changing status" },
    ],
    contacted: [
        { label: "Schedule Visit", nextStatus: "site_visit_scheduled", description: "Book a site visit" },
        { label: "Qualify Lead", nextStatus: "qualified", description: "Confirm they're interested" },
    ],
    rnr: [
        { label: "Try Again", nextStatus: "contacted", description: "Will call again" },
        { label: "Mark Lost", nextStatus: "lost", description: "Lead not interested" },
    ],
    qualified: [
        { label: "Schedule Visit", nextStatus: "site_visit_scheduled", description: "Book a site visit" },
        { label: "Send to Negotiation", nextStatus: "negotiation", description: "Discuss terms" },
    ],
    site_visit_scheduled: [
        { label: "Visit Done", nextStatus: "site_visit_done", description: "Mark visit as completed" },
        { label: "Cancel Visit", nextStatus: "contacted", description: "Remove scheduled visit" },
    ],
    site_visit_done: [
        { label: "Start Negotiation", nextStatus: "negotiation", description: "Discuss deal terms" },
        { label: "Keep in Touch", nextStatus: "qualified", description: "Still interested, no rush" },
    ],
    negotiation: [
        { label: "Close Deal", nextStatus: "won", description: "Deal closed!" },
        { label: "Keep Negotiating", nextStatus: "negotiation", description: "Still discussing" },
    ],
    won: [],
    lost: [],
}
import { toast } from "sonner"
import { toISOStringFromLocal, toLocalDateTimeInput } from "@/lib/date-utils"

export function LeadDetailSplitView({ leadId }: { leadId: string }) {
    const { user } = useAuth()
    const updateLead = useUpdateLead()
    const logLeadActivity = useLogLeadActivity()
    const reassignLead = useReassignLead()
    const [note, setNote] = React.useState("")
    const [showFollowUpModal, setShowFollowUpModal] = React.useState(false)
    const [pendingStatus, setPendingStatus] = React.useState<LeadStatus | null>(null)
    const [showReassignModal, setShowReassignModal] = React.useState(false)
    const [newAssigneeId, setNewAssigneeId] = React.useState("")
    const [showCallOutcomeModal, setShowCallOutcomeModal] = React.useState(false)
    
    const { data: lead, isLoading } = useQuery({
        queryKey: ["lead", leadId],
        queryFn: async () => {
            const res = await api.get(`/leads/${leadId}`)
            return res.data
        }
    })

    const { data: activities } = useQuery({
        queryKey: ["lead-activities", leadId],
        queryFn: async () => {
            const res = await api.get(`/leads/${leadId}/activities`)
            return res.data
        },
        enabled: !!leadId,
    })

    const { data: users } = useUsers()

    const canReassign = React.useMemo(() => {
        if (!user?.role?.level) return false
        return user.role.level >= 50 || user.isSuperAdmin
    }, [user])

    const handleReassign = () => {
        if (!newAssigneeId || newAssigneeId === lead.assignedToId) return
        reassignLead.mutate({ leadId: lead.id, assignedToId: newAssigneeId }, {
            onSuccess: () => {
                toast.success("Lead reassigned")
                setShowReassignModal(false)
                setNewAssigneeId("")
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
            </div>
        )
    }

    if (!lead) return <div>Lead not found</div>

    const handleStatusChange = (status: LeadStatus) => {
        setPendingStatus(status)
        setShowFollowUpModal(true)
    }

    const handleModalComplete = () => {
        setShowFollowUpModal(false)
        setPendingStatus(null)
    }

    const handleModalSkip = () => {
        setShowFollowUpModal(false)
        setPendingStatus(null)
    }

    const handleCallClick = () => {
        window.open(`tel:${lead.phone}`)
        setShowCallOutcomeModal(true)
    }

    const handleCallOutcomeComplete = (outcome: string, notes: string) => {
        const actionMap: Record<string, string> = {
            connected: "call_connected",
            not_connected: "call_not_connected",
            voicemail: "call_made",
            will_callback: "call_made",
            wrong_number: "call_not_connected",
        }
        logLeadActivity.mutate({ 
            leadId: lead.id, 
            action: actionMap[outcome] || "call_made", 
            description: notes || outcome 
        })
        toast.success("Call logged")
    }

    const handleWhatsAppClick = () => {
        const waNumber = lead.whatsappNumber || lead.phone
        window.open(`https://wa.me/${waNumber.replace(/\D/g, "")}`)
        logLeadActivity.mutate({ leadId: lead.id, action: "whatsapp_sent", description: "Opened WhatsApp chat" })
        toast.success("WhatsApp opened")
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return;
        const isoDate = toISOStringFromLocal(e.target.value);
        if (!isoDate) return;
        updateLead.mutate({ id: lead.id, followUpAt: isoDate }, {
            onSuccess: () => toast.success("Follow-up scheduled")
        })
    }

    const handleQuickDate = (days: number) => {
        const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        const isoDate = toISOStringFromLocal(localDateTime);
        if (!isoDate) return;
        updateLead.mutate({ id: lead.id, followUpAt: isoDate }, {
            onSuccess: () => toast.success("Follow-up scheduled")
        })
    }

    const handleAddNote = () => {
        if (!note.trim()) return;
        
        // Use existing update logic to append note for MVP
        // In real app, we might want a separate notes table
        const newNotes = lead.notes ? `${lead.notes}\n${format(new Date(), 'dd/MM yyyy HH:mm')}: ${note}` : `${format(new Date(), 'dd/MM yyyy HH:mm')}: ${note}`;
        
        updateLead.mutate({ id: lead.id, notes: newNotes }, {
            onSuccess: () => {
                setNote("");
                toast.success("Note added");
            }
        })
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/leads"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {lead.name}
                        <Badge variant="outline" className="bg-primary/5 uppercase">{lead.status.replace(/_/g, " ")}</Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">{lead.phone} • {lead.email}</p>
                </div>
            </div>

            {/* Quick Action Pills */}
            {quickActionsMap[lead.status as LeadStatus]?.length > 0 && (
                <div className="mb-4 flex gap-2 flex-wrap">
                    {quickActionsMap[lead.status as LeadStatus].map((action, idx) => (
                        <Button
                            key={idx}
                            variant={action.nextStatus === "won" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-auto py-1.5 px-3 text-xs font-medium",
                                action.nextStatus === "won" && "bg-emerald-600 hover:bg-emerald-700",
                                action.nextStatus === "lost" && "text-rose-600 border-rose-200 hover:bg-rose-50"
                            )}
                            onClick={() => {
                                if (action.nextStatus === "new") {
                                    setNote("");
                                } else {
                                    handleStatusChange(action.nextStatus);
                                }
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Side: Activity Timeline (70%) */}
                <Card className="flex-1 flex flex-col border-border/50 overflow-hidden">
                    <div className="p-4 border-b border-border/50 bg-muted/20 flex gap-4 text-sm">
                        <div><span className="text-muted-foreground">Budget:</span> <span className="font-medium">₹{(lead.budgetMax / 100000).toFixed(0)}L</span></div>
                        <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{lead.preferredLocation || "Any"}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{lead.propertyType || "Any"}</span></div>
                        <div><span className="text-muted-foreground">Source:</span> <span className="font-medium capitalize">{lead.source?.replace(/_/g, " ") || "Unknown"}</span></div>
                        <div><span className="text-muted-foreground">Score:</span> <span className="font-medium">{lead.score || 0}</span></div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            {/* Notes displayed as timeline events for MVP */}
                            {lead.notes?.split('\n').filter(Boolean).map((n: string, i: number) => (
                                <div key={`note-${i}`} className="flex gap-4 justify-end">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl rounded-tr-sm max-w-[80%] border border-emerald-200/50 dark:border-emerald-800/50">
                                        <p className="text-sm text-emerald-900 dark:text-emerald-100">{n}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Actual activities */}
                            {activities?.map((activity: any) => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                                        {activity.action.includes('call') ? <Phone className="h-3 w-3 text-slate-500" /> : 
                                         activity.action.includes('whatsapp') ? <MessageCircle className="h-3 w-3 text-slate-500" /> :
                                         activity.action.includes('status') ? <ArrowRightLeft className="h-3 w-3 text-slate-500" /> :
                                         <div className="w-2 h-2 rounded-full bg-slate-400" />}
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-2xl rounded-tl-sm max-w-[80%] border border-border/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm capitalize">{activity.action.replace(/_/g, " ")}</span>
                                            <span className="text-xs text-muted-foreground">{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Quick Note Input */}
                    <div className="p-4 border-t border-border/50 bg-background flex gap-2">
                        <Input 
                            placeholder="Type a quick note..." 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                            className="bg-muted/50 flex-1"
                        />
                        <Button variant="outline" size="icon" title="Voice to text (Coming soon)">
                            <Mic className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" onClick={handleAddNote}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Right Side: Action Center (30%) */}
                <div className="w-[350px] flex flex-col gap-4">
                    {/* AI Suggestion - at TOP */}
                    <Card className="p-4 border-indigo-500/20 bg-indigo-500/5">
                        <h3 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-1 flex items-center gap-2">
                            <SparkleIcon className="h-4 w-4" /> AI Suggestion
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {lead.status === "new" ? "Call immediately to prevent SLA breach." : "Schedule a site visit to push towards qualification."}
                        </p>
                    </Card>

                    <Card className="p-4 border-realty-gold/30 bg-gradient-to-b from-realty-gold/5 to-transparent shadow-sm">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Primary Actions</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 gap-2" onClick={handleCallClick}>
                                <Phone className="h-5 w-5" /> Call
                            </Button>
                            <Button className="w-full bg-[#25D366] hover:bg-[#20b858] text-white h-12 gap-2" onClick={handleWhatsAppClick}>
                                <MessageCircle className="h-5 w-5" /> WhatsApp
                            </Button>
                        </div>
                        <Button className="w-full h-12 gap-2" variant="outline" onClick={() => handleStatusChange("site_visit_scheduled")}>
                            <MapPin className="h-5 w-5" /> Schedule Visit
                        </Button>
                    </Card>

                    <Card className="p-4 shadow-sm border-border/50">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Status Update</h3>
                        <Select value={lead.status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
                            <SelectTrigger className="w-full h-12 font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="rnr">Ringing No Response</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="site_visit_scheduled">Visit Scheduled</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="won">Won / Booked</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </Card>

                    <Card className="p-4 shadow-sm border-border/50">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Next Follow Up
                        </h3>
                        <div className="space-y-3">
                            <Input 
                                type="datetime-local" 
                                value={toLocalDateTimeInput(lead.followUpAt)}
                                onChange={handleDateChange}
                                className="h-12 bg-muted/30"
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleQuickDate(1)}>Tomorrow</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickDate(2)}>2 Days</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickDate(7)}>Next Week</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 shadow-sm border-border/50">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" /> Assignment Info
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Current Owner</span>
                                <span className="font-medium">{users?.find((u: any) => u.id === lead.assignedToId)?.name || "Unassigned"}</span>
                            </div>
                            {canReassign && (
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowReassignModal(true)}>
                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                    Reassign Lead
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reassign Lead</DialogTitle>
                        <DialogDescription>
                            Select a new agent to reassign this lead to.
                        </DialogDescription>
                    </DialogHeader>
                    <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                            {users?.filter((u: any) => u.id !== lead.assignedToId).map((u: any) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReassignModal(false)}>Cancel</Button>
                        <Button onClick={handleReassign} disabled={!newAssigneeId || newAssigneeId === lead.assignedToId}>
                            <ArrowRightLeft className="h-4 w-4 mr-1" />
                            Reassign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MandatoryFollowUpModal
                open={showFollowUpModal}
                onOpenChange={(open) => {
                    setShowFollowUpModal(open)
                    if (!open) setPendingStatus(null)
                }}
                leadId={lead.id}
                currentStatus={pendingStatus || lead.status}
                onComplete={handleModalComplete}
            />

            <CallOutcomeModal
                open={showCallOutcomeModal}
                onOpenChange={setShowCallOutcomeModal}
                leadId={lead.id}
                leadName={lead.name}
                phoneNumber={lead.phone}
                onComplete={handleCallOutcomeComplete}
            />
        </div>
    )
}
