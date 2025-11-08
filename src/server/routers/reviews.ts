import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, protectedProcedure } from '../trpc'
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewByWeekSchema,
} from '@/src/lib/validations/review'

export const reviewsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.review.findMany({
      where: { userId },
      orderBy: { weekStartDate: 'desc' },
    })
  }),

  getByWeek: protectedProcedure
    .input(getReviewByWeekSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.review.findFirst({
        where: {
          userId,
          weekStartDate: new Date(input.weekStartDate),
        },
      })
    }),

  create: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.review.create({
        data: {
          ...input,
          userId,
          weekStartDate: new Date(input.weekStartDate),
        },
      })
    }),

  update: protectedProcedure
    .input(updateReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, metrics, ...data } = input

      // Verify ownership
      const review = await ctx.prisma.review.findFirst({
        where: { id, userId },
      })

      if (!review) {
        throw new Error('Review not found')
      }

      return await ctx.prisma.review.update({
        where: { id },
        data: {
          ...data,
          weekStartDate: data.weekStartDate
            ? new Date(data.weekStartDate)
            : undefined,
          metrics: metrics !== undefined
            ? (metrics === null ? Prisma.JsonNull : metrics)
            : undefined,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const review = await ctx.prisma.review.findFirst({
        where: { id: input.id, userId },
      })

      if (!review) {
        throw new Error('Review not found')
      }

      await ctx.prisma.review.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
