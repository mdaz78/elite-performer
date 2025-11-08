import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createTradingCourseModuleSchema,
  updateTradingCourseModuleSchema,
  reorderTradingCourseModulesSchema,
} from '@/src/lib/validations/trading-courses'

export const tradingCourseModulesRouter = router({
  getByCourseId: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify course ownership
      const course = await ctx.prisma.tradingCourse.findFirst({
        where: { id: input.courseId, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return await ctx.prisma.tradingCourseModule.findMany({
        where: { courseId: input.courseId },
        orderBy: { order: 'asc' },
      })
    }),

  create: protectedProcedure
    .input(createTradingCourseModuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify course ownership
      const course = await ctx.prisma.tradingCourse.findFirst({
        where: { id: input.courseId, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return await ctx.prisma.tradingCourseModule.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(updateTradingCourseModuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership through course
      const module = await ctx.prisma.tradingCourseModule.findUnique({
        where: { id },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      return await ctx.prisma.tradingCourseModule.update({
        where: { id },
        data: {
          ...data,
          completedAt: data.completedAt !== undefined
            ? data.completedAt
              ? new Date(data.completedAt)
              : null
            : undefined,
          scheduledDate: data.scheduledDate !== undefined
            ? data.scheduledDate
              ? new Date(data.scheduledDate)
              : null
            : undefined,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership through course
      const module = await ctx.prisma.tradingCourseModule.findUnique({
        where: { id: input.id },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      await ctx.prisma.tradingCourseModule.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  reorder: protectedProcedure
    .input(reorderTradingCourseModulesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership through course
      const module = await ctx.prisma.tradingCourseModule.findUnique({
        where: { id: input.moduleId },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      return await ctx.prisma.tradingCourseModule.update({
        where: { id: input.moduleId },
        data: { order: input.newOrder },
      })
    }),
})
