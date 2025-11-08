import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createTaskProjectSchema,
  updateTaskProjectSchema,
} from '@/src/lib/validations/task-project'

export const taskProjectsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.taskProject.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const taskProject = await ctx.prisma.taskProject.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          tasks: {
            orderBy: { scheduledDate: 'desc' },
          },
        },
      })

      if (!taskProject) {
        throw new Error('Task project not found')
      }

      return taskProject
    }),

  create: protectedProcedure
    .input(createTaskProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.taskProject.create({
        data: {
          ...input,
          userId,
          startDate: input.startDate ? new Date(input.startDate) : null,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
        },
        include: {
          tasks: true,
        },
      })
    }),

  update: protectedProcedure
    .input(updateTaskProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const taskProject = await ctx.prisma.taskProject.findFirst({
        where: { id, userId },
      })

      if (!taskProject) {
        throw new Error('Task project not found')
      }

      return await ctx.prisma.taskProject.update({
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
          tasks: true,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const taskProject = await ctx.prisma.taskProject.findFirst({
        where: { id: input.id, userId },
      })

      if (!taskProject) {
        throw new Error('Task project not found')
      }

      await ctx.prisma.taskProject.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
