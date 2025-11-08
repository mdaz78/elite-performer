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
      return <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm transition-all duration-300 ${
        isComplete
          ? 'bg-gradient-to-br from-accent-emerald/20 dark:from-accent-emerald-dark/30 to-accent-emerald/10 dark:to-accent-emerald-dark/20 text-accent-emerald dark:text-accent-emerald-dark ring-2 ring-accent-emerald/30 dark:ring-accent-emerald-dark/30'
          : 'bg-gradient-to-br from-accent-blue/10 dark:from-accent-blue-dark/20 to-accent-blue/5 dark:to-accent-blue-dark/10 text-accent-blue dark:text-accent-blue-dark'
      }`}>
        {habit.name.charAt(0).toUpperCase()}
      </div>
    }

    const IconComponent = (LucideIcons as any)[habit.icon] as React.ComponentType<{ className?: string }>
    if (!IconComponent) {
      return <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm transition-all duration-300 ${
        isComplete
          ? 'bg-gradient-to-br from-accent-emerald/20 dark:from-accent-emerald-dark/30 to-accent-emerald/10 dark:to-accent-emerald-dark/20 text-accent-emerald dark:text-accent-emerald-dark ring-2 ring-accent-emerald/30 dark:ring-accent-emerald-dark/30'
          : 'bg-gradient-to-br from-accent-blue/10 dark:from-accent-blue-dark/20 to-accent-blue/5 dark:to-accent-blue-dark/10 text-accent-blue dark:text-accent-blue-dark'
      }`}>
        {habit.name.charAt(0).toUpperCase()}
      </div>
    }

    return (
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${
        isComplete
          ? 'bg-gradient-to-br from-accent-emerald/20 dark:from-accent-emerald-dark/30 to-accent-emerald/10 dark:to-accent-emerald-dark/20 ring-2 ring-accent-emerald/30 dark:ring-accent-emerald-dark/30'
          : 'bg-gradient-to-br from-accent-blue/10 dark:from-accent-blue-dark/20 to-accent-blue/5 dark:to-accent-blue-dark/10'
      }`}>
        <IconComponent className={`w-7 h-7 ${
          isComplete
            ? 'text-accent-emerald dark:text-accent-emerald-dark'
            : 'text-accent-blue dark:text-accent-blue-dark'
        }`} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
        isComplete
          ? 'bg-gradient-to-br from-accent-emerald/5 dark:from-accent-emerald-dark/15 to-accent-emerald/10 dark:to-accent-emerald-dark/10 border-accent-emerald/40 dark:border-accent-emerald-dark/40'
          : 'bg-white dark:bg-surface-dark border-border/60 dark:border-border-dark/60 hover:border-accent-blue/40 dark:hover:border-accent-blue-dark/40'
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
                    <Flame className="w-4 h-4 text-accent-amber dark:text-accent-amber-dark" />
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
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-secondary dark:text-text-secondary-dark font-medium transition-colors duration-200">
                      {completedSubHabits} / {totalSubHabits} completed
                    </span>
                    <span className={`font-bold ${
                      isComplete
                        ? 'text-accent-emerald dark:text-accent-emerald-dark'
                        : 'text-accent-blue dark:text-accent-blue-dark'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-background dark:bg-background-dark rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={`h-full rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-accent-emerald dark:from-accent-emerald-dark to-accent-emerald/80 dark:to-accent-emerald-dark/80'
                          : 'bg-gradient-to-r from-accent-blue dark:from-accent-blue-dark to-accent-blue/80 dark:to-accent-blue-dark/80'
                      } transition-colors duration-200 shadow-sm`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>
              )}

              {/* Weekly Progress */}
              {weeklyProgress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-secondary dark:text-text-secondary-dark font-medium transition-colors duration-200">
                      This week
                    </span>
                    <span className="text-accent-blue/80 dark:text-accent-blue-dark/80 font-bold">
                      {Math.round(weeklyProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background dark:bg-background-dark rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-blue/60 dark:from-accent-blue-dark/60 to-accent-blue/40 dark:to-accent-blue-dark/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${weeklyProgress}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
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
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 dark:border-border-dark/50">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2.5 hover:bg-accent-blue/10 dark:hover:bg-accent-blue-dark/10 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Edit habit"
                >
                  <Edit className="w-4 h-4 text-accent-blue dark:text-accent-blue-dark" />
                </button>
              )}
              {habit.status === 'active' ? (
                onPause && (
                  <button
                    onClick={onPause}
                    className="p-2.5 hover:bg-accent-amber/10 dark:hover:bg-accent-amber-dark/10 rounded-xl transition-all duration-200 hover:scale-105"
                    title="Pause habit"
                  >
                    <Pause className="w-4 h-4 text-accent-amber dark:text-accent-amber-dark" />
                  </button>
                )
              ) : (
                onResume && (
                  <button
                    onClick={onResume}
                    className="p-2.5 hover:bg-accent-emerald/10 dark:hover:bg-accent-emerald-dark/10 rounded-xl transition-all duration-200 hover:scale-105"
                    title="Resume habit"
                  >
                    <Play className="w-4 h-4 text-accent-emerald dark:text-accent-emerald-dark" />
                  </button>
                )
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-105 text-red-600 dark:text-red-400 ml-auto"
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
