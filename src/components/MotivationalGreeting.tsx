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

  return (
    <div className="bg-gradient-to-br from-accent-blue/10 dark:from-accent-blue-dark/20 via-accent-emerald/10 dark:via-accent-emerald-dark/20 to-accent-amber/10 dark:to-accent-amber-dark/20 rounded-2xl p-8 border border-border dark:border-border-dark">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-2 transition-colors duration-200">
            {getGreeting()}!
          </h2>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
            {getMotivationalMessage()}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {overallStreak > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-accent-amber dark:text-accent-amber-dark">
                <Flame className="w-6 h-6" />
                <span className="text-3xl font-bold">{overallStreak}</span>
              </div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 transition-colors duration-200">
                Day Streak
              </span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-accent-emerald dark:text-accent-emerald-dark">
              {todayCompleted}/{todayTotal}
            </div>
            <span className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 transition-colors duration-200">
              Today
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
