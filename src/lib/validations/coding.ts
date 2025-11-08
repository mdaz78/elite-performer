import { z } from 'zod'

export const createCodingCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(200),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
})

export const updateCodingCourseSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Course name is required').max(200).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
})

export const createCourseModuleSchema = z.object({
  courseId: z.number(),
  name: z.string().min(1, 'Module name is required').max(200),
  order: z.number().int().nonnegative(),
})

export const updateCourseModuleSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Module name is required').max(200).optional(),
  order: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().datetime().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
})

export const reorderModulesSchema = z.object({
  moduleId: z.number(),
  newOrder: z.number().int().nonnegative(),
})

export type CreateCodingCourseInput = z.infer<typeof createCodingCourseSchema>
export type UpdateCodingCourseInput = z.infer<typeof updateCodingCourseSchema>
export type CreateCourseModuleInput = z.infer<typeof createCourseModuleSchema>
export type UpdateCourseModuleInput = z.infer<typeof updateCourseModuleSchema>
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>
