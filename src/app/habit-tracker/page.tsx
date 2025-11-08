'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/src/lib/trpc-client'
import { Card } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { InputDialog } from '@/src/components/InputDialog'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import {
  MotivationalGreeting,
  HabitCard,
  HabitTabs,
  FloatingActionButton,
  IconPicker,
  ContributionGraph,
} from '@/src/components'
import { createVariants, staggerContainer, habitCompleteVariants } from '@/src/lib/animations'
import {
  getToday,
  formatDisplayDate,
  isSameDay,
} from '@/src/utils/date'
import dayjs from 'dayjs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Pause, Play, Check, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

type TabType = 'today' | 'habits' | 'progress'

// Wrapper component to handle hook calls properly
function HabitCardWithHistory({
  habit,
  weeklyProgress,
  onToggleComplete,
  onEdit,
  onDelete,
  onPause,
  onResume,
  showActions = false,
}: {
  habit: {
    id: number
    name: string
    icon: string | null
    status: 'active' | 'paused'
    subHabits?: Array<{ id: number; name: string; order: number }>
    completion?: { completed: boolean } | null
    subHabitCompletions?: Array<{ subHabitId: number; completed: boolean }>
  }
  weeklyProgress: number
  onToggleComplete: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPause?: () => void
  onResume?: () => void
  showActions?: boolean
}) {
  const history = trpc.habits.getCompletionHistory.useQuery(
    { habitId: habit.id, days: 7 },
    { enabled: !!habit.id }
  )
  const currentStreak = history.data?.streak || 0
  const completionRate = history.data?.completionPercentage || 0

  return (
    <motion.div variants={habitCompleteVariants}>
      <HabitCard
        habit={habit}
        currentStreak={currentStreak}
        bestStreak={currentStreak}
        completionRate={completionRate}
        weeklyProgress={weeklyProgress}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onPause={onPause}
        onResume={onResume}
        showActions={showActions}
      />
    </motion.div>
  )
}

function HabitAnalyticsCard({ habitId, habitName, icon }: { habitId: number; habitName: string; icon: string | null }) {
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

  const pieData = [
    { name: 'Completed', value: history.completedDays, color: '#10B981' },
    { name: 'Missed', value: history.applicableDays - history.completedDays, color: '#9B9A97' },
  ]

  const renderIcon = () => {
    if (!icon) return null
    const IconComponent = (LucideIcons as any)[icon] as React.ComponentType<{ className?: string }>
    if (!IconComponent) return null
    return <IconComponent className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
  }

  return (
    <Card title={habitName} className="flex flex-col">
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-accent-blue dark:text-accent-blue-dark transition-colors duration-200">
              {history.streak}
            </div>
          </div>
          <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
            <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-1">Completion</div>
            <div className="text-2xl font-bold text-accent-emerald dark:text-accent-emerald-dark transition-colors duration-200">
              {history.completionPercentage.toFixed(0)}%
            </div>
          </div>
          <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark flex items-center justify-center">
            {renderIcon()}
          </div>
        </div>

        <div className="p-4 bg-background dark:bg-background-dark rounded-lg border border-border dark:border-border-dark">
          <div className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-2">
            Last 30 Days: {history.completedDays} / {history.applicableDays} days
          </div>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="text-text-secondary dark:text-text-secondary-dark" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
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
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'))
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [editingHabit, setEditingHabit] = useState<number | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null)
  const [showSubHabitDialog, setShowSubHabitDialog] = useState(false)
  const [editingSubHabit, setEditingSubHabit] = useState<number | null>(null)
  const [backfillDate, setBackfillDate] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'habit' | 'subHabit'; id: number } | null>(null)

  const [habitFormData, setHabitFormData] = useState({
    name: '',
    icon: null as string | null,
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
  const weekStart = dayjs().startOf('week').format('YYYY-MM-DD')
  const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD')

  // Queries
  const { data: todayHabits = [], isLoading: todayLoading } = trpc.habits.getToday.useQuery()
  const { data: allHabits = [], isLoading: allHabitsLoading } = trpc.habits.getAll.useQuery()
  const { data: calendarData, isLoading: calendarLoading } = trpc.habits.getByDateRange.useQuery({
    startDate: new Date(monthStart).toISOString(),
    endDate: new Date(monthEnd).toISOString(),
  })
  const { data: weekCalendarData } = trpc.habits.getByDateRange.useQuery({
    startDate: new Date(weekStart).toISOString(),
    endDate: new Date(weekEnd).toISOString(),
  })

  // Calculate overall streak - get the longest current streak from active habits
  const overallStreak = useMemo(() => {
    if (!allHabits.length) return 0
    // For now, return a placeholder. In production, you'd query streak for each habit
    // and return the maximum or average
    return 0 // This would be calculated from habit completion history
  }, [allHabits])

  // Calculate today's progress
  const todayCompleted = todayHabits.filter((h) => h.completion?.completed).length
  const todayTotal = todayHabits.length

  // Mutations
  const createHabitMutation = trpc.habits.create.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setShowHabitForm(false)
      setShowIconPicker(false)
      setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
      setSubHabitsInForm([])
    },
  })

  const updateHabitMutation = trpc.habits.update.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate()
      utils.habits.getToday.invalidate()
      utils.habits.getByDateRange.invalidate()
      setEditingHabit(null)
      setShowHabitForm(false)
      setShowIconPicker(false)
      setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
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
      icon: habit.icon,
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev'
      ? dayjs(selectedMonth).subtract(1, 'month').format('YYYY-MM')
      : dayjs(selectedMonth).add(1, 'month').format('YYYY-MM')
    setSelectedMonth(newMonth)
  }

  // Prepare contribution graph data
  const contributionData = useMemo(() => {
    if (!calendarData?.calendarData) return {}
    const data: Record<string, { completed: number; total: number }> = {}
    Object.entries(calendarData.calendarData).forEach(([date, habits]: [string, any]) => {
      data[date] = {
        completed: habits.filter((h: any) => h.completed).length,
        total: habits.length,
      }
    })
    return data
  }, [calendarData])

  // Calculate weekly progress for habits
  const getWeeklyProgress = (habitId: number) => {
    if (!weekCalendarData?.calendarData) return 0
    let completed = 0
    let total = 0
    Object.values(weekCalendarData.calendarData).forEach((habits: any) => {
      const habitData = habits.find((h: any) => h.habitId === habitId)
      if (habitData) {
        total++
        if (habitData.completed) completed++
      }
    })
    return total > 0 ? (completed / total) * 100 : 0
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200 mb-2">
          Habit Tracker
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
          Track your daily habits and build consistency
        </p>
      </div>

      {/* Tab Navigation */}
      <HabitTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Today Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hero Section */}
            <div className="mb-8">
              <MotivationalGreeting
                overallStreak={overallStreak}
                todayCompleted={todayCompleted}
                todayTotal={todayTotal}
              />
            </div>

            {/* Today's Habits */}
            {todayHabits.length === 0 ? (
              <Card className="mb-6">
                <div className="text-center py-12">
                  <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200 mb-4">
                    No habits scheduled for today
                  </p>
                  <button
                    onClick={() => {
                      setShowHabitForm(true)
                      setEditingHabit(null)
                      setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
                      setSubHabitsInForm([])
                    }}
                    className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200 shadow-sm font-medium text-sm flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    Create Your First Habit
                  </button>
                </div>
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4 mb-6"
              >
                {todayHabits.map((habit) => (
                  <HabitCardWithHistory
                    key={habit.id}
                    habit={habit}
                    weeklyProgress={getWeeklyProgress(habit.id)}
                    onToggleComplete={() => handleToggleHabit(habit.id, habit.completion?.completed || false)}
                  />
                ))}
              </motion.div>
            )}

            {/* Contribution Graph */}
            {Object.keys(contributionData).length > 0 && (
              <Card title="Monthly Overview" className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
                    </button>
                    <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                      {dayjs(selectedMonth).format('MMMM YYYY')}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
                    </button>
                    <button
                      onClick={() => setSelectedMonth(dayjs().format('YYYY-MM'))}
                      className="ml-4 px-3 py-1 text-sm text-accent-blue dark:text-accent-blue-dark hover:bg-accent-blue/10 dark:hover:bg-accent-blue-dark/10 rounded-lg transition-colors"
                    >
                      This Month
                    </button>
                  </div>
                </div>
                <ContributionGraph
                  data={contributionData}
                  startDate={monthStart}
                  endDate={monthEnd}
                  onDateClick={(date) => {
                    if (calendarData?.calendarData[date]) {
                      setBackfillDate(date)
                    }
                  }}
                />
              </Card>
            )}
          </motion.div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card title="All Habits" className="mb-6">
              {allHabits.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200 mb-4">
                    No habits created yet
                  </p>
                  <button
                    onClick={() => {
                      setShowHabitForm(true)
                      setEditingHabit(null)
                      setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
                      setSubHabitsInForm([])
                    }}
                    className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200 shadow-sm font-medium text-sm flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    Create Your First Habit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allHabits.map((habit) => (
                    <HabitCardWithHistory
                      key={habit.id}
                      habit={habit}
                      weeklyProgress={getWeeklyProgress(habit.id)}
                      onToggleComplete={() => handleToggleHabit(habit.id, habit.completion?.completed || false)}
                      onEdit={() => handleEditHabit(habit)}
                      onDelete={() => handleDeleteHabit(habit.id)}
                      onPause={() => pauseHabitMutation.mutate({ id: habit.id })}
                      onResume={() => resumeHabitMutation.mutate({ id: habit.id })}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {allHabits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {allHabits.map((habit) => (
                  <HabitAnalyticsCard key={habit.id} habitId={habit.id} habitName={habit.name} icon={habit.icon} />
                ))}
              </div>
            ) : (
              <Card className="mb-6">
                <div className="text-center py-12">
                  <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">
                    No habits to show analytics for
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          setShowHabitForm(true)
          setEditingHabit(null)
          setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
          setSubHabitsInForm([])
        }}
      />

      {/* Habit Form Modal */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-surface dark:bg-surface-dark rounded-lg shadow-2xl p-6 max-w-md w-full border border-border dark:border-border-dark transition-colors duration-200 max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Icon</label>
                    {showIconPicker ? (
                      <IconPicker
                        selectedIcon={habitFormData.icon}
                        onSelect={(icon) => {
                          setHabitFormData({ ...habitFormData, icon })
                          setShowIconPicker(false)
                        }}
                        onClose={() => setShowIconPicker(false)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(true)}
                        className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md hover:bg-background dark:hover:bg-background-dark transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {habitFormData.icon ? (
                          <>
                            {(LucideIcons as any)[habitFormData.icon] && (
                              <>
                                {React.createElement((LucideIcons as any)[habitFormData.icon], { className: 'w-5 h-5 text-text-primary dark:text-text-primary-dark' })}
                                <span>{habitFormData.icon}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>Select Icon</span>
                        )}
                      </button>
                    )}
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
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
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
                          <Plus className="w-3 h-3 text-white" />
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
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowHabitForm(false)
                        setShowIconPicker(false)
                        setEditingHabit(null)
                        setHabitFormData({ name: '', icon: null, frequency: 'daily', customDays: [], targetCount: 1, startDate: '', endDate: '' })
                        setSubHabitsInForm([])
                      }}
                      className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors font-medium shadow-sm"
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
                                  ? 'bg-accent-emerald dark:bg-accent-emerald-dark text-white hover:bg-accent-emerald/90 dark:hover:bg-accent-emerald-dark/90'
                                  : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                              }`}
                            >
                              {habitData.completed ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-text-primary dark:text-text-primary-dark" />}
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
                                          ? 'bg-accent-emerald dark:bg-accent-emerald-dark text-white hover:bg-accent-emerald/90 dark:hover:bg-accent-emerald-dark/90'
                                          : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark'
                                      }`}
                                    >
                                      {isSubComplete ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-text-primary dark:text-text-primary-dark" />}
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
