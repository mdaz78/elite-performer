import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import {
  createProjectSchema,
  updateProjectSchema,
} from '@/src/lib/validations/project'

export const projectsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.project.findMany({
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

      const project = await ctx.prisma.project.findFirst({
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

      if (!project) {
        throw new Error('Project not found')
      }

      return project
    }),

  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.project.create({
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
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const project = await ctx.prisma.project.findFirst({
        where: { id, userId },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      return await ctx.prisma.project.update({
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
      const project = await ctx.prisma.project.findFirst({
        where: { id: input.id, userId },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      await ctx.prisma.project.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
