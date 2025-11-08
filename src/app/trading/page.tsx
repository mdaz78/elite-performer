'use client'

import { useState } from 'react'
import { trpc } from '@/src/lib/trpc-client'
import { Card } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { getToday, formatDisplayDate } from '@/src/utils/date'

function TradingPageContent() {
  const utils = trpc.useUtils()
  const [formData, setFormData] = useState({
    date: getToday(),
    symbol: '',
    setup: '',
    entry: '',
    exit: '',
    quantity: '',
    pnl: '',
    emotion: '',
    notes: '',
  })

  const { data: trades = [], isLoading } = trpc.trades.getAll.useQuery({})
  const { data: stats } = trpc.trades.getStats.useQuery({})

  const createMutation = trpc.trades.create.useMutation({
    onSuccess: () => {
      utils.trades.getAll.invalidate()
      utils.trades.getStats.invalidate()
      setFormData({
        date: getToday(),
        symbol: '',
        setup: '',
        entry: '',
        exit: '',
        quantity: '',
        pnl: '',
        emotion: '',
        notes: '',
      })
    },
  })

  const deleteMutation = trpc.trades.delete.useMutation({
    onSuccess: () => {
      utils.trades.getAll.invalidate()
      utils.trades.getStats.invalidate()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createMutation.mutateAsync({
      date: new Date(formData.date).toISOString(),
      symbol: formData.symbol,
      setup: formData.setup,
      entry: Number(formData.entry),
      exit: Number(formData.exit),
      quantity: Number(formData.quantity),
      pnl: Number(formData.pnl),
      emotion: formData.emotion || undefined,
      notes: formData.notes || undefined,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this trade?')) return
    await deleteMutation.mutateAsync({ id })
  }

  const handleCalculatePnl = () => {
    const entry = Number(formData.entry) || 0
    const exit = Number(formData.exit) || 0
    const quantity = Number(formData.quantity) || 0
    const pnl = (exit - entry) * quantity
    setFormData({ ...formData, pnl: pnl.toString() })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading trades...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trading Journal</h1>
        <p className="mt-2 text-gray-600">Track your trades and analyze performance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold mt-1 ${(stats?.totalPnL ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                ${(stats?.totalPnL ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">{(stats?.winRate ?? 0).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trade Count</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">{stats?.totalTrades ?? 0}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg P&L</p>
              <p className={`text-2xl font-bold mt-1 ${(stats?.avgPnL ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                ${(stats?.avgPnL ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Log Trade" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., AAPL"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setup</label>
              <input
                type="text"
                value={formData.setup}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Breakout, Pullback"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entry}
                  onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exit}
                  onChange={(e) => setFormData({ ...formData, exit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                P&L
                <button
                  type="button"
                  onClick={handleCalculatePnl}
                  className="ml-2 text-xs text-emerald-500 hover:underline"
                >
                  (Calculate)
                </button>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pnl}
                onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emotion</label>
              <input
                type="text"
                value={formData.emotion}
                onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Confident, Nervous"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Trade notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              Save Trade
            </button>
          </form>
        </Card>

        <Card title="Trade List" className="lg:col-span-2">
          {trades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trades yet. Log your first trade above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDisplayDate(trade.date.toISOString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.setup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${trade.entry.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${trade.exit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.quantity}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-600'
                      }`}>
                        ${trade.pnl.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function TradingPage() {
  return (
    <ProtectedRoute>
      <TradingPageContent />
    </ProtectedRoute>
  )
}
