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
          taskProject: {
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
          taskProject: true,
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
          ...(input.taskProjectId && { taskProjectId: input.taskProjectId }),
        },
        include: {
          taskProject: {
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

      // If taskProjectId is provided, verify ownership
      if (input.taskProjectId) {
        const taskProject = await ctx.prisma.taskProject.findFirst({
          where: { id: input.taskProjectId, userId },
        })

        if (!taskProject) {
          throw new Error('Task project not found')
        }
      }

      return await ctx.prisma.task.create({
        data: {
          title: input.title,
          type: input.type,
          taskProjectId: input.taskProjectId,
          userId,
          scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        },
        include: {
          taskProject: true,
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

      // If updating taskProjectId, verify new task project ownership
      if (data.taskProjectId) {
        const taskProject = await ctx.prisma.taskProject.findFirst({
          where: { id: data.taskProjectId, userId },
        })

        if (!taskProject) {
          throw new Error('Task project not found')
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
          taskProject: true,
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

  getScheduledModules: protectedProcedure
    .input(getTasksByDateSchema.pick({ startDate: true, endDate: true }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const [codingModules, tradingModules] = await Promise.all([
        ctx.prisma.courseModule.findMany({
          where: {
            scheduledDate: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
            course: {
              userId,
            },
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { scheduledDate: 'asc' },
        }),
        ctx.prisma.tradingCourseModule.findMany({
          where: {
            scheduledDate: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
            course: {
              userId,
            },
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { scheduledDate: 'asc' },
        }),
      ])

      return [
        ...codingModules.map((module) => ({
          id: module.id,
          name: module.name,
          scheduledDate: module.scheduledDate,
          courseId: module.courseId,
          courseName: module.course.name,
          courseType: 'coding' as const,
          completed: module.completed,
          order: module.order,
        })),
        ...tradingModules.map((module) => ({
          id: module.id,
          name: module.name,
          scheduledDate: module.scheduledDate,
          courseId: module.courseId,
          courseName: module.course.name,
          courseType: 'trading' as const,
          completed: module.completed,
          order: module.order,
        })),
      ]
    }),
})
