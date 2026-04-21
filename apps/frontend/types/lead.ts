export type LeadStatus = 
  | "new"
  | "contacted"
  | "rnr"
  | "qualified"
  | "site_visit_scheduled"
  | "site_visit_done"
  | "negotiation"
  | "booked"
  | "lost"

export type LeadSource = 
  | "website"
  | "referral"
  | "social"
  | "cold_call"
  | "event"
  | "99acres"
  | "magicbricks"
  | "housing.com"
  | "google_ads"
  | "facebook"
  | "channel_partner"

export type LostReason = 
  | "budget"
  | "location"
  | "bought_elsewhere"
  | "not_responding"
  | "already_bought"
  | "delayed"
  | "other"

export type PropertyType = 
  | "1 BHK"
  | "2 BHK"
  | "3 BHK"
  | "4 BHK"
  | "5 BHK"
  | "Penthouse"
  | "Plot"
  | "Row House"
  | "Villa"
  | "Apartment"

export type LeadActivityAction = 
  | "created"
  | "status_changed"
  | "assigned"
  | "note_added"
  | "budget_updated"
  | "source_updated"
  | "followup_scheduled"
  | "site_visit_scheduled"
  | "site_visit_done"
  | "re_inquiry"
  | "viewed"

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: LeadStatus
  source: LeadSource
  budgetMin?: number
  budgetMax?: number
  preferredLocation?: string
  propertyType?: PropertyType
  bedroom?: number
  notes: string
  assignedTo?: {
    id: string
    name: string
  }
  assignedToId?: string
  createdAt: Date
  updatedAt?: Date
  lastContact?: Date
  followUpAt?: string | Date
  siteVisitScheduledAt?: string | Date
  siteVisitDoneAt?: string | Date
  lostReason?: LostReason
  lostAt?: string | Date
  whatsappNumber?: string
}

export interface LeadActivity {
  id: string
  leadId: string
  userId: string
  user?: {
    id: string
    name: string
  }
  action: LeadActivityAction
  oldValue?: string
  newValue?: string
  description?: string
  timestamp: Date
}

export interface LeadLookupResult {
  status: LeadStatus
  assignedTo: string
}