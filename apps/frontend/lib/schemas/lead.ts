import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  status: z.enum([
    'new', 
    'contacted', 
    'rnr', 
    'qualified', 
    'site_visit_scheduled', 
    'site_visit_done', 
    'negotiation', 
    'won', 
    'lost'
  ]).optional(),
  source: z.enum([
    'website', 
    'referral', 
    'social', 
    'cold_call', 
    'event', 
    '99acres', 
    'magicbricks', 
    'housing.com', 
    'google_ads', 
    'facebook', 
    'channel_partner'
  ]).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredLocation: z.string().optional(),
  propertyType: z.enum([
    '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK',
    'Penthouse', 'Plot', 'Row House', 'Villa', 'Apartment'
  ]).optional(),
  bedroom: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>

export const leadFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  assignedToId: z.string().optional(),
  propertyType: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  followUpFrom: z.date().optional(),
  followUpTo: z.date().optional(),
})

export type LeadFilterData = z.infer<typeof leadFilterSchema>