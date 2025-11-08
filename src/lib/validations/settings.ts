import { z } from 'zod'

export const upsertSettingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100),
  value: z.string(),
})

export const getSettingByKeySchema = z.object({
  key: z.string().min(1, 'Key is required'),
})

export const deleteSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
})

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>
export type GetSettingByKeyInput = z.infer<typeof getSettingByKeySchema>
export type DeleteSettingInput = z.infer<typeof deleteSettingSchema>
