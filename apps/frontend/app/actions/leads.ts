'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthHeaders } from '@/lib/auth'

// Types for lead mutations
export interface CreateLeadInput {
  name: string
  email: string
  phone: string
  status?: string
  source?: string
  budgetMin?: number
  budgetMax?: number
  preferredLocation?: string
  propertyType?: string
  notes?: string
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string
  status?: string
  followUpAt?: string | null
  notes?: string
}

// Server Action: Create a new lead
export async function createLead(data: CreateLeadInput) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create lead')
  }

  const lead = await response.json()
  
  // Revalidate the leads page to reflect new data
  revalidatePath('/leads')
  revalidatePath('/leads/[id]')
  
  return lead
}

// Server Action: Update an existing lead
export async function updateLead(data: UpdateLeadInput) {
  const { id, ...leadData } = data
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update lead')
  }

  const lead = await response.json()
  
  // Revalidate relevant pages
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  
  return lead
}

// Server Action: Delete a lead
export async function deleteLead(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete lead')
  }

  // Revalidate the leads page
  revalidatePath('/leads')
}

// Server Action: Assign lead to agent
export async function assignLead(leadId: string, assignedToId: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${leadId}/reassign`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignedToId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to assign lead')
  }

  const lead = await response.json()
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${leadId}`)
  
  return lead
}

// Server Action: Bulk assign leads
export async function bulkAssignLeads(leadIds: string[], assignedToId: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/bulk-assign`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ leadIds, assignedToId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to bulk assign leads')
  }

  revalidatePath('/leads')
}

// Server Action: Update lead status
export async function updateLeadStatus(leadId: string, status: string, followUpAt?: string) {
  const headers = await getAuthHeaders()
  
  const updateData: any = { status }
  if (followUpAt !== undefined) {
    updateData.followUpAt = followUpAt
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${leadId}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update lead status')
  }

  const lead = await response.json()
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${leadId}`)
  
  return lead
}