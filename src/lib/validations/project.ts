import { z } from 'zod'

const projectStatusEnum = z.enum(['active', 'completed', 'paused'])

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().optional(),
  status: projectStatusEnum.optional().default('active'),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
})

export const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Project name is required').max(200).optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
})

const taskTypeEnum = z.enum(['DeepWork', 'Gym', 'TradingPractice', 'Coding', 'Review', 'Other'])

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  type: taskTypeEnum,
  taskProjectId: z.number().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
})

export const updateTaskSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Task title is required').max(200).optional(),
  type: taskTypeEnum.optional(),
  taskProjectId: z.number().optional().nullable(),
  completed: z.boolean().optional(),
  scheduledDate: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
})

export const getTasksByDateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: taskTypeEnum.optional(),
  taskProjectId: z.number().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type GetTasksByDateInput = z.infer<typeof getTasksByDateSchema>
