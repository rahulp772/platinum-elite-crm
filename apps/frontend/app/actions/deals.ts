'use server'

import { revalidatePath } from 'next/cache'
import { getAuthHeaders } from '@/lib/auth'

export interface CreateDealInput {
  title: string
  value: number
  stage?: string
  propertyId?: string
  leadId?: string
  assignedToId?: string
  notes?: string
  expectedCloseDate?: string
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  id: string
}

export async function createDeal(data: CreateDealInput) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create deal')
  }

  const deal = await response.json()
  
  revalidatePath('/deals')
  revalidatePath('/pipeline')
  
  return deal
}

export async function updateDeal(data: UpdateDealInput) {
  const { id, ...dealData } = data
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update deal')
  }

  const deal = await response.json()
  
  revalidatePath('/deals')
  revalidatePath('/pipeline')
  
  return deal
}

export async function deleteDeal(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete deal')
  }

  revalidatePath('/deals')
  revalidatePath('/pipeline')
}

export async function updateDealStage(dealId: string, stage: string, notes?: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals/${dealId}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stage, notes }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update deal stage')
  }

  const deal = await response.json()
  
  revalidatePath('/deals')
  revalidatePath('/pipeline')
  
  return deal
}

export async function reassignDeal(dealId: string, assignedToId: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals/${dealId}/reassign`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignedToId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to reassign deal')
  }

  const deal = await response.json()
  
  revalidatePath('/deals')
  
  return deal
}