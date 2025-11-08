import { z } from 'zod'

export const createFitnessLogSchema = z.object({
  date: z.string().datetime(),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  waist: z.number().positive().optional(),
  calories: z.number().int().positive().optional(),
  workoutType: z.string().max(100).optional(),
  notes: z.string().optional(),
})

export const updateFitnessLogSchema = z.object({
  id: z.number(),
  date: z.string().datetime().optional(),
  weight: z.number().positive().optional().nullable(),
  bodyFat: z.number().min(0).max(100).optional().nullable(),
  waist: z.number().positive().optional().nullable(),
  calories: z.number().int().positive().optional().nullable(),
  workoutType: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const getFitnessLogsByDateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export type CreateFitnessLogInput = z.infer<typeof createFitnessLogSchema>
export type UpdateFitnessLogInput = z.infer<typeof updateFitnessLogSchema>
export type GetFitnessLogsByDateRangeInput = z.infer<typeof getFitnessLogsByDateRangeSchema>
