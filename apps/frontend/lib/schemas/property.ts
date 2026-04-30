import { z } from 'zod'

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code is required'),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  sqft: z.number().min(1, 'Square footage is required'),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  lotSize: z.number().min(0).optional(),
  type: z.enum(['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land']),
  status: z.enum(['available', 'pending', 'sold', 'off_market']).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
})

export type PropertyFormData = z.infer<typeof propertySchema>

export const propertyFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
})

export type PropertyFilterData = z.infer<typeof propertyFilterSchema>