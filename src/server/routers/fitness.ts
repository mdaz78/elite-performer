import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createFitnessLogSchema,
  updateFitnessLogSchema,
  getFitnessLogsByDateRangeSchema,
} from '@/src/lib/validations/fitness'

export const fitnessRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.fitnessLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.string().datetime() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const date = new Date(input.date)

      return await ctx.prisma.fitnessLog.findFirst({
        where: {
          userId,
          date,
        },
      })
    }),

  getByDateRange: protectedProcedure
    .input(getFitnessLogsByDateRangeSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.fitnessLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
        orderBy: { date: 'asc' },
      })
    }),

  create: protectedProcedure
    .input(createFitnessLogSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.fitnessLog.create({
        data: {
          ...input,
          userId,
          date: new Date(input.date),
        },
      })
    }),

  update: protectedProcedure
    .input(updateFitnessLogSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const log = await ctx.prisma.fitnessLog.findFirst({
        where: { id, userId },
      })

      if (!log) {
        throw new Error('Fitness log not found')
      }

      return await ctx.prisma.fitnessLog.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const log = await ctx.prisma.fitnessLog.findFirst({
        where: { id: input.id, userId },
      })

      if (!log) {
        throw new Error('Fitness log not found')
      }

      await ctx.prisma.fitnessLog.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const logs = await ctx.prisma.fitnessLog.findMany({
        where: {
          userId,
          ...(input.startDate && input.endDate
            ? {
                date: {
                  gte: new Date(input.startDate),
                  lte: new Date(input.endDate),
                },
              }
            : {}),
        },
        orderBy: { date: 'asc' },
      })

      // Calculate statistics
      const weights = logs.map((l) => l.weight).filter((w): w is number => w !== null)
      const bodyFats = logs.map((l) => l.bodyFat).filter((bf): bf is number => bf !== null)
      const waists = logs.map((l) => l.waist).filter((w): w is number => w !== null)

      return {
        totalLogs: logs.length,
        avgWeight: weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null,
        avgBodyFat: bodyFats.length > 0 ? bodyFats.reduce((a, b) => a + b, 0) / bodyFats.length : null,
        avgWaist: waists.length > 0 ? waists.reduce((a, b) => a + b, 0) / waists.length : null,
        latestWeight: weights.length > 0 ? weights[weights.length - 1] : null,
        latestBodyFat: bodyFats.length > 0 ? bodyFats[bodyFats.length - 1] : null,
        latestWaist: waists.length > 0 ? waists[waists.length - 1] : null,
      }
    }),
})
