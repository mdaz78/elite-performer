import { z } from 'zod'

export const createTradeSchema = z.object({
  date: z.string().datetime(),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  setup: z.string().min(1, 'Setup is required').max(200),
  entry: z.number(),
  exit: z.number(),
  quantity: z.number().int().positive(),
  pnl: z.number(),
  emotion: z.string().max(100).optional(),
  notes: z.string().optional(),
})

export const updateTradeSchema = z.object({
  id: z.number(),
  date: z.string().datetime().optional(),
  symbol: z.string().min(1, 'Symbol is required').max(20).optional(),
  setup: z.string().min(1, 'Setup is required').max(200).optional(),
  entry: z.number().optional(),
  exit: z.number().optional(),
  quantity: z.number().int().positive().optional(),
  pnl: z.number().optional(),
  emotion: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const getTradesByDateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  symbol: z.string().optional(),
})

export type CreateTradeInput = z.infer<typeof createTradeSchema>
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>
export type GetTradesByDateRangeInput = z.infer<typeof getTradesByDateRangeSchema>
