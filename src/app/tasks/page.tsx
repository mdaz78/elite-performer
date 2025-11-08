'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { trpc } from '@/src/lib/trpc-client'
import { Card } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { createVariants, updateVariants, staggerContainer } from '@/src/lib/animations'
import {
  getToday,
  formatDisplayDate,
  getWeekStartSunday,
  getWeekEndSaturday,
  getWeekDays,
  formatWeekRange,
  addDays,
  isSameDay,
} from '@/src/utils/date'
import dayjs from 'dayjs'

function TasksPageContent() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getWeekStartSunday())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showReviewSection, setShowReviewSection] = useState(false)
  const [showRolloverDialog, setShowRolloverDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    type: 'DeepWork' as const,
    projectId: undefined as number | undefined,
    scheduledDate: getToday(),
  })

  const [reviewData, setReviewData] = useState({
    wins: '',
    mistakes: '',
    nextWeekGoals: '',
  })

  const taskTypes = ['DeepWork', 'Gym', 'TradingPractice', 'Coding', 'Review', 'Other'] as const
  const weekDays = getWeekDays(selectedWeekStart)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = getToday()
  const weekEnd = getWeekEndSaturday(selectedWeekStart)

  const { data: tasks = [], isLoading: tasksLoading } = trpc.tasks.getByDate.useQuery(
    {
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEnd).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const { data: scheduledModules = [], isLoading: scheduledModulesLoading } = trpc.tasks.getScheduledModules.useQuery(
    {
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEnd).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.getAll.useQuery()
  const { data: weekReview } = trpc.reviews.getByWeek.useQuery(
    {
      weekStartDate: new Date(selectedWeekStart).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate()
      setFormData({
        title: '',
        type: 'DeepWork',
        projectId: undefined,
        scheduledDate: selectedWeekStart,
      })
      setShowTaskForm(false)
    },
  })

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate()
    },
  })

  const updateModuleScheduleMutation = trpc.courseModules.update.useMutation({
    onSuccess: () => {
      utils.tasks.getScheduledModules.invalidate()
    },
  })

  const updateTradingModuleScheduleMutation = trpc.tradingCourseModules.update.useMutation({
    onSuccess: () => {
      utils.tasks.getScheduledModules.invalidate()
    },
  })

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate()
    },
  })

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.getByWeek.invalidate()
    },
  })

  const updateReviewMutation = trpc.reviews.update.useMutation({
    onSuccess: () => {
      utils.reviews.getByWeek.invalidate()
    },
  })

  useEffect(() => {
    if (weekReview) {
      setReviewData({
        wins: weekReview.wins,
        mistakes: weekReview.mistakes,
        nextWeekGoals: weekReview.nextWeekGoals,
      })
    } else {
      setReviewData({
        wins: '',
        mistakes: '',
        nextWeekGoals: '',
      })
    }
  }, [weekReview])

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createTaskMutation.mutateAsync({
      title: formData.title,
      type: formData.type,
      projectId: formData.projectId || null,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
    })
  }

  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null)

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    setAnimatingTaskId(taskId)
    await updateTaskMutation.mutateAsync({
      id: taskId,
      completed: !completed,
      completedAt: !completed ? new Date().toISOString() : null,
    })
    setTimeout(() => setAnimatingTaskId(null), 200)
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task?')) return
    await deleteTaskMutation.mutateAsync({ id: taskId })
  }

  const handleAssignTask = async (task: typeof tasks[0], newDate: string) => {
    await updateTaskMutation.mutateAsync({
      id: task.id,
      scheduledDate: new Date(newDate).toISOString(),
    })
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weekEndDate = getWeekEndSaturday(selectedWeekStart)

    // Get metrics from other data
    const weekTasks = tasks
    const fitnessLogs = await utils.fitness.getByDateRange.fetch({
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEndDate).toISOString(),
    })
    const weekTrades = await utils.trades.getAll.fetch({
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEndDate).toISOString(),
    })
    const courses = await utils.codingCourses.getAll.fetch()

    let totalModules = 0
    let completedModules = 0
    courses.forEach((course: typeof courses[0]) => {
      totalModules += course.modules?.length || 0
      completedModules += course.modules?.filter((m: typeof course.modules[0]) => m.completed).length || 0
    })

    const metrics = {
      tasksCompleted: weekTasks.filter((t) => t.completed).length,
      tasksTotal: weekTasks.length,
      fitnessLogs: fitnessLogs.length,
      tradesCount: weekTrades.length,
      tradesPnl: weekTrades.reduce((sum: number, t: typeof weekTrades[0]) => sum + t.pnl, 0),
      codingProgress: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
    }

    if (weekReview) {
      await updateReviewMutation.mutateAsync({
        id: weekReview.id,
        wins: reviewData.wins,
        mistakes: reviewData.mistakes,
        nextWeekGoals: reviewData.nextWeekGoals,
        metrics,
      })
    } else {
      await createReviewMutation.mutateAsync({
        weekStartDate: new Date(selectedWeekStart).toISOString(),
        wins: reviewData.wins,
        mistakes: reviewData.mistakes,
        nextWeekGoals: reviewData.nextWeekGoals,
        metrics,
      })
    }
  }

  const handleRollover = async () => {
    const incompleteTasks = tasks.filter((t) => !t.completed)
    const nextWeekStart = addDays(selectedWeekStart, 7)

    await Promise.all(
      incompleteTasks.map((task) =>
        updateTaskMutation.mutateAsync({
          id: task.id,
          scheduledDate: new Date(nextWeekStart).toISOString(),
        })
      )
    )
    setShowRolloverDialog(false)
  }

  const getTasksForDay = (date: string) => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.scheduledDate).toISOString().split('T')[0]
      return isSameDay(taskDate, date)
    })
  }

  const getScheduledModulesForDay = (date: string) => {
    return scheduledModules.filter((m) => {
      if (!m.scheduledDate) return false
      const moduleDate = new Date(m.scheduledDate).toISOString().split('T')[0]
      return isSameDay(moduleDate, date)
    })
  }

  const handleRescheduleModule = async (module: typeof scheduledModules[0], newDate: string) => {
    if (module.courseType === 'coding') {
      await updateModuleScheduleMutation.mutateAsync({
        id: module.id,
        scheduledDate: new Date(newDate).toISOString(),
      })
    } else {
      await updateTradingModuleScheduleMutation.mutateAsync({
        id: module.id,
        scheduledDate: new Date(newDate).toISOString(),
      })
    }
  }

  const handleNavigateToCourse = (module: typeof scheduledModules[0]) => {
    if (module.courseType === 'coding') {
      router.push(`/coding/${module.courseId}`)
    } else {
      router.push(`/trading/${module.courseId}`)
    }
  }

  const getIncompleteTasks = () => {
    return tasks.filter((t) => !t.completed)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev'
      ? addDays(selectedWeekStart, -7)
      : addDays(selectedWeekStart, 7)
    setSelectedWeekStart(newWeekStart)
  }

  const isLoading = tasksLoading || projectsLoading || scheduledModulesLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">Loading tasks...</p>
      </div>
    )
  }

  const incompleteTasks = getIncompleteTasks()
  const hasReview = reviewData.wins || reviewData.mistakes || reviewData.nextWeekGoals

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Tasks</h1>
        <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Plan your week and manage your tasks</p>
      </div>

      {/* Week Selector */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigateWeek('prev')}
            className="px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-text-primary dark:text-text-primary-dark font-medium hover:bg-background dark:hover:bg-background-dark hover:border-accent-blue dark:hover:border-accent-blue-dark transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 h-10">
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(getWeekStartSunday(e.target.value))}
              className="border-0 bg-transparent text-text-primary dark:text-text-primary-dark font-medium focus:outline-none focus:ring-0 cursor-pointer h-full py-0 transition-colors duration-200"
            />
            <span className="text-text-primary dark:text-text-primary-dark font-semibold text-sm whitespace-nowrap">{formatWeekRange(selectedWeekStart)}</span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-text-primary dark:text-text-primary-dark font-medium hover:bg-background dark:hover:bg-background-dark hover:border-accent-blue dark:hover:border-accent-blue-dark transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            Next →
          </button>
          <button
            onClick={() => setSelectedWeekStart(getWeekStartSunday())}
            className="px-4 py-2.5 text-sm font-medium text-accent-blue dark:text-accent-blue-dark hover:text-accent-blue/90 dark:hover:text-accent-blue-dark/90 hover:bg-accent-blue/10 dark:hover:bg-accent-blue-dark/10 rounded-lg transition-all duration-200 h-10 border border-transparent hover:border-accent-blue/20 dark:hover:border-accent-blue-dark/20"
          >
            This Week
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {incompleteTasks.length > 0 && (
            <button
              onClick={() => setShowRolloverDialog(true)}
              className="px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-sm hover:shadow-md font-medium text-sm h-10"
            >
              Rollover Incomplete ({incompleteTasks.length})
            </button>
          )}
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="px-5 py-2.5 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm h-10"
          >
            {showTaskForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <Card title="Create New Task" className="mb-6">
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="e.g., Complete React module"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                  className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'DeepWork' ? 'Deep Work' : type === 'TradingPractice' ? 'Trading Practice' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Project (Optional)</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">None</option>
                  {projects
                    .filter((p) => p.status === 'active')
                    .map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Assign to Day</label>
                <select
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value={selectedWeekStart}>Unassigned (This Week)</option>
                  {weekDays.map((date, idx) => (
                    <option key={date} value={date}>
                      {dayNames[idx]} - {formatDisplayDate(date)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTaskForm(false)
                  setFormData({
                    title: '',
                    type: 'DeepWork',
                    projectId: undefined,
                    scheduledDate: selectedWeekStart,
                  })
                }}
                className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
              >
                Add Task
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Week View - Horizontal Date Sections */}
      <div className="mb-8 space-y-6">
        {weekDays.map((date, idx) => {
          const dayTasks = getTasksForDay(date)
          const dayModules = getScheduledModulesForDay(date)
          const isToday = isSameDay(date, today)
          const isSunday = idx === 0
          const hasItems = dayTasks.length > 0 || dayModules.length > 0

          return (
            <motion.div
              key={date}
              variants={createVariants}
              initial="initial"
              animate="animate"
              className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                isToday
                  ? 'border-blue-500 dark:border-blue-400 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/20 dark:to-transparent shadow-md'
                  : isSunday
                  ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/30 dark:to-transparent shadow-sm'
                  : 'border-border dark:border-border-dark bg-surface/30 dark:bg-surface-dark/30 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-baseline gap-2 ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-text-primary dark:text-text-primary-dark'
                }`}>
                  <span className="text-2xl font-bold">{dayjs(date).format('D')}</span>
                  <span className="text-sm font-semibold uppercase tracking-wide">{dayNames[idx]}</span>
                </div>
                {isSunday && (
                  <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-3 py-1 rounded-full shadow-sm">
                    Planning
                  </span>
                )}
                {isToday && (
                  <span className="text-xs font-bold bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
                    Today
                  </span>
                )}
              </div>

              {/* Cards Container */}
              {!hasItems ? (
                <div className="py-4">
                  <p className="text-sm text-text-tertiary dark:text-text-tertiary-dark">No tasks</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {/* Scheduled Modules */}
                      {dayModules.map((module) => (
                        <motion.div
                          key={`module-${module.id}`}
                          variants={createVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className="group p-4 border-2 border-purple-300 dark:border-purple-600 rounded-xl transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-900/30 dark:to-purple-900/10 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer"
                          onClick={() => handleNavigateToCourse(module)}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md">
                                  {module.courseType === 'coding' ? '💻 Coding' : '📈 Trading'}
                                </span>
                                {module.completed && (
                                  <span className="text-xs font-medium px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md">
                                    ✓ Done
                                  </span>
                                )}
                              </div>
                              <select
                                value={module.scheduledDate ? new Date(module.scheduledDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleRescheduleModule(module, e.target.value)}
                                className="text-xs border border-purple-300 dark:border-purple-600 rounded-md px-1.5 py-0.5 bg-white dark:bg-purple-900/50 text-text-primary dark:text-text-primary-dark focus:ring-purple-500 focus:border-purple-500 cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {weekDays.map((d, i) => (
                                  <option key={d} value={d}>
                                    {dayNames[i]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1 opacity-90">
                                {module.courseName}
                              </p>
                              <p
                                className={`text-sm font-semibold leading-tight ${
                                  module.completed
                                    ? 'line-through text-text-tertiary dark:text-text-tertiary-dark opacity-60'
                                    : 'text-text-primary dark:text-text-primary-dark'
                                }`}
                              >
                                {module.name}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Regular Tasks */}
                      {dayTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId)
                        const taskTypeDisplay = task.type === 'DeepWork' ? 'Deep Work' : task.type === 'TradingPractice' ? 'Trading Practice' : task.type
                        const isAnimating = animatingTaskId === task.id
                        return (
                          <motion.div
                            key={task.id}
                            variants={createVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                            className={`group p-4 border-2 rounded-xl transition-all duration-200 ${
                              task.completed
                                ? 'bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-900/30 dark:to-gray-900/10 border-gray-300 dark:border-gray-700 opacity-60'
                                : 'bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/10 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-medium px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md">
                                    {taskTypeDisplay}
                                  </span>
                                  {task.completed && (
                                    <span className="text-xs font-medium px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md">
                                      ✓ Done
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                  <select
                                    value={new Date(task.scheduledDate).toISOString().split('T')[0]}
                                    onChange={(e) => handleAssignTask(task, e.target.value)}
                                    className="text-xs border border-slate-300 dark:border-slate-600 rounded-md px-1.5 py-0.5 bg-white dark:bg-slate-900/50 text-text-primary dark:text-text-primary-dark focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {weekDays.map((d, i) => (
                                      <option key={d} value={d}>
                                        {dayNames[i]}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-lg font-bold leading-none px-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete task"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <motion.div animate={isAnimating ? updateVariants.animate : {}}>
                                {project && (
                                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1 opacity-90">
                                    {project.name}
                                  </p>
                                )}
                                <div className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleComplete(task.id, task.completed)}
                                    className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-600 rounded cursor-pointer transition-colors duration-200 flex-shrink-0"
                                  />
                                  <p
                                    className={`text-sm font-semibold leading-tight ${
                                      task.completed
                                        ? 'line-through text-text-tertiary dark:text-text-tertiary-dark'
                                        : 'text-text-primary dark:text-text-primary-dark'
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Weekly Review Section */}
      <Card
        title="Weekly Review"
        action={
          <button
            onClick={() => setShowReviewSection(!showReviewSection)}
            className="text-sm font-medium text-accent-blue dark:text-accent-blue-dark hover:text-accent-blue/90 dark:hover:text-accent-blue-dark/90 hover:bg-accent-blue/10 dark:hover:bg-accent-blue-dark/10 px-3 py-1 rounded-md transition-colors duration-200"
          >
            {showReviewSection ? 'Collapse' : 'Expand'}
          </button>
        }
      >
        {showReviewSection && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Wins</label>
              <textarea
                value={reviewData.wins}
                onChange={(e) => setReviewData({ ...reviewData, wins: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="What went well this week?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Mistakes & Learnings</label>
              <textarea
                value={reviewData.mistakes}
                onChange={(e) => setReviewData({ ...reviewData, mistakes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="What could be improved?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Next Week Goals</label>
              <textarea
                value={reviewData.nextWeekGoals}
                onChange={(e) => setReviewData({ ...reviewData, nextWeekGoals: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="What are your goals for next week?"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
              >
                Save Review
              </button>
            </div>
          </form>
        )}
        {!showReviewSection && hasReview && (
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-semibold text-text-primary dark:text-text-primary-dark">Wins: </span>
              <span className="text-text-primary dark:text-text-primary-dark whitespace-pre-wrap">{reviewData.wins}</span>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-semibold text-text-primary dark:text-text-primary-dark">Mistakes & Learnings: </span>
              <span className="text-text-primary dark:text-text-primary-dark whitespace-pre-wrap">{reviewData.mistakes}</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-semibold text-text-primary dark:text-text-primary-dark">Next Week Goals: </span>
              <span className="text-text-primary dark:text-text-primary-dark whitespace-pre-wrap">{reviewData.nextWeekGoals}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Rollover Dialog */}
      {showRolloverDialog && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowRolloverDialog(false)}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="bg-surface dark:bg-surface-dark rounded-lg shadow-2xl p-6 max-w-md w-full border border-border dark:border-border-dark transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">Rollover Incomplete Tasks</h3>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
                  Move {incompleteTasks.length} incomplete task{incompleteTasks.length !== 1 ? 's' : ''} to next week?
                </p>
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto border border-border dark:border-border-dark rounded-lg p-3 bg-background dark:bg-background-dark">
                  {incompleteTasks.map((task) => (
                    <div key={task.id} className="text-sm text-text-primary dark:text-text-primary-dark p-2 bg-surface dark:bg-surface-dark rounded-md border border-border dark:border-border-dark">
                      {task.title}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRolloverDialog(false)}
                    className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRollover}
                    className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 font-medium shadow-sm transition-colors duration-200"
                  >
                    Rollover
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

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksPageContent />
    </ProtectedRoute>
  )
}
