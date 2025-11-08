'use client'

import Link from 'next/link'
import { trpc } from '@/src/lib/trpc-client'
import { Card, ProgressBar } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import {
  getToday,
  getWeekStart,
  getWeekEnd,
  getProgressPercentage,
  formatDisplayDate,
  getDaysRemaining,
} from '@/src/utils/date'

function DashboardContent() {
  const today = getToday()
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  // Load settings for transformation progress
  const { data: startDateSetting } = trpc.settings.getByKey.useQuery({ key: 'transformationStartDate' })
  const { data: endDateSetting } = trpc.settings.getByKey.useQuery({ key: 'transformationEndDate' })

  // Load all data
  const { data: courses = [] } = trpc.codingCourses.getAll.useQuery()
  const { data: fitnessLogs = [] } = trpc.fitness.getByDateRange.useQuery({
    startDate: new Date(weekStart).toISOString(),
    endDate: new Date(weekEnd).toISOString(),
  })
  const { data: tradingStats } = trpc.trades.getStats.useQuery({})
  const { data: todayTasks = [] } = trpc.tasks.getByDate.useQuery({
    startDate: new Date(today).toISOString(),
    endDate: new Date(today).toISOString(),
  })

  // Calculate transformation progress
  const startDate = startDateSetting?.value || today
  const endDate = endDateSetting?.value || ''
  const transformationProgress = endDate ? getProgressPercentage(startDate, endDate) : 0
  const daysRemaining = endDate ? getDaysRemaining(endDate, today < startDate ? startDate : today) : 0

  // Calculate coding progress
  let totalModules = 0
  let completedModules = 0
  courses.forEach((course) => {
    totalModules += course.modules?.length || 0
    completedModules += course.modules?.filter((m) => m.completed).length || 0
  })
  const codingProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  // Get latest weight
  const sortedLogs = [...fitnessLogs]
    .filter((log) => log.weight != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestWeight = sortedLogs[0]?.weight

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">180-Day Transformation Overview</p>
      </div>

      {/* 180-Day Progress */}
      {startDate && endDate && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transformation Progress</h2>
              <p className="text-sm text-gray-600 mt-1">
                {daysRemaining} days remaining • Started {formatDisplayDate(startDate)}
              </p>
            </div>
          </div>
          <ProgressBar progress={transformationProgress} color="career" />
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coding Progress</p>
              <p className="text-2xl font-bold text-blue-500 mt-1">{Math.round(codingProgress)}%</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/coding" className="text-sm text-blue-500 hover:underline">
              View courses →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fitness</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {latestWeight ? `${latestWeight} lbs` : 'No data'}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/fitness" className="text-sm text-amber-500 hover:underline">
              View logs →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trading</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                ${tradingStats?.totalPnL?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tradingStats?.totalTrades || 0} trades • {tradingStats?.winRate?.toFixed(1) || 0}% win rate
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/trading" className="text-sm text-emerald-500 hover:underline">
              View journal →
            </Link>
          </div>
        </Card>
      </div>

      {/* Today's Tasks & Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Today's Tasks">
          {todayTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks scheduled for today</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-900'}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{task.type}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link href="/tasks" className="text-sm text-blue-500 hover:underline">
              View all tasks →
            </Link>
          </div>
        </Card>

        <Card title="This Week's Activity">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Fitness Logs</p>
              <p className="text-lg font-semibold text-amber-500">{fitnessLogs.length} entries</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Week Range</p>
              <p className="text-sm text-gray-900">
                {formatDisplayDate(weekStart)} - {formatDisplayDate(weekEnd)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/review" className="text-sm text-blue-500 hover:underline">
              Weekly Review →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
