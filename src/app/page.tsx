'use client';

import { Card } from '@/src/components';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { trpc } from '@/src/lib/trpc-client';
import {
  formatDisplayDate,
  getDaysRemaining,
  getProgressPercentage,
  getToday,
  getWeekEnd,
  getWeekStart,
} from '@/src/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Check, ChevronDown, ChevronUp, Code, DollarSign, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function DashboardContent() {
  const today = getToday();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const [expandedHabits, setExpandedHabits] = useState<Set<number>>(new Set());
  const utils = trpc.useUtils();

  // Hardcoded transformation dates
  const TRANSFORMATION_START_DATE = '2024-11-10'; // Update this to your desired start date
  const TRANSFORMATION_END_DATE = '2026-05-09'; // Update this to your desired end date (180 days later)

  // Load all data
  const { data: courses = [] } = trpc.codingCourses.getAll.useQuery();
  const { data: fitnessLogs = [] } = trpc.fitness.getByDateRange.useQuery({
    startDate: new Date(weekStart).toISOString(),
    endDate: new Date(weekEnd).toISOString(),
  });
  const { data: todayTasks = [] } = trpc.tasks.getByDate.useQuery({
    startDate: new Date(today).toISOString(),
    endDate: new Date(today).toISOString(),
  });
  const { data: todayHabits = [] } = trpc.habits.getToday.useQuery();
  const { data: todayModules = [] } = trpc.tasks.getScheduledModules.useQuery({
    startDate: new Date(today).toISOString(),
    endDate: new Date(today).toISOString(),
  });
  const { data: tradingStats } = trpc.trades.getStats.useQuery({});

  // Mutations to toggle module completion
  const updateCodingModuleMutation = trpc.courseModules.update.useMutation({
    onSuccess: () => {
      utils.tasks.getScheduledModules.invalidate();
      utils.codingCourses.getAll.invalidate();
    },
  });

  const updateTradingModuleMutation = trpc.tradingCourseModules.update.useMutation({
    onSuccess: () => {
      utils.tasks.getScheduledModules.invalidate();
    },
  });

  // Mutation to toggle task completion
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getByDate.invalidate();
    },
  });

  // Mutation to toggle sub-habit completion
  const markSubHabitCompleteMutation = trpc.habits.markSubHabitComplete.useMutation({
    onSuccess: () => {
      utils.habits.getToday.invalidate();
    },
  });

  const toggleSubHabit = async (subHabitId: number, completed: boolean) => {
    await markSubHabitCompleteMutation.mutateAsync({
      subHabitId,
      date: new Date().toISOString(),
      completed: !completed,
    });
  };

  const toggleExpandHabit = (habitId: number) => {
    setExpandedHabits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const toggleModuleCompletion = async (
    moduleId: number,
    completed: boolean,
    type: 'coding' | 'trading'
  ) => {
    if (type === 'coding') {
      await updateCodingModuleMutation.mutateAsync({
        id: moduleId,
        completed: !completed,
        completedAt: !completed ? new Date().toISOString() : null,
      });
    } else {
      await updateTradingModuleMutation.mutateAsync({
        id: moduleId,
        completed: !completed,
        completedAt: !completed ? new Date().toISOString() : null,
      });
    }
  };

  const toggleTaskCompletion = async (taskId: number, completed: boolean) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      completed: !completed,
      completedAt: !completed ? new Date().toISOString() : null,
    });
  };

  // Calculate transformation progress
  const startDate = TRANSFORMATION_START_DATE;
  const endDate = TRANSFORMATION_END_DATE;
  const transformationProgress = getProgressPercentage(startDate, endDate);
  const daysRemaining = getDaysRemaining(endDate, today < startDate ? startDate : today);

  // Calculate coding progress
  let totalModules = 0;
  let completedModules = 0;
  courses.forEach((course) => {
    totalModules += course.modules?.length || 0;
    completedModules += course.modules?.filter((m) => m.completed).length || 0;
  });
  const codingProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  // Get latest weight
  const sortedLogs = [...fitnessLogs]
    .filter((log) => log.weight != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestWeight = sortedLogs[0]?.weight;

  // Calculate task completion count
  const allTodayItems = [...todayModules, ...todayTasks];
  const completedTasksCount = allTodayItems.filter((item) => item.completed).length;
  const totalTasksCount = allTodayItems.length;

  // Calculate habit completion count
  const completedHabitsCount = todayHabits.filter((habit) => habit.completion?.completed).length;
  const totalHabitsCount = todayHabits.length;

  // Trading stats
  const tradingTotalPnL = tradingStats?.totalPnL ?? 0;
  const tradingTradesCount = tradingStats?.totalTrades ?? 0;
  const tradingWinRate = tradingStats?.winRate ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-12 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-h1 font-bold text-neutral-800 dark:text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-body-sm text-neutral-600 dark:text-neutral-500">
          180-Day Transformation Overview
        </p>
      </div>

      {/* Transformation Progress Card */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-h3 font-bold text-neutral-800 dark:text-neutral-900">
            Transformation Progress
          </h2>
          <p className="text-body-sm text-neutral-600 dark:text-neutral-500 mt-1">
            {daysRemaining} days remaining • Started {formatDisplayDate(startDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-200 rounded h-2">
              <div
                className="h-2 rounded bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-[300ms]"
                style={{ width: `${Math.min(100, Math.max(0, transformationProgress))}%` }}
              />
            </div>
          </div>
          <span className="text-body-sm text-neutral-600 dark:text-neutral-500 font-medium">
            {transformationProgress.toFixed(1)}%
          </span>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Coding Progress Card */}
        <Card>
          <div className="relative">
            <p className="text-overline text-neutral-600 dark:text-neutral-500 mb-2">
              CODING PROGRESS
            </p>
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary-500 dark:bg-primary-500 rounded flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <p className="text-h2 font-bold text-neutral-800 dark:text-neutral-900 mt-6">
              {Math.round(codingProgress)}%
            </p>
            <p className="text-body-sm text-neutral-600 dark:text-neutral-500 mt-2">
              0 trades • 0.0% win rate
            </p>
            <div className="mt-4">
              <Link
                href="/coding"
                className="text-body-sm text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
              >
                View courses →
              </Link>
            </div>
          </div>
        </Card>

        {/* Fitness Card */}
        <Card>
          <div className="relative">
            <p className="text-overline text-neutral-600 dark:text-neutral-500 mb-2">FITNESS</p>
            <div className="absolute top-0 right-0 w-10 h-10 bg-accent-500 dark:bg-accent-500 rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-h2 font-bold text-neutral-800 dark:text-neutral-900 mt-6">
              {latestWeight ? `${latestWeight} KG` : 'No data'}
            </p>
            <p className="text-body-sm text-neutral-600 dark:text-neutral-500 mt-2">
              {latestWeight ? 'Keep up the great work!' : 'Start logging your workouts'}
            </p>
            <div className="mt-4">
              <Link
                href="/fitness"
                className="text-body-sm text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
              >
                View logs →
              </Link>
            </div>
          </div>
        </Card>

        {/* Trading Card */}
        <Card>
          <div className="relative">
            <p className="text-overline text-neutral-600 dark:text-neutral-500 mb-2">TRADING</p>
            <div className="absolute top-0 right-0 w-10 h-10 bg-success-500 dark:bg-success-500 rounded flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-h2 font-bold text-neutral-800 dark:text-neutral-900 mt-6">
              ${tradingTotalPnL.toFixed(2)}
            </p>
            <p className="text-body-sm text-neutral-600 dark:text-neutral-500 mt-2">
              {tradingTradesCount} trades • {tradingWinRate.toFixed(1)}% win rate
            </p>
            <div className="mt-4">
              <Link
                href="/trading"
                className="text-body-sm text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
              >
                View journal →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-h3 font-bold text-neutral-800 dark:text-neutral-900">
                Today's Tasks
              </h3>
              <span className="text-body-sm text-neutral-600 dark:text-neutral-500">
                {completedTasksCount} of {totalTasksCount} done
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-body-sm text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
            >
              View all →
            </Link>
          </div>
          {todayTasks.length === 0 && todayModules.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-500 text-body-sm">
              No tasks or modules scheduled for today
            </p>
          ) : (
            <ul className="space-y-3">
              {/* Course Modules */}
              {todayModules.map((module) => {
                const isUpdating =
                  updateCodingModuleMutation.isPending || updateTradingModuleMutation.isPending;
                return (
                  <li
                    key={`${module.courseType}-${module.id}`}
                    className="flex items-start justify-between py-2"
                  >
                    <button
                      onClick={() =>
                        toggleModuleCompletion(module.id, module.completed, module.courseType)
                      }
                      disabled={isUpdating}
                      className={`mt-0.5 mr-3 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-[150ms] ${
                        module.completed
                          ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                          : 'border-neutral-300 dark:border-neutral-200 hover:border-primary-400 dark:hover:border-primary-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {module.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-body ${module.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-900'}`}
                      >
                        {module.name}
                      </div>
                      <div className="text-caption text-neutral-500 dark:text-neutral-500 mt-1">
                        {module.courseName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span
                        className={`text-caption px-2 py-1 rounded text-white font-medium ${
                          module.courseType === 'coding'
                            ? 'bg-info-500 dark:bg-info-500'
                            : 'bg-success-500 dark:bg-success-500'
                        }`}
                      >
                        {module.courseType === 'coding' ? 'CODING' : 'TRADING'}
                      </span>
                      <Link
                        href={`/${module.courseType}/${module.courseId}`}
                        className="text-caption text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
                      >
                        View →
                      </Link>
                    </div>
                  </li>
                );
              })}

              {/* Regular Tasks */}
              {todayTasks.map((task) => {
                const isUpdating = updateTaskMutation.isPending;
                const taskTypeDisplay =
                  task.type === 'DeepWork'
                    ? 'DEEP WORK'
                    : task.type === 'TradingPractice'
                      ? 'TRADING'
                      : task.type.toUpperCase();
                const taskTypeColor =
                  task.type === 'DeepWork'
                    ? 'bg-accent-500 dark:bg-accent-500'
                    : task.type === 'TradingPractice'
                      ? 'bg-success-500 dark:bg-success-500'
                      : 'bg-info-500 dark:bg-info-500';
                return (
                  <li key={`task-${task.id}`} className="flex items-start justify-between py-2">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      disabled={isUpdating}
                      className={`mt-0.5 mr-3 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-[150ms] ${
                        task.completed
                          ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                          : 'border-neutral-300 dark:border-neutral-200 hover:border-primary-400 dark:hover:border-primary-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-body ${task.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-900'}`}
                      >
                        {task.title}
                      </div>
                      {task.taskProject && (
                        <div className="text-caption text-neutral-500 dark:text-neutral-500 mt-1">
                          {task.taskProject.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span
                        className={`text-caption px-2 py-1 rounded text-white font-medium ${taskTypeColor}`}
                      >
                        {taskTypeDisplay}
                      </span>
                      <Link
                        href="/tasks"
                        className="text-caption text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
                      >
                        View →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Today's Habits Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 font-bold text-neutral-800 dark:text-neutral-900">
              Today's Habits
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-body-sm bg-neutral-200 dark:bg-neutral-200 text-neutral-800 dark:text-neutral-800 px-3 py-1 rounded-full">
                {completedHabitsCount} of {totalHabitsCount} done
              </span>
              <Link
                href="/habit-tracker"
                className="text-body-sm text-primary-500 dark:text-primary-500 hover:underline transition-colors duration-[150ms] inline-flex items-center gap-1"
              >
                View all →
              </Link>
            </div>
          </div>
          {todayHabits.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-500 text-body-sm">
              No habits scheduled for today
            </p>
          ) : (
            <ul className="space-y-3">
              {todayHabits.map((habit) => {
                const isComplete = habit.completion?.completed || false;
                const isExpanded = expandedHabits.has(habit.id);
                const totalSubHabits = habit.subHabits?.length || 0;
                const completedSubHabits =
                  habit.subHabitCompletions?.filter((sc) => sc.completed).length || 0;
                // Check if streak is broken (simplified - you may need to add actual streak logic)
                const streakBroken = !isComplete && habit.completion?.completed === false;

                // Render habit icon in blue square
                const renderHabitIcon = () => {
                  const IconComponent = habit.icon
                    ? (
                        LucideIcons as unknown as Record<
                          string,
                          React.ComponentType<{ className?: string }>
                        >
                      )[habit.icon]
                    : Heart;

                  return (
                    <div className="w-8 h-8 bg-info-500 dark:bg-info-500 rounded flex items-center justify-center flex-shrink-0">
                      {IconComponent ? (
                        <IconComponent className="w-5 h-5 text-white" />
                      ) : (
                        <Heart className="w-5 h-5 text-white" />
                      )}
                    </div>
                  );
                };

                return (
                  <li key={habit.id} className="py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 min-w-0">
                        {/* Habit Icon */}
                        <div className="mr-3 mt-0.5 flex-shrink-0">{renderHabitIcon()}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-body text-neutral-800 dark:text-neutral-900">
                            {habit.name}
                          </div>
                          {streakBroken && (
                            <div className="text-body-sm text-error-500 dark:text-error-500 mt-1">
                              Streak broken
                            </div>
                          )}
                        </div>
                      </div>
                      {totalSubHabits > 0 && (
                        <button
                          onClick={() => toggleExpandHabit(habit.id)}
                          className="ml-2 p-1 hover:bg-neutral-50 dark:hover:bg-neutral-100 rounded transition-colors duration-[150ms] flex-shrink-0"
                          aria-label={isExpanded ? 'Collapse habit' : 'Expand habit'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-500" />
                          )}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isExpanded && totalSubHabits > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-2">
                            {/* Progress indicator */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.1 }}
                              className="text-center text-body-sm text-neutral-500 dark:text-neutral-500 mb-3"
                            >
                              {completedSubHabits}/{totalSubHabits} completed (
                              {Math.round((completedSubHabits / totalSubHabits) * 100)}%)
                            </motion.div>
                            {habit.subHabits
                              ?.sort((a, b) => a.order - b.order)
                              .map((subHabit, index) => {
                                const subCompletion = habit.subHabitCompletions?.find(
                                  (sc) => sc.subHabitId === subHabit.id
                                );
                                const isSubComplete = subCompletion?.completed || false;

                                return (
                                  <motion.div
                                    key={subHabit.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <button
                                        onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                        disabled={markSubHabitCompleteMutation.isPending}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-[150ms] flex-shrink-0 ${
                                          isSubComplete
                                            ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                                            : 'border-neutral-300 dark:border-neutral-200 hover:border-primary-400 dark:hover:border-primary-400'
                                        } ${markSubHabitCompleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        aria-label={
                                          isSubComplete
                                            ? `Mark ${subHabit.name} as incomplete`
                                            : `Mark ${subHabit.name} as complete`
                                        }
                                      >
                                        {isSubComplete && <Check className="w-3 h-3" />}
                                      </button>
                                      <span
                                        className={`text-body-sm ${
                                          isSubComplete
                                            ? 'line-through text-neutral-500 dark:text-neutral-500'
                                            : 'text-neutral-800 dark:text-neutral-900'
                                        }`}
                                      >
                                        {subHabit.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                      disabled={markSubHabitCompleteMutation.isPending}
                                      className={`ml-2 px-3 py-1 rounded text-body-sm font-medium text-white transition-all duration-[150ms] flex-shrink-0 ${
                                        isSubComplete
                                          ? 'bg-violet-400 dark:bg-violet-400'
                                          : 'bg-violet-600 dark:bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-700'
                                      } ${markSubHabitCompleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                      aria-label={
                                        isSubComplete
                                          ? `Mark ${subHabit.name} as incomplete`
                                          : `Mark ${subHabit.name} as complete`
                                      }
                                    >
                                      Complete
                                    </button>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
