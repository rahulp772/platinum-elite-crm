export type DealStage = "lead" | "negotiation" | "under_contract" | "closed"
export type DealPriority = "low" | "medium" | "high"

export interface Deal {
    id: string
    title: string
    value: number
    stage: DealStage
    customerName: string
    customerEmail: string
    propertyName: string
    expectedCloseDate: Date
    priority: DealPriority
    agent: string
    createdAt: Date
    updatedAt: Date
}

export const dealStages: { id: DealStage; label: string; color: string }[] = [
    { id: "lead", label: "Lead", color: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    { id: "negotiation", label: "Negotiation", color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
    { id: "under_contract", label: "Under Contract", color: "bg-teal-500/10 text-teal-700 border-teal-500/20" },
    { id: "closed", label: "Closed", color: "bg-realty-gold/20 text-realty-gold-dark border-realty-gold/30" },
]
