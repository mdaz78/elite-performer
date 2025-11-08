'use client'

import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { Flame, Edit, Trash2, Pause, Play, Check } from 'lucide-react'

interface HabitCardProps {
  habit: {
    id: number
    name: string
    icon: string | null
    status: 'active' | 'paused'
    subHabits?: Array<{ id: number; name: string; order: number }>
    completion?: { completed: boolean } | null
    subHabitCompletions?: Array<{ subHabitId: number; completed: boolean }>
  }
  currentStreak?: number
  bestStreak?: number
  completionRate?: number
  weeklyProgress?: number
  onToggleComplete: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPause?: () => void
  onResume?: () => void
  showActions?: boolean
}

export function HabitCard({
  habit,
  currentStreak = 0,
  bestStreak = 0,
  completionRate = 0,
  weeklyProgress = 0,
  onToggleComplete,
  onEdit,
  onDelete,
  onPause,
  onResume,
  showActions = false,
}: HabitCardProps) {
  const isComplete = habit.completion?.completed || false
  const completedSubHabits = (habit.subHabitCompletions || []).filter((sc) => sc.completed).length
  const totalSubHabits = habit.subHabits?.length || 0
  const progress = totalSubHabits > 0 ? (completedSubHabits / totalSubHabits) * 100 : isComplete ? 100 : 0
  const todayProgress = isComplete ? 100 : (totalSubHabits > 0 ? (completedSubHabits / totalSubHabits) * 100 : 0)

  // Determine if streak is broken (streak is 0 but habit was previously completed)
  const streakBroken = currentStreak === 0 && completionRate > 0

  const renderIcon = () => {
    if (!habit.icon) {
      return (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-blue-100 text-blue-600">
          {habit.name.charAt(0).toUpperCase()}
        </div>
      )
    }

    const IconComponent = (LucideIcons as any)[habit.icon] as React.ComponentType<{ className?: string }>
    if (!IconComponent) {
      return (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-blue-100 text-blue-600">
          {habit.name.charAt(0).toUpperCase()}
        </div>
      )
    }

    // Map icon colors and backgrounds based on icon name
    const iconStyles: Record<string, { bg: string; text: string }> = {
      Droplet: { bg: 'bg-blue-100', text: 'text-blue-600' },
      Running: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      BookOpen: { bg: 'bg-green-100', text: 'text-green-600' },
      Brain: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      Laptop: { bg: 'bg-gray-100', text: 'text-gray-800' },
    }

    const iconStyle = iconStyles[habit.icon] || { bg: 'bg-blue-100', text: 'text-blue-600' }

    return (
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyle.bg}`}>
        <IconComponent className={`w-6 h-6 ${iconStyle.text}`} />
      </div>
    )
  }

  // Get metric columns based on habit type
  const getMetrics = () => {
    if (totalSubHabits > 0) {
      // For habits with sub-habits, show progress
      const subHabitName = habit.subHabits?.[0]?.name || 'Items'
      // Try to extract a unit or make it more readable
      const firstMetric = `${completedSubHabits}/${totalSubHabits} ${subHabitName}`
      return [
        firstMetric,
        `${Math.round(todayProgress)}% Today`,
        `${Math.round(weeklyProgress)}% This Week`,
      ]
    }
    // For simple habits without sub-habits
    return [
      isComplete ? 'Completed' : '0/1',
      `${Math.round(todayProgress)}% Today`,
      `${Math.round(weeklyProgress)}% This Week`,
    ]
  }

  const metrics = getMetrics()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 relative h-full flex flex-col"
    >
      {/* Completion Checkbox - Top Right */}
      <button
        onClick={onToggleComplete}
        className={`absolute top-5 right-5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isComplete
            ? 'bg-purple-600 border-purple-600 text-white'
            : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        {isComplete && <Check className="w-5 h-5" />}
      </button>

      {/* Icon - Top Left */}
      <div className="mb-3">
        {renderIcon()}
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 mb-2 pr-10">
        {habit.name}
      </h3>

      {/* Streak Indicator */}
      <div className="mb-3 min-h-[20px]">
        {streakBroken ? (
          <span className="text-red-500 text-sm font-medium">Streak broken</span>
        ) : currentStreak > 0 ? (
          <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
            <Flame className="w-4 h-4" />
            <span>{currentStreak} day streak{currentStreak >= 30 ? '!' : ''}</span>
          </div>
        ) : <span className="invisible">placeholder</span>}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Metrics - Three Columns */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-auto">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            {metric}
          </div>
        ))}
      </div>

      {/* Actions - Only show when showActions is true */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit habit"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {habit.status === 'active' ? (
            onPause && (
              <button
                onClick={onPause}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Pause habit"
              >
                <Pause className="w-4 h-4 text-gray-600" />
              </button>
            )
          ) : (
            onResume && (
              <button
                onClick={onResume}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Resume habit"
              >
                <Play className="w-4 h-4 text-gray-600" />
              </button>
            )
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 ml-auto"
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
