'use client'

import dayjs from 'dayjs'
import { Tooltip } from 'recharts'

interface ContributionGraphProps {
  data: Record<string, { completed: number; total: number }>
  startDate: string
  endDate: string
  onDateClick?: (date: string) => void
}

export function ContributionGraph({ data, startDate, endDate, onDateClick }: ContributionGraphProps) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const days = []
  let current = start.startOf('week') // Start from the beginning of the week

  // Generate all days from start to end, grouped by weeks
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  const getIntensity = (date: string) => {
    const dayData = data[date]
    if (!dayData || dayData.total === 0) return 0
    return Math.min(dayData.completed / dayData.total, 1)
  }

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark'
    if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900'
    if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700'
    if (intensity < 0.75) return 'bg-green-500 dark:bg-green-600'
    return 'bg-green-600 dark:bg-green-500'
  }

  // Group days by weeks (Sunday to Saturday)
  const weeks: string[][] = []
  let currentWeek: string[] = []

  days.forEach((date) => {
    const dayOfWeek = dayjs(date).day() // 0 = Sunday, 6 = Saturday
    currentWeek.push(date)

    // If it's Saturday (end of week) or we've reached the end date, start a new week
    if (dayOfWeek === 6 || dayjs(date).isSame(end, 'day')) {
      // Pad the week if it doesn't start on Sunday
      while (currentWeek.length > 0 && dayjs(currentWeek[0]).day() !== 0) {
        currentWeek.unshift('') // Empty string for padding
      }
      // Pad the week if it doesn't end on Saturday
      while (currentWeek.length < 7 && !dayjs(date).isSame(end, 'day')) {
        currentWeek.push('') // Empty string for padding
      }
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  // Handle remaining days
  if (currentWeek.length > 0) {
    // Pad to start on Sunday
    while (dayjs(currentWeek[0]).day() !== 0) {
      currentWeek.unshift('')
    }
    // Pad to end on Saturday
    while (currentWeek.length < 7) {
      currentWeek.push('')
    }
    weeks.push(currentWeek)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />
              }
              const intensity = getIntensity(date)
              const isToday = dayjs(date).isSame(dayjs(), 'day')
              const dayData = data[date]

              return (
                <div
                  key={date}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-accent-blue dark:hover:ring-accent-blue-dark ${
                    getColor(intensity)
                  } ${isToday ? 'ring-2 ring-accent-blue dark:ring-accent-blue-dark' : ''}`}
                  onClick={() => onDateClick?.(date)}
                  title={
                    dayData
                      ? `${dayjs(date).format('MMM D, YYYY')}: ${dayData.completed}/${dayData.total} habits`
                      : dayjs(date).format('MMM D, YYYY')
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
          Less
        </span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface dark:bg-surface-dark border border-border dark:border-border-dark" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
          More
        </span>
      </div>
    </div>
  )
}
