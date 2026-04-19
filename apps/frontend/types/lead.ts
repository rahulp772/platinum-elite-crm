export type LeadStatus = "new" | "contacted" | "qualified" | "lost"
export type LeadSource = "website" | "referral" | "social" | "cold_call" | "event"

export interface Lead {
    id: string
    name: string
    email: string
    phone: string
    status: LeadStatus
    source: LeadSource
    budget: number
    location: string
    propertyType: string
    notes: string
    assignedTo: string
    createdAt: Date
    lastContact?: Date
}
