'use client'

import { Flame } from 'lucide-react'

interface MotivationalGreetingProps {
  overallStreak: number
  todayCompleted: number
  todayTotal: number
  weekProgress: number
  monthProgress: number
}

export function MotivationalGreeting({
  overallStreak,
  todayCompleted,
  todayTotal,
  weekProgress,
  monthProgress
}: MotivationalGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    if (todayCompleted === todayTotal && todayTotal > 0) {
      return "You're on fire! Keep up the amazing work."
    }
    if (overallStreak >= 7) {
      return "You're on fire! Keep up the amazing work."
    }
    if (overallStreak >= 3) {
      return "You're on fire! Keep up the amazing work."
    }
    if (todayCompleted > 0) {
      return "You're on fire! Keep up the amazing work."
    }
    return "Let's make today count! Start your habits now."
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-3xl p-6 md:p-8 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Greeting Section */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}! 👋
          </h2>
          <p className="text-base md:text-lg text-white/90">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4 md:flex-nowrap">
          {/* Day Streak Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white/30">
            <div className="text-3xl font-bold text-white mb-1">
              {overallStreak}
            </div>
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <Flame className="w-4 h-4" />
              <span>Day Streak</span>
            </div>
          </div>

          {/* Completed Today Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white/30">
            <div className="text-3xl font-bold text-white mb-1">
              {todayCompleted}/{todayTotal}
            </div>
            <div className="text-white/90 text-sm">
              Completed Today
            </div>
          </div>

          {/* This Week Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white/30">
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(weekProgress)}%
            </div>
            <div className="text-white/90 text-sm">
              This Week
            </div>
          </div>

          {/* This Month Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white/30">
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(monthProgress)}%
            </div>
            <div className="text-white/90 text-sm">
              This Month
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
