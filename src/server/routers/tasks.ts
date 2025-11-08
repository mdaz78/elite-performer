import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksByDateSchema,
} from '@/src/lib/validations/project'

export const tasksRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.task.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          project: true,
        },
      })

      if (!task) {
        throw new Error('Task not found')
      }

      return task
    }),

  getByDate: protectedProcedure
    .input(getTasksByDateSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.task.findMany({
        where: {
          userId,
          scheduledDate: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
          ...(input.type && { type: input.type }),
          ...(input.projectId && { projectId: input.projectId }),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      })
    }),

  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // If projectId is provided, verify ownership
      if (input.projectId) {
        const project = await ctx.prisma.project.findFirst({
          where: { id: input.projectId, userId },
        })

        if (!project) {
          throw new Error('Project not found')
        }
      }

      return await ctx.prisma.task.create({
        data: {
          ...input,
          userId,
          scheduledDate: new Date(input.scheduledDate),
        },
        include: {
          project: true,
        },
      })
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const task = await ctx.prisma.task.findFirst({
        where: { id, userId },
      })

      if (!task) {
        throw new Error('Task not found')
      }

      // If updating projectId, verify new project ownership
      if (data.projectId) {
        const project = await ctx.prisma.project.findFirst({
          where: { id: data.projectId, userId },
        })

        if (!project) {
          throw new Error('Project not found')
        }
      }

      return await ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          scheduledDate: data.scheduledDate
            ? new Date(data.scheduledDate)
            : undefined,
          completedAt: data.completedAt !== undefined
            ? data.completedAt
              ? new Date(data.completedAt)
              : null
            : undefined,
        },
        include: {
          project: true,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const task = await ctx.prisma.task.findFirst({
        where: { id: input.id, userId },
      })

      if (!task) {
        throw new Error('Task not found')
      }

      await ctx.prisma.task.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
