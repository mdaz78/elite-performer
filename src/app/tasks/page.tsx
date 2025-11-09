'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { trpc } from '@/src/lib/trpc-client'
import { Card, ProgressBar, TasksTabs, DatePicker } from '@/src/components'
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

type TabType = 'projects' | 'backlog' | 'tasks'

function TasksPageContent() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getWeekStartSunday())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showReviewSection, setShowReviewSection] = useState(false)
  const [showRolloverDialog, setShowRolloverDialog] = useState(false)

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    startDate: getToday(),
    targetDate: addDays(getToday(), 30),
  })

  // Task form state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    type: 'DeepWork' as const,
    taskProjectId: undefined as number | undefined,
    scheduledDate: 'unassigned' as string,
  })

  const [reviewData, setReviewData] = useState({
    wins: '',
    mistakes: '',
    nextWeekGoals: '',
  })

  const taskTypes = ['DeepWork', 'Gym', 'TradingPractice', 'Coding', 'Review', 'Other'] as const
  const weekDays = getWeekDays(selectedWeekStart)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = getToday()
  const weekEnd = getWeekEndSaturday(selectedWeekStart)

  const { data: tasks = [], isLoading: tasksLoading } = trpc.tasks.getByDate.useQuery(
    {
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEnd).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const { data: allTasks = [], isLoading: allTasksLoading } = trpc.tasks.getAll.useQuery()

  const { data: scheduledModules = [], isLoading: scheduledModulesLoading } = trpc.tasks.getScheduledModules.useQuery(
    {
      startDate: new Date(selectedWeekStart).toISOString(),
      endDate: new Date(weekEnd).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const { data: taskProjects = [], isLoading: taskProjectsLoading } = trpc.taskProjects.getAll.useQuery()
  const { data: weekReview } = trpc.reviews.getByWeek.useQuery(
    {
      weekStartDate: new Date(selectedWeekStart).toISOString(),
    },
    { enabled: !!selectedWeekStart }
  )

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate()
      utils.tasks.getAll.invalidate()
      setFormData({
        title: '',
        type: 'DeepWork',
        taskProjectId: undefined,
        scheduledDate: 'unassigned',
      })
      setEditingTaskId(null)
      setShowTaskForm(false)
    },
  })

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate()
      utils.tasks.getAll.invalidate()
      // Only reset form if we were editing via the form modal
      if (editingTaskId) {
        setFormData({
          title: '',
          type: 'DeepWork',
          taskProjectId: undefined,
          scheduledDate: 'unassigned',
        })
        setEditingTaskId(null)
        setShowTaskForm(false)
      }
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

  const createTaskProjectMutation = trpc.taskProjects.create.useMutation({
    onSuccess: () => {
      utils.taskProjects.getAll.invalidate()
      setProjectFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: getToday(),
        targetDate: addDays(getToday(), 30),
      })
      setShowProjectForm(false)
    },
  })

  const updateTaskProjectMutation = trpc.taskProjects.update.useMutation({
    onSuccess: () => {
      utils.taskProjects.getAll.invalidate()
      setEditingProjectId(null)
      setProjectFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: getToday(),
        targetDate: addDays(getToday(), 30),
      })
      setShowProjectForm(false)
    },
  })

  const deleteTaskProjectMutation = trpc.taskProjects.delete.useMutation({
    onSuccess: () => {
      utils.taskProjects.getAll.invalidate()
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

    try {
      if (editingTaskId) {
        // Update existing task
        await updateTaskMutation.mutateAsync({
          id: editingTaskId,
          title: formData.title,
          type: formData.type,
          taskProjectId: formData.taskProjectId || null,
          scheduledDate: formData.scheduledDate === 'unassigned' ? null : dayjs(formData.scheduledDate).startOf('day').toDate().toISOString(),
        })
      } else {
        // Create new task
        await createTaskMutation.mutateAsync({
          title: formData.title,
          type: formData.type,
          taskProjectId: formData.taskProjectId || null,
          scheduledDate: formData.scheduledDate === 'unassigned' ? null : dayjs(formData.scheduledDate).startOf('day').toDate().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null)
  const [animatingModuleId, setAnimatingModuleId] = useState<number | null>(null)

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    setAnimatingTaskId(taskId)
    await updateTaskMutation.mutateAsync({
      id: taskId,
      completed: !completed,
      completedAt: !completed ? new Date().toISOString() : null,
    })
    setTimeout(() => setAnimatingTaskId(null), 200)
  }

  const handleToggleModuleComplete = async (
    moduleId: number,
    completed: boolean,
    courseType: 'coding' | 'trading'
  ) => {
    setAnimatingModuleId(moduleId)
    if (courseType === 'coding') {
      await updateModuleScheduleMutation.mutateAsync({
        id: moduleId,
        completed: !completed,
        completedAt: !completed ? new Date().toISOString() : null,
      })
    } else {
      await updateTradingModuleScheduleMutation.mutateAsync({
        id: moduleId,
        completed: !completed,
        completedAt: !completed ? new Date().toISOString() : null,
      })
    }
    setTimeout(() => setAnimatingModuleId(null), 200)
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

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingProjectId) {
      await updateTaskProjectMutation.mutateAsync({
        id: editingProjectId,
        name: projectFormData.name,
        description: projectFormData.description || undefined,
        status: projectFormData.status,
        startDate: projectFormData.startDate ? new Date(projectFormData.startDate).toISOString() : undefined,
        targetDate: projectFormData.targetDate ? new Date(projectFormData.targetDate).toISOString() : undefined,
      })
    } else {
      await createTaskProjectMutation.mutateAsync({
        name: projectFormData.name,
        description: projectFormData.description || undefined,
        status: projectFormData.status,
        startDate: projectFormData.startDate ? new Date(projectFormData.startDate).toISOString() : undefined,
        targetDate: projectFormData.targetDate ? new Date(projectFormData.targetDate).toISOString() : undefined,
      })
    }
  }

  const handleEditProject = (taskProject: typeof taskProjects[0]) => {
    setProjectFormData({
      name: taskProject.name,
      description: taskProject.description || '',
      status: taskProject.status,
      startDate: taskProject.startDate ? new Date(taskProject.startDate).toISOString().split('T')[0] : getToday(),
      targetDate: taskProject.targetDate ? new Date(taskProject.targetDate).toISOString().split('T')[0] : addDays(getToday(), 30),
    })
    setEditingProjectId(taskProject.id)
    setShowProjectForm(true)
  }

  const handleEditTask = (task: typeof tasks[0]) => {
    setFormData({
      title: task.title,
      type: task.type,
      taskProjectId: task.taskProjectId || undefined,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString().split('T')[0] : 'unassigned',
    })
    setEditingTaskId(task.id)
    setShowTaskForm(true)
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Delete this task project? Tasks linked to it will remain but lose the link.')) return
    await deleteTaskProjectMutation.mutateAsync({ id })
  }

  const getProjectTasks = (taskProjectId: number) => {
    return allTasks.filter((t) => t.taskProjectId === taskProjectId)
  }

  const getProjectProgress = (taskProject: typeof taskProjects[0]): number => {
    const projectTasks = getProjectTasks(taskProject.id)
    if (projectTasks.length === 0) return 0
    const completed = projectTasks.filter((t) => t.completed).length
    return (completed / projectTasks.length) * 100
  }

  const getBacklogTasks = () => {
    // Tasks without a scheduled date (unassigned tasks)
    return allTasks.filter((t) => !t.scheduledDate)
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

  const isLoading = tasksLoading || taskProjectsLoading || scheduledModulesLoading || allTasksLoading

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <p className="text-neutral-500 dark:text-neutral-500">Loading...</p>
      </div>
    )
  }

  const incompleteTasks = getIncompleteTasks()
  const backlogTasks = getBacklogTasks()
  const hasReview = reviewData.wins || reviewData.mistakes || reviewData.nextWeekGoals

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[36px] font-bold text-neutral-900 dark:text-neutral-900 mb-1">Tasks</h1>
          <p className="text-base text-neutral-600 dark:text-neutral-600">Plan your week and manage your tasks</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'projects') {
              setShowProjectForm(true)
              setEditingProjectId(null)
              setProjectFormData({
                name: '',
                description: '',
                status: 'active',
                startDate: getToday(),
                targetDate: addDays(getToday(), 30),
              })
            } else {
              setEditingTaskId(null)
              setFormData({
                title: '',
                type: 'DeepWork',
                taskProjectId: undefined,
                scheduledDate: 'unassigned',
              })
              setShowTaskForm(!showTaskForm)
            }
          }}
          className="px-6 py-3 bg-primary-500 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600 transition-all duration-150 shadow-sm hover:shadow-md font-semibold text-sm flex items-center gap-2 hover:-translate-y-0.5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {activeTab === 'projects' ? 'Add Project' : 'Add Task'}
        </button>
      </div>

      {/* Tab Navigation */}
      <TasksTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {taskProjects.length === 0 ? (
              <div className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-8">
                <p className="text-neutral-500 dark:text-neutral-500 text-center">
                  No task projects yet. Add your first task project above!
                </p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {taskProjects.map((taskProject) => {
                  const projectTasks = getProjectTasks(taskProject.id)
                  const progress = getProjectProgress(taskProject)
                  const statusColors = {
                    active: 'bg-success-100 dark:bg-success-500/15 text-success-600 dark:text-success-500',
                    completed: 'bg-success-100 dark:bg-success-500/15 text-success-600 dark:text-success-500',
                    paused: 'bg-neutral-200 dark:bg-neutral-200 text-neutral-600 dark:text-neutral-600',
                  }

                  return (
                    <motion.div
                      key={taskProject.id}
                      variants={createVariants}
                      className="group relative bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      {/* Hover Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditProject(taskProject)
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-neutral-50 border border-neutral-200 dark:border-neutral-200 text-primary-600 dark:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-50 hover:border-primary-300 dark:hover:border-primary-300 transition-all duration-150 shadow-sm"
                          title="Edit project"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(taskProject.id)
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-neutral-50 border border-neutral-200 dark:border-neutral-200 text-error-600 dark:text-error-500 hover:bg-error-100 dark:hover:bg-error-500/15 hover:border-error-400 dark:hover:border-error-400 transition-all duration-150 shadow-sm"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-20">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-900">
                              {taskProject.name}
                            </h3>
                            <span
                              className={`px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide ${statusColors[taskProject.status]}`}
                            >
                              {taskProject.status}
                            </span>
                          </div>
                          {taskProject.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-600 mb-3">
                              {taskProject.description}
                            </p>
                          )}
                          {taskProject.startDate && taskProject.targetDate && (
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-500">
                              {formatDisplayDate(taskProject.startDate.toISOString())} - {formatDisplayDate(taskProject.targetDate.toISOString())}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] text-neutral-500 dark:text-neutral-500">
                            {projectTasks.filter((t) => t.completed).length} of {projectTasks.length} tasks completed
                          </span>
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-500">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-[6px] bg-neutral-200 dark:bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Backlog Tab */}
        {activeTab === 'backlog' && (
          <motion.div
            key="backlog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-6">
              {backlogTasks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-50 flex items-center justify-center text-neutral-500 dark:text-neutral-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-900 mb-2">No tasks in backlog</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">Tasks without assigned dates will appear here.</p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  {backlogTasks.map((task) => {
                    const taskProject = taskProjects.find((p) => p.id === task.taskProjectId)
                    const taskTypeDisplay =
                      task.type === 'DeepWork' ? 'Deep Work' : task.type === 'TradingPractice' ? 'Trading Practice' : task.type

                    return (
                      <motion.div
                        key={task.id}
                        variants={createVariants}
                        className="flex items-start justify-between p-4 border border-neutral-200 dark:border-neutral-200 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-150"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-1 bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500 rounded uppercase tracking-wide">
                              {taskTypeDisplay}
                            </span>
                            {taskProject && (
                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
                                {taskProject.name}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-900">
                            {task.title}
                          </h4>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-xs px-3 py-1.5 rounded-md border border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors font-medium"
                            title="Edit task"
                          >
                            Edit
                          </button>
                          <DatePicker
                            value={task.scheduledDate ? new Date(task.scheduledDate).toISOString().split('T')[0] : undefined}
                            onChange={(date) => handleAssignTask(task, date)}
                            placeholder="Assign date"
                            variant="icon"
                          />
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-xs px-3 py-1.5 rounded-md border border-error-500 dark:border-error-500 text-error-600 dark:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Week Selector */}
            <div className="mb-6 bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-200 bg-transparent text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-50 hover:text-neutral-900 dark:hover:text-neutral-900 transition-all duration-150 flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className="text-base font-semibold text-neutral-900 dark:text-neutral-900">{formatWeekRange(selectedWeekStart)}</span>
                <button
                  onClick={() => navigateWeek('next')}
                  className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-200 bg-transparent text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-50 hover:text-neutral-900 dark:hover:text-neutral-900 transition-all duration-150 flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedWeekStart(getWeekStartSunday())}
                  className="px-4 py-2 bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500 rounded-md text-[13px] font-semibold hover:bg-primary-100 dark:hover:bg-primary-500/25 transition-all duration-150"
                >
                  This Week
                </button>
              </div>
              <div className="flex items-center gap-3">
                {incompleteTasks.length > 0 && (
                  <button
                    onClick={() => setShowRolloverDialog(true)}
                    className="px-4 py-2 bg-accent-100 dark:bg-accent-500/15 text-[#B45309] dark:text-accent-500 rounded-md text-[13px] font-semibold hover:bg-accent-50 dark:hover:bg-accent-500/25 transition-all duration-150 flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                    </svg>
                    Rollover Incomplete ({incompleteTasks.length})
                  </button>
                )}
              </div>
            </div>

      {/* Week View - Horizontal Date Sections */}
      <div className="mb-8 space-y-6">
          {weekDays.map((date, idx) => {
            const dayTasks = getTasksForDay(date)
            const dayModules = getScheduledModulesForDay(date)
            const isToday = isSameDay(date, today)
            const isSunday = idx === 6
          const hasItems = dayTasks.length > 0 || dayModules.length > 0

            return (
            <motion.div
                key={date}
              variants={createVariants}
              initial="initial"
              animate="animate"
              className={`p-6 rounded-xl border transition-all duration-200 ${
                  isToday
                  ? 'border-primary-500 dark:border-primary-500 bg-primary-50/30 dark:bg-primary-500/10 shadow-md'
                    : isSunday
                  ? 'border-primary-200 dark:border-primary-200 bg-primary-50/50 dark:bg-primary-500/5 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-200 bg-neutral-0 dark:bg-neutral-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-baseline gap-2 ${
                  isToday ? 'text-primary-600 dark:text-primary-500' : 'text-neutral-900 dark:text-neutral-900'
                }`}>
                  <span className="text-2xl font-bold">{dayjs(date).format('D')}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">{dayNames[idx]}</span>
                    </div>
                    {isSunday && (
                  <span className="text-[10px] font-bold bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-600 text-white px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                        Planning
                      </span>
                    )}
                {isToday && (
                  <span className="text-[10px] font-bold bg-primary-500 dark:bg-primary-500 text-white px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    Today
                  </span>
                )}
                  </div>

              {/* Cards Container */}
              {!hasItems ? (
                <div className="py-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">No tasks</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                      {/* Scheduled Modules */}
                        {dayModules.map((module) => {
                          const isAnimating = animatingModuleId === module.id
                          return (
                          <motion.div
                            key={`module-${module.id}`}
                            variants={createVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                          className="group p-4 border border-[#9333EA] dark:border-[#9333EA] rounded-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-900/20 dark:to-purple-900/5 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer hover:-translate-y-0.5"
                            onClick={() => handleNavigateToCourse(module)}
                          >
                          <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-semibold px-2 py-1 bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 rounded uppercase tracking-wide">
                                  {module.courseType === 'coding' ? '💻 Coding' : '📈 Trading'}
                                  </span>
                                  {module.completed && (
                                  <span className="text-[10px] font-medium px-2 py-1 bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-500 rounded uppercase tracking-wide">
                                      ✓ Done
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleModuleComplete(module.id, module.completed, module.courseType)
                                    }}
                                    className={`text-xs px-2 py-0.5 rounded-md border transition-all duration-200 font-medium ${
                                      module.completed
                                        ? 'border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-800/50'
                                        : 'border-success-500 dark:border-success-500 text-success-600 dark:text-success-500 hover:border-success-600 dark:hover:border-success-600 hover:bg-success-50 dark:hover:bg-success-500/10'
                                    }`}
                                    title={module.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                  >
                                    {module.completed ? '↶ Undo' : '✓ Done'}
                                  </button>
                                </div>
                              </div>
                              <motion.div animate={isAnimating ? updateVariants.animate : {}}>
                              <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1 opacity-90">
                                  {module.courseName}
                                </p>
                                <p
                                className={`text-sm font-semibold leading-tight ${
                                    module.completed
                                      ? 'line-through text-neutral-500 dark:text-neutral-500 opacity-60'
                                      : 'text-neutral-900 dark:text-neutral-900'
                                  }`}
                                >
                                  {module.name}
                                </p>
                              </motion.div>
                              {/* Bottom-right action bar */}
                              <div className="flex justify-end mt-1">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                  <DatePicker
                                    value={module.scheduledDate ? new Date(module.scheduledDate).toISOString().split('T')[0] : undefined}
                                    onChange={(date) => handleRescheduleModule(module, date)}
                                    placeholder="Schedule"
                                    variant="icon"
                                    triggerClassName="p-1.5 rounded-md border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-all duration-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          )
                        })}

                      {/* Regular Tasks */}
                        {dayTasks.map((task) => {
                          const taskProject = taskProjects.find((p) => p.id === task.taskProjectId)
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
                            className={`group p-4 border rounded-lg transition-all duration-200 ${
                                task.completed
                                ? 'bg-gradient-to-br from-neutral-50 to-neutral-50/50 dark:from-neutral-50 dark:to-neutral-50/50 border-neutral-300 dark:border-neutral-300 opacity-60'
                                : 'bg-gradient-to-br from-primary-50 to-primary-50/50 dark:from-primary-900/20 dark:to-primary-900/5 border-primary-300 dark:border-primary-600 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-semibold px-2 py-1 bg-primary-200 dark:bg-primary-800/50 text-primary-800 dark:text-primary-200 rounded uppercase tracking-wide">
                                    {taskTypeDisplay}
                                  </span>
                                  {task.completed && (
                                    <span className="text-[10px] font-medium px-2 py-1 bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-500 rounded uppercase tracking-wide">
                                      ✓ Done
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleComplete(task.id, task.completed)
                                    }}
                                    className={`text-xs px-2 py-0.5 rounded-md border transition-all duration-200 font-medium ${
                                      task.completed
                                        ? 'border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800/50'
                                        : 'border-success-500 dark:border-success-500 text-success-600 dark:text-success-500 hover:border-success-600 dark:hover:border-success-600 hover:bg-success-50 dark:hover:bg-success-500/10'
                                    }`}
                                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                  >
                                    {task.completed ? '↶ Undo' : '✓ Done'}
                                  </button>
                                </div>
                              </div>
                              <motion.div animate={isAnimating ? updateVariants.animate : {}}>
                                {taskProject && (
                                  <p className="text-xs font-medium text-primary-900 dark:text-primary-100 mb-1 opacity-90">
                                    {taskProject.name}
                                  </p>
                                )}
                                <p
                                  className={`text-sm font-semibold leading-tight ${
                                    task.completed
                                      ? 'line-through text-neutral-500 dark:text-neutral-500 opacity-60'
                                      : 'text-neutral-900 dark:text-neutral-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                              </motion.div>
                              {/* Bottom-right action bar */}
                              <div className="flex justify-end mt-1">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleEditTask(task)}
                                    className="p-1.5 rounded-md border border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-all duration-200"
                                    title="Edit task"
                                    aria-label="Edit task"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <DatePicker
                                    value={new Date(task.scheduledDate).toISOString().split('T')[0]}
                                    onChange={(date) => handleAssignTask(task, date)}
                                    placeholder="Assign date"
                                    variant="icon"
                                    triggerClassName="p-1.5 rounded-md border border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-all duration-200"
                                  />
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-1.5 rounded-md border border-error-500 dark:border-error-500 text-error-600 dark:text-error-500 hover:border-error-600 dark:hover:border-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-200"
                                    title="Delete task"
                                    aria-label="Delete task"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Form Modal - Available on all tabs */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity" onClick={() => {
          setShowTaskForm(false)
          setEditingTaskId(null)
          setFormData({
            title: '',
            type: 'DeepWork',
            taskProjectId: undefined,
            scheduledDate: 'unassigned',
          })
        }}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface dark:bg-surface-dark rounded-xl shadow-2xl p-6 max-w-2xl w-full border border-border dark:border-border-dark transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
                  {editingTaskId ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                        placeholder="e.g., Complete React module"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      >
                        {taskTypes.map((type) => (
                          <option key={type} value={type}>
                            {type === 'DeepWork' ? 'Deep Work' : type === 'TradingPractice' ? 'Trading Practice' : type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Task Project (Optional)</label>
                      <select
                        value={formData.taskProjectId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taskProjectId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      >
                        <option value="">None</option>
                        {taskProjects
                          .filter((p) => p.status === 'active')
                          .map((taskProject) => (
                            <option key={taskProject.id} value={taskProject.id}>
                              {taskProject.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">Assign to Day</label>
                      <select
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      >
                        <option value="unassigned">Unassigned (Backlog)</option>
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
                        setEditingTaskId(null)
                        setFormData({
                          title: '',
                          type: 'DeepWork',
                          taskProjectId: undefined,
                          scheduledDate: 'unassigned',
                        })
                      }}
                      className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors font-medium shadow-sm"
                    >
                      {editingTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Project Form Modal - Available on all tabs */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm z-40 transition-opacity">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface dark:bg-surface-dark rounded-xl shadow-2xl p-6 max-w-md w-full border border-border dark:border-border-dark transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
                  {editingProjectId ? 'Edit Project' : 'Add Project'}
                </h3>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      placeholder="e.g., Build Portfolio App"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                      Description
                    </label>
                    <textarea
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      placeholder="Project description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                      Status
                    </label>
                    <select
                      value={projectFormData.status}
                      onChange={(e) =>
                        setProjectFormData({ ...projectFormData, status: e.target.value as 'active' | 'completed' | 'paused' })
                      }
                      className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={projectFormData.startDate}
                        onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={projectFormData.targetDate}
                        onChange={(e) => setProjectFormData({ ...projectFormData, targetDate: e.target.value })}
                        className="w-full px-3 py-2 bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false)
                        setEditingProjectId(null)
                        setProjectFormData({
                          name: '',
                          description: '',
                          status: 'active',
                          startDate: getToday(),
                          targetDate: addDays(getToday(), 30),
                        })
                      }}
                      className="px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-lg hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors font-medium shadow-sm"
                    >
                      {editingProjectId ? 'Update' : 'Add'} Project
                    </button>
                  </div>
                </form>
              </motion.div>
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
