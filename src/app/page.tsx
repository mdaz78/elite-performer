'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/src/db'
import { Card, ProgressBar } from '@/src/components'
import {
  getToday,
  getWeekStart,
  getWeekEnd,
  getProgressPercentage,
  formatDisplayDate,
  getDaysRemaining,
} from '@/src/utils/date'
import type { CodingCourse, CourseModule, Task, Trade, FitnessLog, Settings } from '@/src/types'

export default function Dashboard() {
  const [codingProgress, setCodingProgress] = useState(0)
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([])
  const [tradingStats, setTradingStats] = useState({
    totalPnl: 0,
    winRate: 0,
    tradeCount: 0,
  })
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [transformationProgress, setTransformationProgress] = useState(0)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const today = getToday()
    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()

    // Load transformation dates
    const startDateSetting = await db.settings.where('key').equals('transformationStartDate').first()
    const endDateSetting = await db.settings.where('key').equals('transformationEndDate').first()

    const start = startDateSetting?.value || today
    const end = endDateSetting?.value || ''

    setStartDate(start)
    setEndDate(end)

    if (end) {
      const progress = getProgressPercentage(start, end)
      // Calculate days remaining: if today is before start, use full period, otherwise calculate from today
      const today = getToday()
      const remaining = getDaysRemaining(end, today < start ? start : today)
      setTransformationProgress(progress)
      setDaysRemaining(remaining)
    }

    // Calculate coding progress
    const courses = await db.codingCourses.toArray()
    const modules = await db.courseModules.toArray()

    let totalModules = 0
    let completedModules = 0

    courses.forEach((course) => {
      const courseModules = modules.filter((m) => m.courseId === course.id)
      totalModules += courseModules.length
      completedModules += courseModules.filter((m) => m.completed).length
    })

    const codingProg = totalModules > 0 ? (completedModules / totalModules) * 100 : 0
    setCodingProgress(codingProg)

    // Load recent fitness logs
    const recentLogs = await db.fitnessLogs
      .where('date')
      .between(weekStart, weekEnd, true, true)
      .toArray()
    setFitnessLogs(recentLogs)

    // Calculate trading stats
    const allTrades = await db.trades.toArray()
    const totalPnl = allTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const winningTrades = allTrades.filter((trade) => trade.pnl > 0).length
    const winRate = allTrades.length > 0 ? (winningTrades / allTrades.length) * 100 : 0

    setTradingStats({
      totalPnl,
      winRate,
      tradeCount: allTrades.length,
    })

    // Load today's tasks
    const tasks = await db.tasks
      .where('scheduledDate')
      .equals(today)
      .toArray()
    setTodayTasks(tasks)
  }

  const latestWeight = fitnessLogs
    .filter((log) => log.weight)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight

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
                ${tradingStats.totalPnl.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tradingStats.tradeCount} trades • {tradingStats.winRate.toFixed(1)}% win rate
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
                {formatDisplayDate(getWeekStart())} - {formatDisplayDate(getWeekEnd())}
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
