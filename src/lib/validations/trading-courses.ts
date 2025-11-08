import { z } from 'zod'

export const createTradingCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(200),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
})

export const updateTradingCourseSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Course name is required').max(200).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
})

export const createTradingCourseModuleSchema = z.object({
  courseId: z.number(),
  name: z.string().min(1, 'Module name is required').max(200),
  order: z.number().int().nonnegative(),
})

export const updateTradingCourseModuleSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Module name is required').max(200).optional(),
  order: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().datetime().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
})

export const reorderTradingCourseModulesSchema = z.object({
  moduleId: z.number(),
  newOrder: z.number().int().nonnegative(),
})

export type CreateTradingCourseInput = z.infer<typeof createTradingCourseSchema>
export type UpdateTradingCourseInput = z.infer<typeof updateTradingCourseSchema>
export type CreateTradingCourseModuleInput = z.infer<typeof createTradingCourseModuleSchema>
export type UpdateTradingCourseModuleInput = z.infer<typeof updateTradingCourseModuleSchema>
export type ReorderTradingCourseModulesInput = z.infer<typeof reorderTradingCourseModulesSchema>
