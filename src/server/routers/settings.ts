import { router, protectedProcedure } from '../trpc'
import {
  upsertSettingSchema,
  getSettingByKeySchema,
  deleteSettingSchema,
} from '@/src/lib/validations/settings'

export const settingsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.settings.findMany({
      where: { userId },
      orderBy: { key: 'asc' },
    })
  }),

  getByKey: protectedProcedure
    .input(getSettingByKeySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.settings.findFirst({
        where: {
          userId,
          key: input.key,
        },
      })
    }),

  upsert: protectedProcedure
    .input(upsertSettingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.settings.upsert({
        where: {
          userId_key: {
            userId,
            key: input.key,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          userId,
          key: input.key,
          value: input.value,
        },
      })
    }),

  delete: protectedProcedure
    .input(deleteSettingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const setting = await ctx.prisma.settings.findFirst({
        where: {
          userId,
          key: input.key,
        },
      })

      if (!setting) {
        throw new Error('Setting not found')
      }

      await ctx.prisma.settings.delete({
        where: { id: setting.id },
      })

      return { success: true }
    }),
})
