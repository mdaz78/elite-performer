'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/src/lib/trpc-client'
import { Card } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { InputDialog } from '@/src/components/InputDialog'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { createVariants, updateVariants, staggerContainer } from '@/src/lib/animations'
import {
  getToday,
  formatDisplayDate,
  addDays,
  isSameDay,
  getDaysInRange,
} from '@/src/utils/date'
import dayjs from 'dayjs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Pause, Play, Check, X } from 'lucide-react'

function HabitAnalyticsCard({ habitId, habitName }: { habitId: number; habitName: string }) {
  const { data: history } = trpc.habits.getCompletionHistory.useQuery(
    { habitId, days: 30 },
    { enabled: !!habitId }
  )

  if (!history) {
    return (
      <Card title={habitName} className="flex flex-col">
        <div className="p-4 text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">
          Loading analytics...
        </div>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = history.completions.map((completion) => ({
    date: dayjs(completion.date).format('MMM D'),
    completed: completion.completed ? 1 : 0,
  }))

  return (
    <Card title={habitName} className="flex flex-col">
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-accent-blue dark:text-accent-blue-dark transition-colors duration-200">
              {history.streak} days
            </div>
          </div>
          <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-accent-emerald dark:text-accent-emerald-dark transition-colors duration-200">
              {history.completionPercentage.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
          <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-2">
            Last 30 Days: {history.completedDays} / {history.applicableDays} days
          </div>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  )
}

function HabitTrackerPageContent() {
  const utils = trpc.useUtils()
  const today = getToday()
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'))
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<number | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null)
  const [showSubHabitDialog, setShowSubHabitDialog] = useState(false)
  const [editingSubHabit, setEditingSubHabit] = useState<number | null>(null)
  const [backfillDate, setBackfillDate] = useState<string | null>(null)
  const [backfillHabitId, setBackfillHabitId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'habit' | 'subHabit'; id: number } | null>(null)

  const [habitFormData, setHabitFormData] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    customDays: [] as number[],
    targetCount: 1,
    startDate: '',
    endDate: '',
  })

  const [subHabitName, setSubHabitName] = useState('')
  const [subHabitsInForm, setSubHabitsInForm] = useState<Array<{ name: string; order: number }>>([])

  // Get month start and end dates
  const monthStart = dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD')
  const monthEnd = dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD')

  // Queries
  const { data: todayHabits = [], isLoading: todayLoading } = trpc.habits.getToday.useQuery()
  const { data: allHabits = [], isLoading: allHabitsLoading } = trpc.habits.getAll.useQuery()
  const { data: calendarData, isLoading: calendarLoading } = trpc.habits.getByDateRange.useQuery({
    startDate: new Date(monthStart).toISOString(),
    endDate: new Date(monthEnd).toISOString(),
  })

  // Mutations
  const createHabitMutation = trpc.habits.create.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setShowHabitForm(false)
      setHabitFormData({ name: '', frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
      setSubHabitsInForm([])
    },
  })

  const updateHabitMutation = trpc.habits.update.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setEditingHabit(null)
      setHabitFormData({ name: '', frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
    },
  })

  const deleteHabitMutation = trpc.habits.delete.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    },
  })

  const pauseHabitMutation = trpc.habits.pause.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
    },
  })

  const resumeHabitMutation = trpc.habits.resume.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
    },
  })

  const createSubHabitMutation = trpc.habits.createSubHabit.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      setShowSubHabitDialog(false)
      setSubHabitName('')
      setSelectedHabitId(null)
    },
  })

  const updateSubHabitMutation = trpc.habits.updateSubHabit.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      setShowSubHabitDialog(false)
      setSubHabitName('')
      setEditingSubHabit(null)
      setSelectedHabitId(null)
    },
  })

  const deleteSubHabitMutation = trpc.habits.deleteSubHabit.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    },
  })

  const markSubHabitCompleteMutation = trpc.habits.markSubHabitComplete.useMutation({
    onSuccess: () => {
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      if (selectedHabitId) {
        utils.habits.getCompletionHistory.invalidate({ habitId: selectedHabitId })
      }
    },
  })

  const markHabitCompleteMutation = trpc.habits.markHabitComplete.useMutation({
    onSuccess: () => {
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      if (backfillHabitId) {
        utils.habits.getCompletionHistory.invalidate({ habitId: backfillHabitId })
      }
      setBackfillDate(null)
      setBackfillHabitId(null)
    },
  })

  // Handlers
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    const habit = await createHabitMutation.mutateAsync({
      ...habitFormData,
      customDays: habitFormData.frequency === 'custom' ? habitFormData.customDays : null,
      startDate: habitFormData.startDate && habitFormData.startDate.trim() ? new Date(habitFormData.startDate).toISOString() : null,
      endDate: habitFormData.endDate && habitFormData.endDate.trim() ? new Date(habitFormData.endDate).toISOString() : null,
    })

    // Create sub-habits if any were added in the form
    if (subHabitsInForm.length > 0 && habit) {
      await Promise.all(
        subHabitsInForm.map((subHabit, index) =>
          createSubHabitMutation.mutateAsync({
            habitId: habit.id,
            name: subHabit.name,
            order: index,
          })
        )
      )
    }
  }

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHabit) return
    await updateHabitMutation.mutateAsync({
      id: editingHabit,
      ...habitFormData,
      customDays: habitFormData.frequency === 'custom' ? habitFormData.customDays : null,
      startDate: habitFormData.startDate && habitFormData.startDate.trim() ? new Date(habitFormData.startDate).toISOString() : null,
      endDate: habitFormData.endDate && habitFormData.endDate.trim() ? new Date(habitFormData.endDate).toISOString() : null,
    })
  }

  const handleEditHabit = (habit: typeof allHabits[0]) => {
    setEditingHabit(habit.id)
    setHabitFormData({
      name: habit.name,
      frequency: habit.frequency as 'daily' | 'weekly' | 'custom',
      customDays: (habit.customDays as number[]) || [],
      targetCount: habit.targetCount,
      startDate: habit.startDate ? dayjs(habit.startDate).format('YYYY-MM-DD') : '',
      endDate: habit.endDate ? dayjs(habit.endDate).format('YYYY-MM-DD') : '',
    })
    setSubHabitsInForm([])
    setShowHabitForm(true)
  }

  const handleDeleteHabit = (id: number) => {
    setDeleteTarget({ type: 'habit', id })
    setShowDeleteDialog(true)
  }

  const handleDeleteSubHabit = (id: number) => {
    setDeleteTarget({ type: 'subHabit', id })
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'habit') {
      await deleteHabitMutation.mutateAsync({ id: deleteTarget.id })
    } else {
      await deleteSubHabitMutation.mutateAsync({ id: deleteTarget.id })
    }
  }

  const handleToggleSubHabit = async (subHabitId: number, completed: boolean, date?: string) => {
    await markSubHabitCompleteMutation.mutateAsync({
      subHabitId,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      completed: !completed,
    })
  }

  const handleToggleHabit = async (habitId: number, completed: boolean, date?: string) => {
    await markHabitCompleteMutation.mutateAsync({
      habitId,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      completed: !completed,
    })
  }

  const handleCreateSubHabit = (name: string) => {
    if (!selectedHabitId || !name.trim()) return
    const habit = allHabits.find((h) => h.id === selectedHabitId)
    if (!habit) return

    const maxOrder = habit.subHabits.length > 0
      ? Math.max(...habit.subHabits.map((sh) => sh.order))
      : -1

    createSubHabitMutation.mutate({
      habitId: selectedHabitId,
      name: name.trim(),
      order: maxOrder + 1,
    })
  }

  const handleUpdateSubHabit = (name: string) => {
    if (!editingSubHabit || !name.trim()) return
    updateSubHabitMutation.mutate({
      id: editingSubHabit,
      name: name.trim(),
    })
  }

  const handleEditSubHabit = (subHabit: { id: number; name: string }) => {
    setEditingSubHabit(subHabit.id)
    setSubHabitName(subHabit.name)
    setShowSubHabitDialog(true)
  }

  const handleAddSubHabit = (habitId: number) => {
    setSelectedHabitId(habitId)
    setEditingSubHabit(null)
    setSubHabitName('')
    setShowSubHabitDialog(true)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthDays = getDaysInRange(monthStart, monthEnd)
  const firstDayOfMonth = dayjs(monthStart).day()
  const daysBeforeMonth = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev'
      ? dayjs(selectedMonth).subtract(1, 'month').format('YYYY-MM')
      : dayjs(selectedMonth).add(1, 'month').format('YYYY-MM')
    setSelectedMonth(newMonth)
  }

  const getDayStatus = (date: string) => {
    if (!calendarData?.calendarData) return 'none'
    const dayData = calendarData.calendarData[date] || []
    if (dayData.length === 0) return 'none'
    const allCompleted = dayData.every((h: any) => h.completed)
    const anyCompleted = dayData.some((h: any) => h.completed)
    if (allCompleted) return 'complete'
    if (anyCompleted) return 'partial'
    return 'missed'
  }

  if (todayLoading || allHabitsLoading || calendarLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">Loading habits...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Habit Tracker</h1>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Track your daily habits and build consistency</p>
        </div>
        <button
          onClick={() => {
            setShowHabitForm(true)
            setEditingHabit(null)
            setHabitFormData({ name: '', frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
            setSubHabitsInForm([])
          }}
          className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200 shadow-sm font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Today's Habits */}
      <Card title="Today's Habits" className="mb-6">
        {todayHabits.length === 0 ? (
          <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">No habits scheduled for today</p>
        ) : (
          <div className="space-y-4">
            {todayHabits.map((habit) => {
              const isComplete = habit.completion?.completed || false
              const completedSubHabits = habit.subHabitCompletions.filter((sc) => sc.completed).length
              const totalSubHabits = habit.subHabits.length
              const progress = totalSubHabits > 0 ? (completedSubHabits / totalSubHabits) * 100 : 0

              return (
                <div
                  key={habit.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isComplete
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">{habit.name}</h3>
                        {habit.status === 'paused' && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">Paused</span>
                        )}
                      </div>
                      {totalSubHabits > 0 && (
                        <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                          {completedSubHabits} / {totalSubHabits} sub-habits completed
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleHabit(habit.id, isComplete)}
                      className={`p-2 rounded-lg transition-colors ${
                        isComplete
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                      }`}
                    >
                      {isComplete ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </div>

                  {totalSubHabits > 0 && (
                    <div className="space-y-2">
                      {habit.subHabits.map((subHabit) => {
                        const subCompletion = habit.subHabitCompletions.find(
                          (sc) => sc.subHabitId === subHabit.id
                        )
                        const isSubComplete = subCompletion?.completed || false

                        return (
                          <div
                            key={subHabit.id}
                            className="flex items-center justify-between p-2 bg-background dark:bg-background-dark rounded border border-border dark:border-border-dark"
                          >
                            <span
                              className={`text-sm ${
                                isSubComplete
                                  ? 'line-through text-text-tertiary dark:text-text-tertiary-dark'
                                  : 'text-text-primary dark:text-text-primary-dark'
                              } transition-colors duration-200`}
                            >
                              {subHabit.name}
                            </span>
                            <button
                              onClick={() => handleToggleSubHabit(subHabit.id, isSubComplete)}
                              className={`p-1.5 rounded transition-colors ${
                                isSubComplete
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                              }`}
                            >
                              {isSubComplete ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Calendar View */}
      <Card title="Calendar View" className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
              {dayjs(selectedMonth).format('MMMM YYYY')}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedMonth(dayjs().format('YYYY-MM'))}
              className="ml-4 px-3 py-1 text-sm text-accent-blue dark:text-accent-blue-dark hover:bg-accent-blue/10 dark:hover:bg-accent-blue-dark/10 rounded-lg transition-colors"
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-text-secondary dark:text-text-secondary-dark p-2 transition-colors duration-200"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysBeforeMonth.map((i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {monthDays.map((date) => {
            const status = getDayStatus(date)
            const isToday = isSameDay(date, today)
            const isPast = dayjs(date).isBefore(today, 'day')

            return (
              <div
                key={date}
                className={`aspect-square border rounded-lg p-1 cursor-pointer transition-all ${
                  isToday
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-border dark:border-border-dark'
                } ${
                  status === 'complete'
                    ? 'bg-green-500 dark:bg-green-600'
                    : status === 'partial'
                    ? 'bg-yellow-400 dark:bg-yellow-600'
                    : status === 'missed' && isPast
                    ? 'bg-red-400 dark:bg-red-600'
                    : 'bg-surface dark:bg-surface-dark'
                } hover:opacity-80`}
                onClick={() => {
                  if (calendarData?.calendarData[date]) {
                    setBackfillDate(date)
                    setBackfillHabitId(null)
                  }
                }}
              >
                <div className="text-xs font-medium text-white dark:text-gray-100">
                  {dayjs(date).format('D')}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded" />
            <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded" />
            <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Not Applicable</span>
          </div>
        </div>
      </Card>

      {/* All Habits Management */}
      <Card title="All Habits" className="mb-6">
        {allHabits.length === 0 ? (
          <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">No habits created yet</p>
        ) : (
          <div className="space-y-4">
            {allHabits.map((habit) => (
              <div
                key={habit.id}
                className="p-4 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">{habit.name}</h3>
                      {habit.status === 'paused' && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">Paused</span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                      Frequency: {habit.frequency === 'daily' ? 'Daily' : habit.frequency === 'weekly' ? 'Weekly' : 'Custom'} • Target: {habit.targetCount} sub-habits
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                      title="Edit habit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {habit.status === 'active' ? (
                      <button
                        onClick={() => pauseHabitMutation.mutate({ id: habit.id })}
                        className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                        title="Pause habit"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => resumeHabitMutation.mutate({ id: habit.id })}
                        className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                        title="Resume habit"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Sub-habits</span>
                    <button
                      onClick={() => handleAddSubHabit(habit.id)}
                      className="text-xs px-2 py-1 bg-accent-blue dark:bg-accent-blue-dark text-white rounded hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Sub-habit
                    </button>
                  </div>
                  {habit.subHabits.length === 0 ? (
                    <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">No sub-habits</p>
                  ) : (
                    <div className="space-y-1">
                      {habit.subHabits.map((subHabit) => (
                        <div
                          key={subHabit.id}
                          className="flex items-center justify-between p-2 bg-background dark:bg-background-dark rounded border border-border dark:border-border-dark"
                        >
                          <span className="text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">{subHabit.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditSubHabit(subHabit)}
                              className="p-1 hover:bg-surface dark:hover:bg-surface-dark rounded transition-colors"
                              title="Edit sub-habit"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubHabit(subHabit.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400"
                              title="Delete sub-habit"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-surface dark:bg-surface-dark rounded-lg shadow-2xl p-6 max-w-md w-full border border-border dark:border-border-dark transition-colors duration-200">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 transition-colors duration-200">
                  {editingHabit ? 'Edit Habit' : 'Create Habit'}
                </h3>
                <form onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Name</label>
                    <input
                      type="text"
                      value={habitFormData.name}
                      onChange={(e) => setHabitFormData({ ...habitFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="e.g., Daily Prayers"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Frequency</label>
                    <select
                      value={habitFormData.frequency}
                      onChange={(e) => {
                        const freq = e.target.value as 'daily' | 'weekly' | 'custom'
                        setHabitFormData({
                          ...habitFormData,
                          frequency: freq,
                          customDays: freq === 'custom' ? [] : [],
                        })
                      }}
                      className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom Days</option>
                    </select>
                  </div>

                  {habitFormData.frequency === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Select Days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {dayNames.map((day, index) => {
                          const isSelected = habitFormData.customDays.includes(index)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const newDays = isSelected
                                  ? habitFormData.customDays.filter((d) => d !== index)
                                  : [...habitFormData.customDays, index]
                                setHabitFormData({ ...habitFormData, customDays: newDays })
                              }}
                              className={`p-2 text-xs rounded transition-colors ${
                                isSelected
                                  ? 'bg-accent-blue dark:bg-accent-blue-dark text-white'
                                  : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark'
                              }`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">
                      Target Count (sub-habits to complete)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={habitFormData.targetCount}
                      onChange={(e) =>
                        setHabitFormData({
                          ...habitFormData,
                          targetCount: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">
                        Start Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={habitFormData.startDate}
                        onChange={(e) =>
                          setHabitFormData({
                            ...habitFormData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={habitFormData.endDate}
                        onChange={(e) =>
                          setHabitFormData({
                            ...habitFormData,
                            endDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  {/* Sub-habits Section */}
                  {!editingHabit && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                          Sub-habits (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSubHabitsInForm([...subHabitsInForm, { name: '', order: subHabitsInForm.length }])
                          }}
                          className="text-xs px-2 py-1 bg-accent-blue dark:bg-accent-blue-dark text-white rounded hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Sub-habit
                        </button>
                      </div>
                      {subHabitsInForm.length > 0 && (
                        <div className="space-y-2 p-3 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
                          {subHabitsInForm.map((subHabit, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={subHabit.name}
                                onChange={(e) => {
                                  const newSubHabits = [...subHabitsInForm]
                                  newSubHabits[index].name = e.target.value
                                  setSubHabitsInForm(newSubHabits)
                                }}
                                className="flex-1 px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                                placeholder="e.g., Fajr"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSubHabitsInForm(subHabitsInForm.filter((_, i) => i !== index))
                                }}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400"
                                title="Remove sub-habit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {subHabitsInForm.length === 0 && (
                        <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">
                          You can add sub-habits after creating the habit, or add them now
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowHabitForm(false)
                        setEditingHabit(null)
                        setHabitFormData({ name: '', frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
                        setSubHabitsInForm([])
                      }}
                      className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                    >
                      {editingHabit ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-habit Dialog */}
      <InputDialog
        isOpen={showSubHabitDialog}
        title={editingSubHabit ? 'Edit Sub-habit' : 'Add Sub-habit'}
        inputLabel="Sub-habit Name"
        inputPlaceholder="e.g., Fajr"
        defaultValue={subHabitName}
        onConfirm={(value) => {
          if (editingSubHabit) {
            handleUpdateSubHabit(value)
          } else {
            handleCreateSubHabit(value)
          }
        }}
        onCancel={() => {
          setShowSubHabitDialog(false)
          setSubHabitName('')
          setEditingSubHabit(null)
          setSelectedHabitId(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Confirm Delete"
        message={
          deleteTarget?.type === 'habit'
            ? 'Are you sure you want to delete this habit? This will also delete all sub-habits and completion records.'
            : 'Are you sure you want to delete this sub-habit?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeleteTarget(null)
        }}
      />

      {/* Analytics Section */}
      {allHabits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {allHabits.map((habit) => (
            <HabitAnalyticsCard key={habit.id} habitId={habit.id} habitName={habit.name} />
          ))}
        </div>
      )}

      {/* Backfill Modal */}
      {backfillDate && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-surface dark:bg-surface-dark rounded-lg shadow-2xl p-6 max-w-md w-full border border-border dark:border-border-dark transition-colors duration-200">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 transition-colors duration-200">
                  Log Completion for {formatDisplayDate(backfillDate)}
                </h3>
                {calendarData?.calendarData[backfillDate] && (
                  <div className="space-y-3">
                    {calendarData.calendarData[backfillDate].map((habitData: any) => {
                      const habit = calendarData.habits.find((h: any) => h.id === habitData.habitId)
                      if (!habit) return null

                      return (
                        <div
                          key={habitData.habitId}
                          className="p-3 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                              {habitData.habitName}
                            </span>
                            <button
                              onClick={() => handleToggleHabit(habitData.habitId, habitData.completed, backfillDate)}
                              className={`p-2 rounded-lg transition-colors ${
                                habitData.completed
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                              }`}
                            >
                              {habitData.completed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </div>
                          {habit.subHabits.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {habit.subHabits.map((subHabit: any) => {
                                const subCompletion = calendarData.subHabitCompletions.find(
                                  (sc: any) =>
                                    sc.subHabitId === subHabit.id &&
                                    dayjs(sc.date).isSame(backfillDate, 'day')
                                )
                                const isSubComplete = subCompletion?.completed || false

                                return (
                                  <div
                                    key={subHabit.id}
                                    className="flex items-center justify-between p-2 bg-surface dark:bg-surface-dark rounded border border-border dark:border-border-dark"
                                  >
                                    <span
                                      className={`text-sm ${
                                        isSubComplete
                                          ? 'line-through text-text-tertiary dark:text-text-tertiary-dark'
                                          : 'text-text-primary dark:text-text-primary-dark'
                                      } transition-colors duration-200`}
                                    >
                                      {subHabit.name}
                                    </span>
                                    <button
                                      onClick={() => handleToggleSubHabit(subHabit.id, isSubComplete, backfillDate)}
                                      className={`p-1.5 rounded transition-colors ${
                                        isSubComplete
                                          ? 'bg-green-500 text-white hover:bg-green-600'
                                          : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                                      }`}
                                    >
                                      {isSubComplete ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border dark:border-border-dark">
                  <button
                    onClick={() => {
                      setBackfillDate(null)
                      setBackfillHabitId(null)
                    }}
                    className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HabitTrackerPage() {
  return (
    <ProtectedRoute>
      <HabitTrackerPageContent />
    </ProtectedRoute>
  )
}
