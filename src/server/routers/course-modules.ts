import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createCourseModuleSchema,
  updateCourseModuleSchema,
  reorderModulesSchema,
} from '@/src/lib/validations/coding'

export const courseModulesRouter = router({
  getByCourseId: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify course ownership
      const course = await ctx.prisma.codingCourse.findFirst({
        where: { id: input.courseId, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return await ctx.prisma.courseModule.findMany({
        where: { courseId: input.courseId },
        orderBy: { order: 'asc' },
      })
    }),

  create: protectedProcedure
    .input(createCourseModuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify course ownership
      const course = await ctx.prisma.codingCourse.findFirst({
        where: { id: input.courseId, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return await ctx.prisma.courseModule.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(updateCourseModuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership through course
      const module = await ctx.prisma.courseModule.findUnique({
        where: { id },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      return await ctx.prisma.courseModule.update({
        where: { id },
        data: {
          ...data,
          completedAt: data.completedAt !== undefined
            ? data.completedAt
              ? new Date(data.completedAt)
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
      const module = await ctx.prisma.courseModule.findUnique({
        where: { id: input.id },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      await ctx.prisma.courseModule.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  reorder: protectedProcedure
    .input(reorderModulesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership through course
      const module = await ctx.prisma.courseModule.findUnique({
        where: { id: input.moduleId },
        include: { course: true },
      })

      if (!module || module.course.userId !== userId) {
        throw new Error('Module not found')
      }

      return await ctx.prisma.courseModule.update({
        where: { id: input.moduleId },
        data: { order: input.newOrder },
      })
    }),
})
