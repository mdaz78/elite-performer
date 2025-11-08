'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { trpc } from '@/src/lib/trpc-client'
import { Card } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { getToday, formatDisplayDate } from '@/src/utils/date'
import { createVariants, staggerContainer } from '@/src/lib/animations'

function FitnessPageContent() {
  const utils = trpc.useUtils()
  const [formData, setFormData] = useState({
    date: getToday(),
    weight: '',
    bodyFat: '',
    waist: '',
    notes: '',
  })

  const { data: logs = [], isLoading } = trpc.fitness.getAll.useQuery()
  const createMutation = trpc.fitness.create.useMutation({
    onSuccess: () => {
      utils.fitness.getAll.invalidate()
      setFormData({
        date: getToday(),
        weight: '',
        bodyFat: '',
        waist: '',
        notes: '',
      })
    },
  })
  const deleteMutation = trpc.fitness.delete.useMutation({
    onSuccess: () => {
      utils.fitness.getAll.invalidate()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createMutation.mutateAsync({
      date: new Date(formData.date).toISOString(),
      weight: formData.weight ? Number(formData.weight) : undefined,
      bodyFat: formData.bodyFat ? Number(formData.bodyFat) : undefined,
      waist: formData.waist ? Number(formData.waist) : undefined,
      notes: formData.notes || undefined,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fitness log entry?')) return
    await deleteMutation.mutateAsync({ id })
  }

  // Prepare chart data
  const chartData = [...logs]
    .filter((log) => log.weight != null || log.bodyFat != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => ({
      date: formatDisplayDate(log.date.toISOString()),
      weight: log.weight ?? null,
      bodyFat: log.bodyFat ?? null,
    }))

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">Loading fitness logs...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Fitness Tracker</h1>
        <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Log your workouts and track your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Log Entry" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-amber dark:focus:ring-accent-amber-dark focus:border-accent-amber dark:focus:border-accent-amber-dark transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-amber dark:focus:ring-accent-amber-dark focus:border-accent-amber dark:focus:border-accent-amber-dark transition-colors duration-200"
                placeholder="e.g., 82.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-amber dark:focus:ring-accent-amber-dark focus:border-accent-amber dark:focus:border-accent-amber-dark transition-colors duration-200"
                placeholder="e.g., 15.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Waist (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-amber dark:focus:ring-accent-amber-dark focus:border-accent-amber dark:focus:border-accent-amber-dark transition-colors duration-200"
                placeholder="e.g., 32.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-amber dark:focus:ring-accent-amber-dark focus:border-accent-amber dark:focus:border-accent-amber-dark transition-colors duration-200"
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-accent-amber dark:bg-accent-amber-dark text-white rounded-md hover:bg-accent-amber/90 dark:hover:bg-accent-amber-dark/90 transition-colors duration-200"
            >
              Save Entry
            </button>
          </form>
        </Card>

        <Card title="Progress Chart" className="lg:col-span-2">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">
              No data to display. Log some entries to see your progress!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Weight (KG)"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Body Fat (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Recent Entries">
        {logs.length === 0 ? (
          <p className="text-text-tertiary dark:text-text-tertiary-dark text-center py-8 transition-colors duration-200">No fitness logs yet. Add your first entry above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark">
              <thead className="bg-background dark:bg-background-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Body Fat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Waist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider transition-colors duration-200">Actions</th>
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="bg-surface dark:bg-surface-dark divide-y divide-border dark:divide-border-dark"
                >
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      variants={createVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                        {formatDisplayDate(log.date.toISOString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                        {log.weight ? `${log.weight} KG` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                        {log.bodyFat ? `${log.bodyFat}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                        {log.waist ? `${log.waist}"` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                        {log.notes ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function FitnessPage() {
  return (
    <ProtectedRoute>
      <FitnessPageContent />
    </ProtectedRoute>
  )
}
