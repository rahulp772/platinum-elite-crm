"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useUpdateLead } from "@/hooks/use-leads"
import { Loader2, Phone, MessageCircle, Calendar, ArrowLeft, Send, Sparkles as SparkleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MandatoryFollowUpModal } from "./mandatory-follow-up-modal"
import Link from "next/link"
import { format } from "date-fns"
import { LeadStatus } from "@/types/lead"
import { toast } from "sonner"

export function LeadDetailSplitView({ leadId }: { leadId: string }) {
    const updateLead = useUpdateLead()
    const [note, setNote] = React.useState("")
    const [showFollowUpModal, setShowFollowUpModal] = React.useState(false)
    const [pendingStatus, setPendingStatus] = React.useState<LeadStatus | null>(null)
    
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
        if (pendingStatus) {
            updateLead.mutate({ id: lead.id, status: pendingStatus }, {
                onSuccess: () => toast.success("Status updated")
            })
        }
        setShowFollowUpModal(false)
        setPendingStatus(null)
    }

    const handleModalSkip = () => {
        setShowFollowUpModal(false)
        setPendingStatus(null)
    }

    const handleCallClick = () => {
        window.open(`tel:${lead.phone}`)
        setShowFollowUpModal(true)
    }

    const handleWhatsAppClick = () => {
        const waNumber = lead.whatsappNumber || lead.phone
        window.open(`https://wa.me/${waNumber.replace(/\D/g, "")}`)
        setShowFollowUpModal(true)
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return;
        updateLead.mutate({ id: lead.id, followUpAt: new Date(e.target.value).toISOString() }, {
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
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {lead.name}
                        <Badge variant="outline" className="bg-primary/5 uppercase">{lead.status.replace(/_/g, " ")}</Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">{lead.phone} • {lead.email}</p>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Side: Activity Timeline (70%) */}
                <Card className="flex-1 flex flex-col border-border/50 overflow-hidden">
                    <div className="p-4 border-b border-border/50 bg-muted/20 flex gap-4 text-sm">
                        <div><span className="text-muted-foreground">Budget:</span> <span className="font-medium">₹{(lead.budgetMax / 100000).toFixed(0)}L</span></div>
                        <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{lead.preferredLocation || "Any"}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{lead.propertyType || "Any"}</span></div>
                        <div><span className="text-muted-foreground">Score:</span> <span className="font-medium">{lead.score || 0}</span></div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            {/* Notes displayed as timeline events for MVP */}
                            {lead.notes?.split('\n').filter(Boolean).map((n: string, i: number) => (
                                <div key={`note-${i}`} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-lg flex-1 border border-border/50">
                                        <p className="text-sm">{n}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Actual activities */}
                            {activities?.map((activity: any) => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{activity.action.replace(/_/g, " ")}</span>
                                            <span className="text-xs text-muted-foreground">{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
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
                            className="bg-muted/50"
                        />
                        <Button size="icon" onClick={handleAddNote}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Right Side: Action Center (30%) */}
                <div className="w-[350px] flex flex-col gap-4">
                    <Card className="p-4 border-realty-gold/30 bg-gradient-to-b from-realty-gold/5 to-transparent shadow-sm">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Primary Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 gap-2" onClick={handleCallClick}>
                                <Phone className="h-5 w-5" /> Call
                            </Button>
                            <Button className="w-full bg-[#25D366] hover:bg-[#20b858] text-white h-12 gap-2" onClick={handleWhatsAppClick}>
                                <MessageCircle className="h-5 w-5" /> WhatsApp
                            </Button>
                        </div>
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
                                value={lead.followUpAt ? new Date(lead.followUpAt).toISOString().slice(0, 16) : ""}
                                onChange={handleDateChange}
                                className="h-12 bg-muted/30"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDateChange({ target: { value: new Date(Date.now() + 86400000).toISOString() } } as any)}>Tomorrow</Button>
                                <Button variant="outline" size="sm" onClick={() => handleDateChange({ target: { value: new Date(Date.now() + 86400000 * 2).toISOString() } } as any)}>2 Days</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-indigo-500/20 bg-indigo-500/5 mt-auto">
                        <h3 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-1 flex items-center gap-2">
                            <SparkleIcon className="h-4 w-4" /> AI Suggestion
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {lead.status === "new" ? "Call immediately to prevent SLA breach." : "Schedule a site visit to push towards qualification."}
                        </p>
                    </Card>
                </div>
            </div>

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
        </div>
    )
}
