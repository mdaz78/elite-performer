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
import { ChevronDown, Code, DollarSign, Heart, Zap } from 'lucide-react';
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
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-[36px] font-bold text-neutral-900 dark:text-neutral-900 leading-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-[16px] text-neutral-600 dark:text-neutral-600">
          180-Day Transformation Overview
        </p>
      </div>

      {/* Transformation Progress Card */}
      <Card className="mb-8 animate-fadeIn">
        <div className="mb-4">
          <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-neutral-900 mb-1">
            Transformation Progress
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-500">
            {daysRemaining} days remaining • Started {formatDisplayDate(startDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-200 rounded-md h-3 overflow-hidden">
              <div
                className="h-3 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out shimmer-effect"
                style={{ width: `${Math.min(100, Math.max(0, transformationProgress))}%` }}
              />
            </div>
          </div>
          <span className="text-[16px] text-neutral-900 dark:text-neutral-900 font-semibold min-w-[50px] text-right">
            {transformationProgress.toFixed(1)}%
          </span>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Coding Progress Card */}
        <div
          className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-dark-lg hover:border-primary-500 dark:hover:border-primary-500 animate-fadeIn"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-[14px] text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider">
              CODING PROGRESS
            </p>
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500 rounded-[10px] flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-neutral-900 dark:text-neutral-900 mb-1">
            {Math.round(codingProgress)}%
          </p>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-500">
            {completedModules} of {totalModules} modules complete
          </p>
          <Link
            href="/coding"
            className="text-[14px] text-primary-600 dark:text-primary-500 font-medium inline-flex items-center gap-1 mt-3 hover:gap-2 transition-all duration-[150ms]"
          >
            View courses
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Fitness Card */}
        <div
          className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-dark-lg hover:border-primary-500 dark:hover:border-primary-500 animate-fadeIn"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-[14px] text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider">
              FITNESS
            </p>
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-500/15 text-accent-500 dark:text-accent-500 rounded-[10px] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-neutral-900 dark:text-neutral-900 mb-1">
            {latestWeight ? `${latestWeight} KG` : 'No data'}
          </p>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-500">
            {latestWeight ? 'Keep up the great work!' : 'Start logging your workouts'}
          </p>
          <Link
            href="/fitness"
            className="text-[14px] text-primary-600 dark:text-primary-500 font-medium inline-flex items-center gap-1 mt-3 hover:gap-2 transition-all duration-[150ms]"
          >
            View logs
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Trading Card */}
        <div
          className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-dark-lg hover:border-primary-500 dark:hover:border-primary-500 animate-fadeIn"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-[14px] text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider">
              TRADING
            </p>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-500/15 text-success-600 dark:text-success-500 rounded-[10px] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-neutral-900 dark:text-neutral-900 mb-1">
            ${tradingTotalPnL.toFixed(2)}
          </p>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-500">
            {tradingTradesCount} trades • {tradingWinRate.toFixed(1)}% win rate
          </p>
          <Link
            href="/trading"
            className="text-[14px] text-primary-600 dark:text-primary-500 font-medium inline-flex items-center gap-1 mt-3 hover:gap-2 transition-all duration-[150ms]"
          >
            View journal
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Today's Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <Card className="animate-fadeIn" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-semibold text-neutral-900 dark:text-neutral-900">
                Today's Tasks
              </h2>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-50 text-neutral-600 dark:text-neutral-600 rounded-xl text-[13px] font-semibold">
                {completedTasksCount} of {totalTasksCount} done
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-[14px] text-primary-600 dark:text-primary-500 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all duration-[150ms]"
            >
              View all
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
          {todayTasks.length === 0 && todayModules.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-500 text-body-sm">
              No tasks or modules scheduled for today
            </p>
          ) : (
            <div className="space-y-2">
              {/* Course Modules */}
              {todayModules.map((module) => {
                const isUpdating =
                  updateCodingModuleMutation.isPending || updateTradingModuleMutation.isPending;
                return (
                  <div
                    key={`${module.courseType}-${module.id}`}
                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms] cursor-pointer"
                  >
                    <button
                      onClick={() =>
                        toggleModuleCompletion(module.id, module.completed, module.courseType)
                      }
                      disabled={isUpdating}
                      className={`mt-[2px] w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-[150ms] ${
                        module.completed
                          ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                          : 'border-neutral-200 dark:border-neutral-200 hover:border-primary-500 dark:hover:border-primary-500'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {module.completed && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[15px] font-medium ${module.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-900'}`}
                      >
                        {module.name}
                      </div>
                      <div className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-1 flex items-center flex-wrap gap-2">
                        {module.courseName}
                        <span
                          className={`inline-block px-[10px] py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                            module.courseType === 'coding'
                              ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500'
                              : 'bg-success-100 dark:bg-success-500/15 text-success-600 dark:text-success-500'
                          }`}
                        >
                          {module.courseType === 'coding' ? 'CODING' : 'TRADING'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/${module.courseType}/${module.courseId}`}
                      className="px-[14px] py-[6px] bg-transparent border-[1.5px] border-neutral-200 dark:border-neutral-200 rounded-md text-[13px] font-semibold text-primary-600 dark:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/15 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-[150ms] flex-shrink-0"
                    >
                      View →
                    </Link>
                  </div>
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
                const taskTypeColorClasses =
                  task.type === 'DeepWork'
                    ? 'bg-accent-100 dark:bg-accent-500/15 text-accent-600 dark:text-accent-500'
                    : task.type === 'TradingPractice'
                      ? 'bg-success-100 dark:bg-success-500/15 text-success-600 dark:text-success-500'
                      : 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500';
                return (
                  <div
                    key={`task-${task.id}`}
                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms] cursor-pointer"
                  >
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      disabled={isUpdating}
                      className={`mt-[2px] w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-[150ms] ${
                        task.completed
                          ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                          : 'border-neutral-200 dark:border-neutral-200 hover:border-primary-500 dark:hover:border-primary-500'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {task.completed && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[15px] font-medium ${task.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-900'}`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-1 flex items-center flex-wrap gap-2">
                        {task.taskProject && task.taskProject.name}
                        <span
                          className={`inline-block px-[10px] py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${taskTypeColorClasses}`}
                        >
                          {taskTypeDisplay}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/tasks"
                      className="px-[14px] py-[6px] bg-transparent border-[1.5px] border-neutral-200 dark:border-neutral-200 rounded-md text-[13px] font-semibold text-primary-600 dark:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/15 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-[150ms] flex-shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Today's Habits Card */}
        <Card className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-semibold text-neutral-900 dark:text-neutral-900">
                Today's Habits
              </h2>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-50 text-neutral-600 dark:text-neutral-600 rounded-xl text-[13px] font-semibold">
                {completedHabitsCount} of {totalHabitsCount} done
              </span>
            </div>
            <Link
              href="/habit-tracker"
              className="text-[14px] text-primary-600 dark:text-primary-500 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all duration-[150ms]"
            >
              View all
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
          {todayHabits.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-500 text-[14px]">
              No habits scheduled for today
            </p>
          ) : (
            <div className="space-y-2">
              {todayHabits.map((habit) => {
                const isExpanded = expandedHabits.has(habit.id);
                const totalSubHabits = habit.subHabits?.length || 0;
                const completedSubHabits =
                  habit.subHabitCompletions?.filter((sc) => sc.completed).length || 0;

                // Render habit icon
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
                    <div className="w-10 h-10 bg-info-500 dark:bg-info-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {IconComponent ? (
                        <IconComponent className="w-5 h-5 text-white" />
                      ) : (
                        <Heart className="w-5 h-5 text-white" />
                      )}
                    </div>
                  );
                };

                return (
                  <div
                    key={habit.id}
                    className="p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {renderHabitIcon()}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-900">
                            {habit.name}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {totalSubHabits > 0 && (
                          <button
                            onClick={() => toggleExpandHabit(habit.id)}
                            className={`w-8 h-8 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-all duration-[150ms] flex items-center justify-center ${isExpanded ? 'rotate-180' : ''}`}
                            aria-label={isExpanded ? 'Collapse habit' : 'Expand habit'}
                          >
                            <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && totalSubHabits > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 bg-neutral-50 dark:bg-neutral-50 rounded-lg p-4 animate-slideDown">
                            {/* Progress indicator */}
                            <div className="text-center text-[14px] text-neutral-500 dark:text-neutral-500 font-medium mb-3">
                              {completedSubHabits} / {totalSubHabits} completed (
                              {Math.round((completedSubHabits / totalSubHabits) * 100)}%)
                            </div>
                            <div className="space-y-2">
                              {habit.subHabits
                                ?.sort((a, b) => a.order - b.order)
                                .map((subHabit) => {
                                  const subCompletion = habit.subHabitCompletions?.find(
                                    (sc) => sc.subHabitId === subHabit.id
                                  );
                                  const isSubComplete = subCompletion?.completed || false;

                                  return (
                                    <div
                                      key={subHabit.id}
                                      className="flex items-center gap-3 p-3 bg-neutral-0 dark:bg-neutral-100 rounded-md hover:translate-x-1 transition-all duration-[150ms]"
                                    >
                                      <button
                                        onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                        disabled={markSubHabitCompleteMutation.isPending}
                                        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all duration-[150ms] flex-shrink-0 ${
                                          isSubComplete
                                            ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                                            : 'border-neutral-200 dark:border-neutral-200 hover:border-primary-500 dark:hover:border-primary-500'
                                        } ${markSubHabitCompleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        aria-label={
                                          isSubComplete
                                            ? `Mark ${subHabit.name} as incomplete`
                                            : `Mark ${subHabit.name} as complete`
                                        }
                                      >
                                        {isSubComplete && (
                                          <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                          >
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        )}
                                      </button>
                                      <span
                                        className={`flex-1 text-[14px] font-medium ${
                                          isSubComplete
                                            ? 'line-through text-neutral-500 dark:text-neutral-500'
                                            : 'text-neutral-900 dark:text-neutral-900'
                                        }`}
                                      >
                                        {subHabit.name}
                                      </span>
                                      <button
                                        onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                        disabled={markSubHabitCompleteMutation.isPending}
                                        className={`px-3 py-[6px] rounded-md text-[12px] font-semibold text-white transition-all duration-[150ms] hover:-translate-y-[1px] flex-shrink-0 ${
                                          isSubComplete
                                            ? 'bg-success-500 dark:bg-success-500'
                                            : 'bg-primary-500 dark:bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-600'
                                        } ${markSubHabitCompleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        aria-label={
                                          isSubComplete
                                            ? `Mark ${subHabit.name} as incomplete`
                                            : `Mark ${subHabit.name} as complete`
                                        }
                                      >
                                        {isSubComplete ? 'Completed ✓' : 'Complete'}
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
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
