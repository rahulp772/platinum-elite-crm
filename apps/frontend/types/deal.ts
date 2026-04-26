export type DealStage = "lead" | "negotiation" | "under_contract" | "closed"
export type DealPriority = "low" | "medium" | "high"

export type DealActivityAction = 
    | "created"
    | "stage_changed"
    | "note_added"
    | "value_updated"
    | "property_linked"
    | "property_unlinked"
    | "assigned"
    | "reassigned"
    | "priority_changed"
    | "expected_close_updated"
    | "viewed"

export interface Deal {
    id: string
    title: string
    value: number
    stage: DealStage
    customerName: string
    customerEmail: string
    property?: {
        id: string
        title: string
    }
    expectedCloseDate?: Date
    priority: DealPriority
    agent: {
        id: string
        name: string
    }
    createdAt: Date
    updatedAt: Date
    activities?: DealActivity[]
}

export interface DealActivity {
    id: string
    dealId: string
    userId: string
    user?: {
        id: string
        name: string
    }
    action: DealActivityAction
    oldValue?: string
    newValue?: string
    description?: string
    timestamp: Date
}

export const dealStages: { id: DealStage; label: string; color: string }[] = [
    { id: "lead", label: "Lead", color: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    { id: "negotiation", label: "Negotiation", color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
    { id: "under_contract", label: "Under Contract", color: "bg-teal-500/10 text-teal-700 border-teal-500/20" },
    { id: "closed", label: "Closed", color: "bg-realty-gold/20 text-realty-gold-dark border-realty-gold/30" },
]