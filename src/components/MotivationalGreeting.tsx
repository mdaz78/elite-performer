'use client'

import { Flame } from 'lucide-react'

interface MotivationalGreetingProps {
  overallStreak: number
  todayCompleted: number
  todayTotal: number
}

export function MotivationalGreeting({ overallStreak, todayCompleted, todayTotal }: MotivationalGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    if (todayCompleted === todayTotal && todayTotal > 0) {
      return "You're on fire! All habits completed today!"
    }
    if (overallStreak >= 7) {
      return `Amazing ${overallStreak}-day streak! Keep it going!`
    }
    if (overallStreak >= 3) {
      return `Great ${overallStreak}-day streak! You're building momentum!`
    }
    if (todayCompleted > 0) {
      return `You've completed ${todayCompleted} ${todayCompleted === 1 ? 'habit' : 'habits'} today. Keep going!`
    }
    return "Let's make today count! Start your habits now."
  }

  const completionPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-accent-emerald/5 dark:from-accent-emerald-dark/10 via-accent-blue/5 dark:via-accent-blue-dark/10 to-accent-amber/5 dark:to-accent-amber-dark/10 rounded-3xl p-6 md:p-8 border border-accent-emerald/20 dark:border-accent-emerald-dark/20 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-6">
        {/* Greeting Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2 transition-colors duration-200">
            {getGreeting()}!
          </h2>
          <p className="text-base md:text-lg text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Today's Progress Card */}
          <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 dark:border-border-dark/50 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                Today
              </span>
              <span className="text-2xl font-bold text-accent-emerald dark:text-accent-emerald-dark">
                {completionPercentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                {todayCompleted}
              </span>
              <span className="text-lg text-text-tertiary dark:text-text-tertiary-dark">
                / {todayTotal}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-background dark:bg-background-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-emerald dark:from-accent-emerald-dark to-accent-blue dark:to-accent-blue-dark transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Streak Card */}
          {overallStreak > 0 && (
            <div className="bg-gradient-to-br from-accent-amber/10 dark:from-accent-amber-dark/20 to-accent-amber/5 dark:to-accent-amber-dark/10 rounded-2xl p-5 border border-accent-amber/30 dark:border-accent-amber-dark/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-accent-amber dark:text-accent-amber-dark" />
                <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Streak
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-accent-amber dark:text-accent-amber-dark">
                  {overallStreak}
                </span>
                <span className="text-sm text-text-tertiary dark:text-text-tertiary-dark">
                  {overallStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Empty state for streak */}
          {overallStreak === 0 && todayTotal > 0 && (
            <div className="bg-white/30 dark:bg-surface-dark/30 backdrop-blur-sm rounded-2xl p-5 border border-dashed border-border dark:border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-text-tertiary dark:text-text-tertiary-dark opacity-50" />
                <span className="text-sm font-medium text-text-tertiary dark:text-text-tertiary-dark">
                  Streak
                </span>
              </div>
              <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark">
                Complete habits to start your streak!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
