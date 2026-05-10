'use server'

import { revalidatePath } from 'next/cache'
import { getAuthHeaders } from '@/lib/auth'

// Types for property mutations
export interface CreatePropertyInput {
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  status?: string
  type: string
  bedrooms?: number
  bathrooms?: number
  sqft: number
  yearBuilt?: number
  lotSize?: number
  description: string
  features?: string[]
  images?: string[]
  // RERA & India Specific Fields
  builderId?: string
  reraNumber?: string
  reraAuthority?: string
  reraWebsite?: string
  landParcel?: string
  surveyNumber?: string
  carpetArea?: number
  builtUpArea?: number
  superBuiltUpArea?: number
  basePrice?: number
  pricePerSqft?: number
  bookingAmount?: number
  paymentPlan?: string
  plc?: number
  gst?: number
  parking?: number
  launchDate?: string
  possessionDate?: string
  constructionStatus?: string
  ccUrl?: string
  ocUrl?: string
}


export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  id: string
}

// Server Action: Create a new property
export async function createProperty(data: CreatePropertyInput) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create property')
  }

  const property = await response.json()
  
  revalidatePath('/properties')
  
  return property
}

// Server Action: Update an existing property
export async function updateProperty(data: UpdatePropertyInput) {
  const { id, ...propertyData } = data
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propertyData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update property')
  }

  const property = await response.json()
  
  revalidatePath('/properties')
  
  return property
}

// Server Action: Delete a property
export async function deleteProperty(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete property')
  }

  revalidatePath('/properties')
}

// Server Action: Update property status
export async function updatePropertyStatus(propertyId: string, status: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties/${propertyId}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update property status')
  }

  const property = await response.json()
  
  revalidatePath('/properties')
  revalidatePath(`/properties/${propertyId}`)
  
  return property
}