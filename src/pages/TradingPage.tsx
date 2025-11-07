import { useEffect, useState } from 'react';
import { db } from '../db';
import { Card } from '../components';
import { getToday, formatDisplayDate } from '../utils/date';
import type { Trade } from '../types';

export const TradingPage = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: getToday(),
    symbol: '',
    setup: '',
    entry: 0,
    exit: 0,
    quantity: 0,
    pnl: 0,
    emotion: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPnl: 0,
    winRate: 0,
    tradeCount: 0,
    averagePnl: 0,
    winningTrades: 0,
    losingTrades: 0,
  });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setIsLoading(true);
    const allTrades = await db.trades.orderBy('date').reverse().toArray();
    setTrades(allTrades);
    calculateStats(allTrades);
    setIsLoading(false);
  };

  const calculateStats = (tradeList: Trade[]) => {
    const totalPnl = tradeList.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = tradeList.filter((trade) => trade.pnl > 0).length;
    const losingTrades = tradeList.filter((trade) => trade.pnl < 0).length;
    const winRate = tradeList.length > 0 ? (winningTrades / tradeList.length) * 100 : 0;
    const averagePnl = tradeList.length > 0 ? totalPnl / tradeList.length : 0;

    setStats({
      totalPnl,
      winRate,
      tradeCount: tradeList.length,
      averagePnl,
      winningTrades,
      losingTrades,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tradeData: Omit<Trade, 'id'> = {
      date: formData.date || getToday(),
      symbol: formData.symbol || '',
      setup: formData.setup || '',
      entry: Number(formData.entry) || 0,
      exit: Number(formData.exit) || 0,
      quantity: Number(formData.quantity) || 0,
      pnl: Number(formData.pnl) || 0,
      emotion: formData.emotion || undefined,
      notes: formData.notes || undefined,
    };

    await db.trades.add(tradeData);

    // Reset form
    setFormData({
      date: getToday(),
      symbol: '',
      setup: '',
      entry: 0,
      exit: 0,
      quantity: 0,
      pnl: 0,
      emotion: '',
      notes: '',
    });

    loadTrades();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this trade?')) return;
    await db.trades.delete(id);
    loadTrades();
  };

  const handleCalculatePnl = () => {
    const entry = Number(formData.entry) || 0;
    const exit = Number(formData.exit) || 0;
    const quantity = Number(formData.quantity) || 0;
    const pnl = (exit - entry) * quantity;
    setFormData({ ...formData, pnl });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading trades...</p>
      </div>
    );
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
              <p className={`text-2xl font-bold mt-1 ${stats.totalPnl >= 0 ? 'text-trading' : 'text-red-600'}`}>
                ${stats.totalPnl.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-trading/10 rounded-lg">
              <svg className="w-8 h-8 text-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-trading mt-1">{stats.winRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-trading/10 rounded-lg">
              <svg className="w-8 h-8 text-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trade Count</p>
              <p className="text-2xl font-bold text-trading mt-1">{stats.tradeCount}</p>
            </div>
            <div className="p-3 bg-trading/10 rounded-lg">
              <svg className="w-8 h-8 text-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg P&L</p>
              <p className={`text-2xl font-bold mt-1 ${stats.averagePnl >= 0 ? 'text-trading' : 'text-red-600'}`}>
                ${stats.averagePnl.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-trading/10 rounded-lg">
              <svg className="w-8 h-8 text-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
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
                  value={formData.entry || ''}
                  onChange={(e) => setFormData({ ...formData, entry: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exit || ''}
                  onChange={(e) => setFormData({ ...formData, exit: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? parseInt(e.target.value, 10) : 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                P&L
                <button
                  type="button"
                  onClick={handleCalculatePnl}
                  className="ml-2 text-xs text-trading hover:underline"
                >
                  (Calculate)
                </button>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pnl || ''}
                onChange={(e) => setFormData({ ...formData, pnl: e.target.value ? parseFloat(e.target.value) : 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emotion</label>
              <input
                type="text"
                value={formData.emotion}
                onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                placeholder="e.g., Confident, Nervous"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trading focus:border-trading"
                placeholder="Trade notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-trading text-white rounded-md hover:bg-trading-dark transition-colors"
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
                        {formatDisplayDate(trade.date)}
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
                        trade.pnl >= 0 ? 'text-trading' : 'text-red-600'
                      }`}>
                        ${trade.pnl.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(trade.id!)}
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
  );
};
