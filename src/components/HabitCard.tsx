'use client'

import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { Flame, Edit, Trash2, Pause, Play } from 'lucide-react'
import { HabitProgressRing } from './HabitProgressRing'

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

  const renderIcon = () => {
    if (!habit.icon) {
      return <div className="w-12 h-12 rounded-full bg-accent-blue/10 dark:bg-accent-blue-dark/20 flex items-center justify-center text-accent-blue dark:text-accent-blue-dark text-xl font-bold">
        {habit.name.charAt(0).toUpperCase()}
      </div>
    }

    const IconComponent = (LucideIcons as any)[habit.icon] as React.ComponentType<{ className?: string }>
    if (!IconComponent) {
      return <div className="w-12 h-12 rounded-full bg-accent-blue/10 dark:bg-accent-blue-dark/20 flex items-center justify-center text-accent-blue dark:text-accent-blue-dark text-xl font-bold">
        {habit.name.charAt(0).toUpperCase()}
      </div>
    }

    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        isComplete
          ? 'bg-accent-emerald/20 dark:bg-accent-emerald-dark/20 text-accent-emerald dark:text-accent-emerald-dark'
          : 'bg-accent-blue/10 dark:bg-accent-blue-dark/20 text-accent-blue dark:text-accent-blue-dark'
      } transition-colors duration-200`}>
        <IconComponent className="w-6 h-6" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-6 rounded-xl border-2 transition-all ${
        isComplete
          ? 'bg-gradient-to-br from-accent-emerald/10 dark:from-accent-emerald-dark/20 to-accent-emerald/5 dark:to-accent-emerald-dark/10 border-accent-emerald/30 dark:border-accent-emerald-dark/30'
          : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark hover:border-accent-blue/50 dark:hover:border-accent-blue-dark/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-lg ${
                  isComplete
                    ? 'line-through text-text-secondary dark:text-text-secondary-dark'
                    : 'text-text-primary dark:text-text-primary-dark'
                } transition-colors duration-200`}>
                  {habit.name}
                </h3>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-accent-amber dark:text-accent-amber-dark">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentStreak}</span>
                  </div>
                )}
                {habit.status === 'paused' && (
                  <span className="text-xs px-2 py-1 bg-accent-amber/20 dark:bg-accent-amber-dark/20 text-accent-amber dark:text-accent-amber-dark rounded-full">
                    Paused
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              {(bestStreak > 0 || completionRate > 0) && (
                <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-text-secondary-dark mt-2">
                  {bestStreak > 0 && (
                    <span>Best: {bestStreak} days</span>
                  )}
                  {completionRate > 0 && (
                    <span>{Math.round(completionRate)}% completion</span>
                  )}
                </div>
              )}

              {/* Sub-habits progress */}
              {totalSubHabits > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                      {completedSubHabits} / {totalSubHabits} completed
                    </span>
                    <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background dark:bg-background-dark rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        isComplete
                          ? 'bg-accent-emerald dark:bg-accent-emerald-dark'
                          : 'bg-accent-blue dark:bg-accent-blue-dark'
                      } transition-colors duration-200`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Weekly Progress */}
              {weeklyProgress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                      This week
                    </span>
                    <span className="text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                      {Math.round(weeklyProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background dark:bg-background-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-blue/50 dark:bg-accent-blue-dark/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${weeklyProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Progress Ring */}
            <div className="flex-shrink-0 ml-4">
              <HabitProgressRing
                progress={progress}
                completed={isComplete}
                onClick={onToggleComplete}
              />
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border dark:border-border-dark">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                  title="Edit habit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {habit.status === 'active' ? (
                onPause && (
                  <button
                    onClick={onPause}
                    className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    title="Pause habit"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )
              ) : (
                onResume && (
                  <button
                    onClick={onResume}
                    className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    title="Resume habit"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
