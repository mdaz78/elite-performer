import { z } from 'zod'

const projectStatusEnum = z.enum(['active', 'completed', 'paused'])

export const createTaskProjectSchema = z.object({
  name: z.string().min(1, 'Task project name is required').max(200),
  description: z.string().optional(),
  status: projectStatusEnum.optional().default('active'),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
})

export const updateTaskProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Task project name is required').max(200).optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
})

export type CreateTaskProjectInput = z.infer<typeof createTaskProjectSchema>
export type UpdateTaskProjectInput = z.infer<typeof updateTaskProjectSchema>
