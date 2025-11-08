'use client'

import { ProtectedRoute } from '@/src/components/ProtectedRoute'

function HabitTrackerPageContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Habit Tracker</h1>
        <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Track your daily habits and build consistency</p>
      </div>
    </div>
  )
}

export default function HabitTrackerPage() {
  return (
    <ProtectedRoute>
      <HabitTrackerPageContent />
    </ProtectedRoute>
  )
}
