import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createCodingCourseSchema,
  updateCodingCourseSchema,
} from '@/src/lib/validations/coding'

export const codingCoursesRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.codingCourse.findMany({
      where: { userId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const course = await ctx.prisma.codingCourse.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          modules: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return course
    }),

  create: protectedProcedure
    .input(createCodingCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.codingCourse.create({
        data: {
          ...input,
          userId,
          startDate: input.startDate ? new Date(input.startDate) : null,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
        },
        include: {
          modules: true,
        },
      })
    }),

  update: protectedProcedure
    .input(updateCodingCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const course = await ctx.prisma.codingCourse.findFirst({
        where: { id, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      return await ctx.prisma.codingCourse.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate !== undefined
            ? data.startDate
              ? new Date(data.startDate)
              : null
            : undefined,
          targetDate: data.targetDate !== undefined
            ? data.targetDate
              ? new Date(data.targetDate)
              : null
            : undefined,
        },
        include: {
          modules: {
            orderBy: { order: 'asc' },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const course = await ctx.prisma.codingCourse.findFirst({
        where: { id: input.id, userId },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      await ctx.prisma.codingCourse.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
