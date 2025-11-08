import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createTradeSchema,
  updateTradeSchema,
  getTradesByDateRangeSchema,
} from '@/src/lib/validations/trading'

export const tradesRouter = router({
  getAll: protectedProcedure
    .input(getTradesByDateRangeSchema.optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.trade.findMany({
        where: {
          userId,
          ...(input?.startDate && input?.endDate
            ? {
                date: {
                  gte: new Date(input.startDate),
                  lte: new Date(input.endDate),
                },
              }
            : {}),
          ...(input?.symbol && { symbol: input.symbol }),
        },
        orderBy: { date: 'desc' },
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const trade = await ctx.prisma.trade.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!trade) {
        throw new Error('Trade not found')
      }

      return trade
    }),

  create: protectedProcedure
    .input(createTradeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.trade.create({
        data: {
          ...input,
          userId,
          date: new Date(input.date),
        },
      })
    }),

  update: protectedProcedure
    .input(updateTradeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const trade = await ctx.prisma.trade.findFirst({
        where: { id, userId },
      })

      if (!trade) {
        throw new Error('Trade not found')
      }

      return await ctx.prisma.trade.update({
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
      const trade = await ctx.prisma.trade.findFirst({
        where: { id: input.id, userId },
      })

      if (!trade) {
        throw new Error('Trade not found')
      }

      await ctx.prisma.trade.delete({
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

      const trades = await ctx.prisma.trade.findMany({
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

      const totalTrades = trades.length
      const winningTrades = trades.filter((t) => t.pnl > 0).length
      const losingTrades = trades.filter((t) => t.pnl < 0).length
      const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
      const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

      const avgWin = winningTrades > 0
        ? trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades
        : 0
      const avgLoss = losingTrades > 0
        ? trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades
        : 0

      return {
        totalTrades,
        winningTrades,
        losingTrades,
        totalPnL,
        avgPnL,
        winRate,
        avgWin,
        avgLoss,
        profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0,
      }
    }),
})
