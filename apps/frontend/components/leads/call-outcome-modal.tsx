"use client"

import * as React from "react"
import { Phone, PhoneOff, MessageSquare, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const callOutcomes = [
    { id: "connected", label: "Connected", description: "Spoke with lead directly" },
    { id: "not_connected", label: "No Response", description: "Ringing, no answer" },
    { id: "voicemail", label: "Voicemail", description: "Left a voicemail" },
    { id: "will_callback", label: "Will Call Back", description: "Lead will call back" },
    { id: "wrong_number", label: "Wrong Number", description: "Number not in service" },
]

interface CallOutcomeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    leadId: string
    leadName: string
    phoneNumber: string
    onComplete: (outcome: string, notes: string) => void
}

export function CallOutcomeModal({
    open,
    onOpenChange,
    leadId,
    leadName,
    phoneNumber,
    onComplete,
}: CallOutcomeModalProps) {
    const [selectedOutcome, setSelectedOutcome] = React.useState("")
    const [notes, setNotes] = React.useState("")
    const [isCalling, setIsCalling] = React.useState(false)

    const handleStartCall = () => {
        setIsCalling(true)
        window.open(`tel:${phoneNumber}`)
    }

    const handleComplete = () => {
        if (!selectedOutcome || selectedOutcome === "select") {
            toast.error("Please select a call outcome")
            return
        }
        onComplete(selectedOutcome, notes)
        setSelectedOutcome("")
        setNotes("")
        setIsCalling(false)
        onOpenChange(false)
    }

    const handleClose = () => {
        setSelectedOutcome("")
        setNotes("")
        setIsCalling(false)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Log Call</DialogTitle>
                    <DialogDescription>
                        Call {leadName} at {phoneNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Start Call Button */}
                    {!isCalling && (
                        <Button
                            className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleStartCall}
                        >
                            <Phone className="mr-2 h-5 w-5" />
                            Start Call
                        </Button>
                    )}

                    {/* Call Outcome Options */}
                    {isCalling && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Call Outcome</Label>
                                <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select outcome" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {callOutcomes.map((outcome) => (
                                            <SelectItem key={outcome.id} value={outcome.id}>
                                                <div>
                                                    <div className="font-medium">{outcome.label}</div>
                                                    <div className="text-sm text-muted-foreground">{outcome.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="call-notes" className="text-sm font-medium">
                                    Notes (optional)
                                </Label>
                                <Textarea
                                    id="call-notes"
                                    placeholder="Add notes about the call..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {isCalling && (
                        <Button onClick={handleComplete} disabled={!selectedOutcome || selectedOutcome === "select"}>
                            Save Outcome
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}