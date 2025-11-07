import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../db';
import { Card } from '../components';
import { getToday, formatDisplayDate } from '../utils/date';
import type { FitnessLog } from '../types';

export const FitnessPage = () => {
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [formData, setFormData] = useState<Partial<FitnessLog>>({
    date: getToday(),
    weight: undefined,
    bodyFat: undefined,
    waist: undefined,
    calories: undefined,
    workoutType: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    const allLogs = await db.fitnessLogs.orderBy('date').reverse().toArray();
    setLogs(allLogs);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const logData: Omit<FitnessLog, 'id'> = {
      date: formData.date || getToday(),
      weight: formData.weight ? Number(formData.weight) : undefined,
      bodyFat: formData.bodyFat ? Number(formData.bodyFat) : undefined,
      waist: formData.waist ? Number(formData.waist) : undefined,
      calories: formData.calories ? Number(formData.calories) : undefined,
      workoutType: formData.workoutType || undefined,
      notes: formData.notes || undefined,
    };

    // Check if log for this date already exists
    const existing = await db.fitnessLogs.where('date').equals(logData.date).first();

    if (existing) {
      await db.fitnessLogs.update(existing.id!, logData);
    } else {
      await db.fitnessLogs.add(logData);
    }

    // Reset form
    setFormData({
      date: getToday(),
      weight: undefined,
      bodyFat: undefined,
      waist: undefined,
      calories: undefined,
      workoutType: '',
      notes: '',
    });

    loadLogs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fitness log entry?')) return;
    await db.fitnessLogs.delete(id);
    loadLogs();
  };

  // Prepare chart data
  const chartData = logs
    .filter((log) => log.weight || log.bodyFat)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: formatDisplayDate(log.date),
      weight: log.weight || null,
      bodyFat: log.bodyFat || null,
    }));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading fitness logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Tracker</h1>
        <p className="mt-2 text-gray-600">Log your workouts and track your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Log Entry" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 180.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFat || ''}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 15.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waist (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.waist || ''}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 32.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input
                type="number"
                value={formData.calories || ''}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
              <input
                type="text"
                value={formData.workoutType}
                onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Upper Body, Cardio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Save Entry
            </button>
          </form>
        </Card>

        <Card title="Progress Chart" className="lg:col-span-2">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
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
                  name="Weight (lbs)"
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
          <p className="text-gray-500 text-center py-8">No fitness logs yet. Add your first entry above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Fat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDisplayDate(log.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.weight ? `${log.weight} lbs` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.bodyFat ? `${log.bodyFat}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.waist ? `${log.waist}"` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.calories || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.workoutType || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(log.id!)}
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
  );
};
