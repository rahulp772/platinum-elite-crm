import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  relatedToId: z.string().optional(),
  relatedToType: z.enum(['lead', 'property', 'deal']).optional(),
  assignedToId: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

export const taskUpdateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
})

export type TaskUpdateData = z.infer<typeof taskUpdateSchema>