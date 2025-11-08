import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, protectedProcedure } from '../trpc'
import {
  createHabitSchema,
  updateHabitSchema,
  createSubHabitSchema,
  updateSubHabitSchema,
  markSubHabitCompletionSchema,
  markHabitCompletionSchema,
  getHabitsByDateRangeSchema,
} from '@/src/lib/validations/habits'
import dayjs from 'dayjs'

// Helper function to check if a date matches habit frequency and date range
function dateMatchesHabit(date: Date, habit: { frequency: string; customDays: number[] | null; startDate: Date | null; endDate: Date | null }): boolean {
  // Check date range
  if (habit.startDate && dayjs(date).isBefore(dayjs(habit.startDate), 'day')) {
    return false
  }
  if (habit.endDate && dayjs(date).isAfter(dayjs(habit.endDate), 'day')) {
    return false
  }

  const dayOfWeek = dayjs(date).day() // 0 = Sunday, 1 = Monday, etc.

  if (habit.frequency === 'daily') {
    return true
  } else if (habit.frequency === 'weekly') {
    // For weekly, we check if the day matches any custom day
    // If customDays is empty, it applies to all days (fallback to daily behavior)
    if (!habit.customDays || habit.customDays.length === 0) {
      return true
    }
    return habit.customDays.includes(dayOfWeek)
  } else if (habit.frequency === 'custom') {
    if (!habit.customDays || habit.customDays.length === 0) {
      return false
    }
    return habit.customDays.includes(dayOfWeek)
  }
  return false
}

export const habitsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return await ctx.prisma.habit.findMany({
      where: { userId },
      include: {
        subHabits: {
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

      const habit = await ctx.prisma.habit.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          subHabits: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      return habit
    }),

  getToday: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const today = dayjs().startOf('day').toDate()

    const habits = await ctx.prisma.habit.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        subHabits: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // Filter habits that apply today
    const applicableHabits = habits.filter((habit) => {
      return dateMatchesHabit(today, {
        frequency: habit.frequency,
        customDays: habit.customDays as number[] | null,
        startDate: habit.startDate,
        endDate: habit.endDate,
      })
    })

    // Get completion data for today
    const habitCompletions = await ctx.prisma.habitCompletion.findMany({
      where: {
        userId,
        habitId: { in: applicableHabits.map((h) => h.id) },
        date: today,
      },
    })

    const subHabitCompletions = await ctx.prisma.subHabitCompletion.findMany({
      where: {
        userId,
        habitId: { in: applicableHabits.map((h) => h.id) },
        date: today,
      },
    })

    // Map completions to habits
    return applicableHabits.map((habit) => {
      const habitCompletion = habitCompletions.find((hc) => hc.habitId === habit.id)
      const subHabitCompletionsForHabit = subHabitCompletions.filter(
        (shc) => shc.habitId === habit.id
      )

      return {
        ...habit,
        completion: habitCompletion || null,
        subHabitCompletions: subHabitCompletionsForHabit,
      }
    })
  }),

  getByDateRange: protectedProcedure
    .input(getHabitsByDateRangeSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const startDate = new Date(input.startDate)
      const endDate = new Date(input.endDate)

      const habits = await ctx.prisma.habit.findMany({
        where: { userId },
        include: {
          subHabits: {
            orderBy: { order: 'asc' },
          },
        },
      })

      // Get all completions in date range
      const habitCompletions = await ctx.prisma.habitCompletion.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const subHabitCompletions = await ctx.prisma.subHabitCompletion.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      // Build calendar data
      const calendarData: Record<string, any> = {}
      let currentDate = dayjs(startDate)

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const dateStr = currentDate.format('YYYY-MM-DD')
        const date = currentDate.toDate()

        calendarData[dateStr] = habits
          .filter((habit) => {
            if (habit.status !== 'active') return false
            return dateMatchesHabit(date, {
              frequency: habit.frequency,
              customDays: habit.customDays as number[] | null,
              startDate: habit.startDate,
              endDate: habit.endDate,
            })
          })
          .map((habit) => {
            const completion = habitCompletions.find(
              (hc) => hc.habitId === habit.id && dayjs(hc.date).isSame(date, 'day')
            )
            return {
              habitId: habit.id,
              habitName: habit.name,
              completed: completion?.completed || false,
            }
          })

        currentDate = currentDate.add(1, 'day')
      }

      return {
        habits,
        calendarData,
        habitCompletions,
        subHabitCompletions,
      }
    }),

  getCompletionHistory: protectedProcedure
    .input(z.object({ habitId: z.number(), days: z.number().int().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership
      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.habitId, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      const endDate = dayjs().endOf('day').toDate()
      const startDate = dayjs().subtract(input.days, 'day').startOf('day').toDate()

      const completions = await ctx.prisma.habitCompletion.findMany({
        where: {
          userId,
          habitId: input.habitId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      })

      // Calculate streak
      let streak = 0
      let currentDate = dayjs().startOf('day')

      while (currentDate.isAfter(startDate) || currentDate.isSame(startDate, 'day')) {
        if (dateMatchesHabit(currentDate.toDate(), {
          frequency: habit.frequency,
          customDays: habit.customDays as number[] | null,
          startDate: habit.startDate,
          endDate: habit.endDate,
        })) {
          const completion = completions.find((c) =>
            dayjs(c.date).isSame(currentDate, 'day')
          )
          if (completion?.completed) {
            streak++
          } else {
            break
          }
        }
        currentDate = currentDate.subtract(1, 'day')
      }

      // Calculate completion percentage
      let applicableDays = 0
      let completedDays = 0
      currentDate = dayjs(startDate)

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        if (dateMatchesHabit(currentDate.toDate(), {
          frequency: habit.frequency,
          customDays: habit.customDays as number[] | null,
          startDate: habit.startDate,
          endDate: habit.endDate,
        })) {
          applicableDays++
          const completion = completions.find((c) =>
            dayjs(c.date).isSame(currentDate, 'day')
          )
          if (completion?.completed) {
            completedDays++
          }
        }
        currentDate = currentDate.add(1, 'day')
      }

      const completionPercentage =
        applicableDays > 0 ? (completedDays / applicableDays) * 100 : 0

      return {
        completions,
        streak,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        applicableDays,
        completedDays,
      }
    }),

  create: protectedProcedure
    .input(createHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return await ctx.prisma.habit.create({
        data: {
          ...input,
          userId,
          icon: input.icon || null,
          customDays: input.customDays ? input.customDays : Prisma.JsonNull,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
        },
        include: {
          subHabits: {
            orderBy: { order: 'asc' },
          },
        },
      })
    }),

  update: protectedProcedure
    .input(updateHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership
      const habit = await ctx.prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      return await ctx.prisma.habit.update({
        where: { id },
        data: {
          ...data,
          icon: data.icon !== undefined ? data.icon : undefined,
          customDays: data.customDays !== undefined
            ? (data.customDays ? data.customDays : Prisma.JsonNull)
            : undefined,
          startDate: data.startDate !== undefined
            ? data.startDate
              ? new Date(data.startDate)
              : null
            : undefined,
          endDate: data.endDate !== undefined
            ? data.endDate
              ? new Date(data.endDate)
              : null
            : undefined,
        },
        include: {
          subHabits: {
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
      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.id, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      await ctx.prisma.habit.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  pause: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.id, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      return await ctx.prisma.habit.update({
        where: { id: input.id },
        data: { status: 'paused' },
      })
    }),

  resume: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.id, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      return await ctx.prisma.habit.update({
        where: { id: input.id },
        data: { status: 'active' },
      })
    }),

  createSubHabit: protectedProcedure
    .input(createSubHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify habit ownership
      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.habitId, userId },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      return await ctx.prisma.subHabit.create({
        data: {
          ...input,
        },
        include: {
          habit: true,
        },
      })
    }),

  updateSubHabit: protectedProcedure
    .input(updateSubHabitSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id, ...data } = input

      // Verify ownership through habit
      const subHabit = await ctx.prisma.subHabit.findFirst({
        where: { id },
        include: { habit: true },
      })

      if (!subHabit || subHabit.habit.userId !== userId) {
        throw new Error('Sub-habit not found')
      }

      return await ctx.prisma.subHabit.update({
        where: { id },
        data,
        include: {
          habit: true,
        },
      })
    }),

  deleteSubHabit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Verify ownership through habit
      const subHabit = await ctx.prisma.subHabit.findFirst({
        where: { id: input.id },
        include: { habit: true },
      })

      if (!subHabit || subHabit.habit.userId !== userId) {
        throw new Error('Sub-habit not found')
      }

      await ctx.prisma.subHabit.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  markSubHabitComplete: protectedProcedure
    .input(markSubHabitCompletionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const date = dayjs(input.date).startOf('day').toDate()

      // Verify ownership through habit
      const subHabit = await ctx.prisma.subHabit.findFirst({
        where: { id: input.subHabitId },
        include: { habit: true },
      })

      if (!subHabit || subHabit.habit.userId !== userId) {
        throw new Error('Sub-habit not found')
      }

      // Upsert sub-habit completion
      const subHabitCompletion = await ctx.prisma.subHabitCompletion.upsert({
        where: {
          userId_subHabitId_date: {
            userId,
            subHabitId: input.subHabitId,
            date,
          },
        },
        create: {
          subHabitId: input.subHabitId,
          habitId: subHabit.habitId,
          userId,
          date,
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
        update: {
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
      })

      // Check if all sub-habits are completed for this habit/date
      if (input.completed) {
        const allSubHabits = await ctx.prisma.subHabit.findMany({
          where: { habitId: subHabit.habitId },
        })

        const completedSubHabits = await ctx.prisma.subHabitCompletion.findMany({
          where: {
            habitId: subHabit.habitId,
            userId,
            date,
            completed: true,
          },
        })

        const completedCount = completedSubHabits.length
        const targetCount = subHabit.habit.targetCount

        // If target count reached, mark habit as complete
        if (completedCount >= targetCount) {
          await ctx.prisma.habitCompletion.upsert({
            where: {
              userId_habitId_date: {
                userId,
                habitId: subHabit.habitId,
                date,
              },
            },
            create: {
              habitId: subHabit.habitId,
              userId,
              date,
              completed: true,
              completedAt: new Date(),
            },
            update: {
              completed: true,
              completedAt: new Date(),
            },
          })
        }
      } else {
        // If uncompleting, check if habit should be marked incomplete
        const habitCompletion = await ctx.prisma.habitCompletion.findFirst({
          where: {
            habitId: subHabit.habitId,
            userId,
            date,
            completed: true,
          },
        })

        if (habitCompletion) {
          const completedSubHabits = await ctx.prisma.subHabitCompletion.findMany({
            where: {
              habitId: subHabit.habitId,
              userId,
              date,
              completed: true,
            },
          })

          const completedCount = completedSubHabits.length
          const targetCount = subHabit.habit.targetCount

          // If below target count, mark habit as incomplete
          if (completedCount < targetCount) {
            await ctx.prisma.habitCompletion.update({
              where: { id: habitCompletion.id },
              data: {
                completed: false,
                completedAt: null,
              },
            })
          }
        }
      }

      return subHabitCompletion
    }),

  markHabitComplete: protectedProcedure
    .input(markHabitCompletionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const date = dayjs(input.date).startOf('day').toDate()

      // Verify ownership
      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.habitId, userId },
        include: {
          subHabits: true,
        },
      })

      if (!habit) {
        throw new Error('Habit not found')
      }

      // Mark/unmark the parent habit
      const habitCompletion = await ctx.prisma.habitCompletion.upsert({
        where: {
          userId_habitId_date: {
            userId,
            habitId: input.habitId,
            date,
          },
        },
        create: {
          habitId: input.habitId,
          userId,
          date,
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
        update: {
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
      })

      // If marking as complete, also mark all sub-habits as complete
      // If marking as incomplete, also unmark all sub-habits
      if (habit.subHabits.length > 0) {
        await Promise.all(
          habit.subHabits.map((subHabit) =>
            ctx.prisma.subHabitCompletion.upsert({
              where: {
                userId_subHabitId_date: {
                  userId,
                  subHabitId: subHabit.id,
                  date,
                },
              },
              create: {
                subHabitId: subHabit.id,
                habitId: input.habitId,
                userId,
                date,
                completed: input.completed,
                completedAt: input.completed ? new Date() : null,
              },
              update: {
                completed: input.completed,
                completedAt: input.completed ? new Date() : null,
              },
            })
          )
        )
      }

      return habitCompletion
    }),
})
