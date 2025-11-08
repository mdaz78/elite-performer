import { z } from 'zod'

const habitFrequencyEnum = z.enum(['daily', 'weekly', 'custom'])
const habitStatusEnum = z.enum(['active', 'paused'])

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(200),
  frequency: habitFrequencyEnum.default('daily'),
  customDays: z.array(z.number().min(0).max(6)).optional().nullable(), // 0=Sunday, 1=Monday, etc.
  targetCount: z.number().int().min(1).default(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
})

export const updateHabitSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Habit name is required').max(200).optional(),
  frequency: habitFrequencyEnum.optional(),
  customDays: z.array(z.number().min(0).max(6)).optional().nullable(),
  targetCount: z.number().int().min(1).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: habitStatusEnum.optional(),
})

export const createSubHabitSchema = z.object({
  habitId: z.number(),
  name: z.string().min(1, 'Sub-habit name is required').max(200),
  order: z.number().int().min(0).default(0),
})

export const updateSubHabitSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Sub-habit name is required').max(200).optional(),
  order: z.number().int().min(0).optional(),
})

export const markSubHabitCompletionSchema = z.object({
  subHabitId: z.number(),
  date: z.string().datetime(), // ISO datetime string
  completed: z.boolean().default(true),
})

export const markHabitCompletionSchema = z.object({
  habitId: z.number(),
  date: z.string().datetime(), // ISO datetime string
  completed: z.boolean().default(true),
})

export const getHabitsByDateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type CreateSubHabitInput = z.infer<typeof createSubHabitSchema>
export type UpdateSubHabitInput = z.infer<typeof updateSubHabitSchema>
export type MarkSubHabitCompletionInput = z.infer<typeof markSubHabitCompletionSchema>
export type MarkHabitCompletionInput = z.infer<typeof markHabitCompletionSchema>
export type GetHabitsByDateRangeInput = z.infer<typeof getHabitsByDateRangeSchema>
