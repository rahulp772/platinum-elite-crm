import { z } from 'zod'

export const dealSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  value: z.number().min(0, 'Value must be a positive number'),
  stage: z.enum(['lead', 'negotiation', 'under_contract', 'closed']).optional(),
  propertyId: z.string().optional(),
  leadId: z.string().optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  expectedCloseDate: z.string().optional(),
})

export type DealFormData = z.infer<typeof dealSchema>

export const dealStageSchema = z.object({
  stage: z.enum(['lead', 'negotiation', 'under_contract', 'closed']),
  notes: z.string().optional(),
})

export type DealStageUpdate = z.infer<typeof dealStageSchema>