'use client'

import { useEffect, useState } from 'react'
import { db } from '@/src/db'
import { Card } from '@/src/components'
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
import type { Task, Project, TaskType, Review } from '@/src/types'
import dayjs from 'dayjs'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getWeekStartSunday())
  const [isLoading, setIsLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showReviewSection, setShowReviewSection] = useState(false)
  const [showRolloverDialog, setShowRolloverDialog] = useState(false)

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    type: 'Deep Work',
    projectId: undefined,
    completed: false,
    scheduledDate: getToday(),
  })

  const [reviewData, setReviewData] = useState<Partial<Review>>({
    weekStartDate: getWeekStartSunday(),
    wins: '',
    mistakes: '',
    nextWeekGoals: '',
  })

  const taskTypes: TaskType[] = [
    'Deep Work',
    'Gym',
    'Trading Practice',
    'Coding',
    'Review',
    'Other',
  ]

  const weekDays = getWeekDays(selectedWeekStart)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = getToday()

  useEffect(() => {
    loadData()
  }, [selectedWeekStart])

  const loadData = async () => {
    setIsLoading(true)
    const weekEnd = getWeekEndSaturday(selectedWeekStart)

    // Load tasks for the week
    const allTasks = await db.tasks
      .where('scheduledDate')
      .between(selectedWeekStart, weekEnd, true, true)
      .toArray()
    setTasks(allTasks)

    // Load projects
    const allProjects = await db.projects.toArray()
    setProjects(allProjects)

    // Load review for this week
    const weekReview = await db.reviews
      .where('weekStartDate')
      .equals(selectedWeekStart)
      .first()
    if (weekReview) {
      setReviewData({
        weekStartDate: weekReview.weekStartDate,
        wins: weekReview.wins,
        mistakes: weekReview.mistakes,
        nextWeekGoals: weekReview.nextWeekGoals,
      })
    } else {
      setReviewData({
        weekStartDate: selectedWeekStart,
        wins: '',
        mistakes: '',
        nextWeekGoals: '',
      })
    }

    setIsLoading(false)
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const taskData: Omit<Task, 'id'> = {
      title: formData.title || '',
      type: formData.type || 'Deep Work',
      projectId: formData.projectId,
      completed: false,
      scheduledDate: formData.scheduledDate || selectedWeekStart,
    }

    await db.tasks.add(taskData)

    // Reset form
    setFormData({
      title: '',
      type: 'Deep Work',
      projectId: undefined,
      completed: false,
      scheduledDate: selectedWeekStart,
    })
    setShowTaskForm(false)

    loadData()
  }

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    const now = new Date().toISOString()
    await db.tasks.update(taskId, {
      completed: !completed,
      completedAt: !completed ? now : undefined,
    })
    loadData()
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task?')) return
    await db.tasks.delete(taskId)
    loadData()
  }

  const handleAssignTask = async (task: Task, newDate: string) => {
    await db.tasks.update(task.id!, {
      scheduledDate: newDate,
    })
    loadData()
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const existing = await db.reviews
      .where('weekStartDate')
      .equals(selectedWeekStart)
      .first()

    const reviewDataToSave: Omit<Review, 'id'> = {
      weekStartDate: selectedWeekStart,
      wins: reviewData.wins || '',
      mistakes: reviewData.mistakes || '',
      nextWeekGoals: reviewData.nextWeekGoals || '',
      metrics: await generateMetrics(),
    }

    if (existing) {
      await db.reviews.update(existing.id!, reviewDataToSave)
    } else {
      await db.reviews.add(reviewDataToSave)
    }

    loadData()
  }

  const generateMetrics = async () => {
    const weekEnd = getWeekEndSaturday(selectedWeekStart)

    const tasks = await db.tasks
      .where('scheduledDate')
      .between(selectedWeekStart, weekEnd, true, true)
      .toArray()

    const fitnessLogs = await db.fitnessLogs
      .where('date')
      .between(selectedWeekStart, weekEnd, true, true)
      .toArray()

    const trades = await db.trades
      .where('date')
      .between(selectedWeekStart, weekEnd, true, true)
      .toArray()

    const courses = await db.codingCourses.toArray()
    const modules = await db.courseModules.toArray()
    const totalModules = modules.length
    const completedModules = modules.filter((m) => m.completed).length

    return {
      tasksCompleted: tasks.filter((t) => t.completed).length,
      tasksTotal: tasks.length,
      fitnessLogs: fitnessLogs.length,
      tradesCount: trades.length,
      tradesPnl: trades.reduce((sum, t) => sum + t.pnl, 0),
      codingProgress: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
    }
  }

  const handleRollover = async () => {
    const weekEnd = getWeekEndSaturday(selectedWeekStart)
    const incompleteTasks = tasks.filter((t) => !t.completed)
    const nextWeekStart = addDays(selectedWeekStart, 7)

    for (const task of incompleteTasks) {
      await db.tasks.update(task.id!, {
        scheduledDate: nextWeekStart,
      })
    }

    setShowRolloverDialog(false)
    loadData()
  }

  const getTasksForDay = (date: string): Task[] => {
    return tasks.filter((t) => isSameDay(t.scheduledDate, date))
  }

  const getIncompleteTasks = (): Task[] => {
    return tasks.filter((t) => !t.completed)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev'
      ? addDays(selectedWeekStart, -7)
      : addDays(selectedWeekStart, 7)
    setSelectedWeekStart(newWeekStart)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  const incompleteTasks = getIncompleteTasks()
  const hasReview = reviewData.wins || reviewData.mistakes || reviewData.nextWeekGoals

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-2 text-gray-600">Plan your week and manage your tasks</p>
      </div>

      {/* Week Selector */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm h-10"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 shadow-sm h-10">
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(getWeekStartSunday(e.target.value))}
              className="border-0 bg-transparent text-gray-700 font-medium focus:outline-none focus:ring-0 cursor-pointer h-full py-0"
            />
            <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">{formatWeekRange(selectedWeekStart)}</span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm h-10"
          >
            Next →
          </button>
          <button
            onClick={() => setSelectedWeekStart(getWeekStartSunday())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors h-10"
          >
            This Week
          </button>
        </div>
        <div className="flex items-center gap-2">
          {incompleteTasks.length > 0 && (
            <button
              onClick={() => setShowRolloverDialog(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm font-medium text-sm"
            >
              Rollover Incomplete ({incompleteTasks.length})
            </button>
          )}
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm font-medium text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Complete React module"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Day</label>
                <select
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    type: 'Deep Work',
                    projectId: undefined,
                    completed: false,
                    scheduledDate: selectedWeekStart,
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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

      {/* Week View - Day Columns */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((date, idx) => {
            const dayTasks = getTasksForDay(date)
            const isToday = isSameDay(date, today)
            const isSunday = idx === 0

            return (
              <div
                key={date}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  isToday
                    ? 'border-blue-500 shadow-md'
                    : isSunday
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {dayNames[idx]}
                      </div>
                      <div
                        className={`text-xl font-bold mt-0.5 ${
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {dayjs(date).format('D')}
                      </div>
                    </div>
                    {isSunday && (
                      <span className="text-xs font-semibold bg-blue-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                        Planning
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 min-h-[350px]">
                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-[300px]">
                        <p className="text-sm text-gray-400">No tasks</p>
                      </div>
                    ) : (
                      dayTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId)
                        return (
                          <div
                            key={task.id}
                            className={`group p-3 border rounded-lg transition-all ${
                              task.completed
                                ? 'bg-gray-50 border-gray-200 opacity-60'
                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id!, task.completed)}
                                className="mt-0.5 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium ${
                                    task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                                    {task.type}
                                  </span>
                                  {project && (
                                    <span className="text-xs text-gray-500 truncate">• {project.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <select
                                  value={task.scheduledDate}
                                  onChange={(e) => handleAssignTask(task, e.target.value)}
                                  className="text-xs border border-gray-300 rounded-md px-1.5 py-1 bg-white focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {weekDays.map((d, i) => (
                                    <option key={d} value={d}>
                                      {dayNames[i]}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleDelete(task.id!)}
                                  className="text-red-600 hover:text-red-800 text-lg font-bold leading-none px-1 hover:bg-red-50 rounded transition-colors"
                                  title="Delete task"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Review Section */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Weekly Review</span>
            <button
              onClick={() => setShowReviewSection(!showReviewSection)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
            >
              {showReviewSection ? 'Collapse' : 'Expand'}
            </button>
          </div>
        }
      >
        {showReviewSection && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wins</label>
              <textarea
                value={reviewData.wins}
                onChange={(e) => setReviewData({ ...reviewData, wins: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What went well this week?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mistakes & Learnings</label>
              <textarea
                value={reviewData.mistakes}
                onChange={(e) => setReviewData({ ...reviewData, mistakes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What could be improved?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Goals</label>
              <textarea
                value={reviewData.nextWeekGoals}
                onChange={(e) => setReviewData({ ...reviewData, nextWeekGoals: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              <span className="font-semibold text-gray-700">Wins: </span>
              <span className="text-gray-700 whitespace-pre-wrap">{reviewData.wins}</span>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-semibold text-gray-700">Mistakes & Learnings: </span>
              <span className="text-gray-700 whitespace-pre-wrap">{reviewData.mistakes}</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-semibold text-gray-700">Next Week Goals: </span>
              <span className="text-gray-700 whitespace-pre-wrap">{reviewData.nextWeekGoals}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Rollover Dialog */}
      {showRolloverDialog && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40" onClick={() => setShowRolloverDialog(false)}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rollover Incomplete Tasks</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Move {incompleteTasks.length} incomplete task{incompleteTasks.length !== 1 ? 's' : ''} to next week?
                </p>
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {incompleteTasks.map((task) => (
                    <div key={task.id} className="text-sm text-gray-700 p-2 bg-white rounded-md border border-gray-200">
                      {task.title}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRolloverDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRollover}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm transition-colors"
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
