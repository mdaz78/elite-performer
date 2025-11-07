import { useEffect, useState } from 'react';
import { db } from '../db';
import { Card } from '../components';
import { getWeekStart, formatDisplayDate } from '../utils/date';
import type { Review } from '../types';

export const WeeklyReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState<Partial<Review>>({
    weekStartDate: getWeekStart(),
    wins: '',
    mistakes: '',
    nextWeekGoals: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    const allReviews = await db.reviews.orderBy('weekStartDate').reverse().toArray();
    setReviews(allReviews);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if review for this week already exists
    const existing = await db.reviews
      .where('weekStartDate')
      .equals(formData.weekStartDate!)
      .first();

    const reviewData: Omit<Review, 'id'> = {
      weekStartDate: formData.weekStartDate || getWeekStart(),
      wins: formData.wins || '',
      mistakes: formData.mistakes || '',
      nextWeekGoals: formData.nextWeekGoals || '',
      metrics: await generateMetrics(),
    };

    if (existing) {
      await db.reviews.update(existing.id!, reviewData);
    } else {
      await db.reviews.add(reviewData);
    }

    // Reset form
    setFormData({
      weekStartDate: getWeekStart(),
      wins: '',
      mistakes: '',
      nextWeekGoals: '',
    });

    loadReviews();
  };

  const generateMetrics = async () => {
    const weekStart = formData.weekStartDate || getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Get tasks for the week
    const tasks = await db.tasks
      .where('scheduledDate')
      .between(weekStart, weekEndStr, true, true)
      .toArray();

    // Get fitness logs for the week
    const fitnessLogs = await db.fitnessLogs
      .where('date')
      .between(weekStart, weekEndStr, true, true)
      .toArray();

    // Get trades for the week
    const trades = await db.trades
      .where('date')
      .between(weekStart, weekEndStr, true, true)
      .toArray();

    // Get coding progress
    const courses = await db.codingCourses.toArray();
    const modules = await db.courseModules.toArray();
    const totalModules = modules.length;
    const completedModules = modules.filter((m) => m.completed).length;

    return {
      tasksCompleted: tasks.filter((t) => t.completed).length,
      tasksTotal: tasks.length,
      fitnessLogs: fitnessLogs.length,
      tradesCount: trades.length,
      tradesPnl: trades.reduce((sum, t) => sum + t.pnl, 0),
      codingProgress: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
    };
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this weekly review?')) return;
    await db.reviews.delete(id);
    loadReviews();
  };

  const getExistingReview = (weekStartDate: string): Review | undefined => {
    return reviews.find((r) => r.weekStartDate === weekStartDate);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  const existingReview = getExistingReview(formData.weekStartDate || getWeekStart());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Review</h1>
        <p className="mt-2 text-gray-600">Reflect on your progress and plan ahead</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title={existingReview ? 'Edit Weekly Review' : 'New Weekly Review'} className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week Start Date</label>
              <input
                type="date"
                value={formData.weekStartDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData({ ...formData, weekStartDate: newDate });
                  const existing = getExistingReview(newDate);
                  if (existing) {
                    setFormData({
                      weekStartDate: existing.weekStartDate,
                      wins: existing.wins,
                      mistakes: existing.mistakes,
                      nextWeekGoals: existing.nextWeekGoals,
                    });
                  } else {
                    setFormData({
                      weekStartDate: newDate,
                      wins: '',
                      mistakes: '',
                      nextWeekGoals: '',
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wins</label>
              <textarea
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What went well this week?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mistakes & Learnings</label>
              <textarea
                value={formData.mistakes}
                onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What could be improved?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Goals</label>
              <textarea
                value={formData.nextWeekGoals}
                onChange={(e) => setFormData({ ...formData, nextWeekGoals: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What are your goals for next week?"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {existingReview ? 'Update' : 'Save'} Review
            </button>
          </form>
        </Card>

        <Card title="Past Reviews" className="lg:col-span-1">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Create your first review above!</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Week of {formatDisplayDate(review.weekStartDate)}
                      </h3>
                      {review.metrics && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p>
                            Tasks: {review.metrics.tasksCompleted}/{review.metrics.tasksTotal} completed
                          </p>
                          <p>Fitness Logs: {review.metrics.fitnessLogs}</p>
                          <p>Trades: {review.metrics.tradesCount} (P&L: ${review.metrics.tradesPnl?.toFixed(2)})</p>
                          <p>Coding Progress: {review.metrics.codingProgress?.toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(review.id!)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Wins:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{review.wins}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Mistakes & Learnings:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{review.mistakes}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Next Week Goals:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{review.nextWeekGoals}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
