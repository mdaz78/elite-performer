import { z } from 'zod'

export const createReviewSchema = z.object({
  weekStartDate: z.string().datetime(),
  wins: z.string().min(1, 'Wins are required'),
  mistakes: z.string().min(1, 'Mistakes are required'),
  nextWeekGoals: z.string().min(1, 'Next week goals are required'),
  metrics: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
})

export const updateReviewSchema = z.object({
  id: z.number(),
  weekStartDate: z.string().datetime().optional(),
  wins: z.string().min(1, 'Wins are required').optional(),
  mistakes: z.string().min(1, 'Mistakes are required').optional(),
  nextWeekGoals: z.string().min(1, 'Next week goals are required').optional(),
  metrics: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().nullable(),
})

export const getReviewByWeekSchema = z.object({
  weekStartDate: z.string().datetime(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type GetReviewByWeekInput = z.infer<typeof getReviewByWeekSchema>
