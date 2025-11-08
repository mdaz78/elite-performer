'use client';

import { Card, ProgressBar } from '@/src/components';
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
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
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
  const { data: tradingCourses = [] } = trpc.tradingCourses.getAll.useQuery();
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

  // Mutation to toggle sub-habit completion
  const markSubHabitCompleteMutation = trpc.habits.markSubHabitComplete.useMutation({
    onSuccess: () => {
      utils.habits.getToday.invalidate();
    },
  });

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

  // Calculate trading progress
  let totalTradingModules = 0;
  let completedTradingModules = 0;
  tradingCourses.forEach((course) => {
    totalTradingModules += course.modules?.length || 0;
    completedTradingModules += course.modules?.filter((m) => m.completed).length || 0;
  });
  const tradingProgress =
    totalTradingModules > 0 ? (completedTradingModules / totalTradingModules) * 100 : 0;

  // Get latest weight
  const sortedLogs = [...fitnessLogs]
    .filter((log) => log.weight != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestWeight = sortedLogs[0]?.weight;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-800 dark:text-neutral-800">Dashboard</h1>
        <p className="mt-2 text-body-sm text-neutral-600 dark:text-neutral-600">
          180-Day Transformation Overview
        </p>
      </div>

      {/* 180-Day Progress */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-h3 text-neutral-800 dark:text-neutral-800">
              Transformation Progress
            </h2>
            <p className="text-body-sm text-neutral-600 dark:text-neutral-600 mt-1">
              {daysRemaining} days remaining • Started {formatDisplayDate(startDate)}
            </p>
          </div>
        </div>
        <ProgressBar progress={transformationProgress} color="primary" />
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-neutral-600 dark:text-neutral-600">
                Coding Progress
              </p>
              <p className="text-h2 font-bold text-primary-500 dark:text-primary-500 mt-1">
                {Math.round(codingProgress)}%
              </p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <svg
                className="w-8 h-8 text-primary-500 dark:text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/coding"
              className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-[150ms]"
            >
              View courses →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-neutral-600 dark:text-neutral-600">
                Fitness
              </p>
              <p className="text-h2 font-bold text-accent-500 dark:text-accent-500 mt-1">
                {latestWeight ? `${latestWeight} KG` : 'No data'}
              </p>
            </div>
            <div className="p-3 bg-accent-50 dark:bg-accent-900/30 rounded-lg">
              <svg
                className="w-8 h-8 text-accent-500 dark:text-accent-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/fitness"
              className="text-body-sm text-accent-600 dark:text-accent-400 hover:underline transition-colors duration-[150ms]"
            >
              View logs →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-neutral-600 dark:text-neutral-600">
                Trading Progress
              </p>
              <p className="text-h2 font-bold text-success-500 dark:text-success-500 mt-1">
                {Math.round(tradingProgress)}%
              </p>
            </div>
            <div className="p-3 bg-success-50 dark:bg-success-900/30 rounded-lg">
              <svg
                className="w-8 h-8 text-success-500 dark:text-success-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/trading"
              className="text-body-sm text-success-600 dark:text-success-400 hover:underline transition-colors duration-[150ms]"
            >
              View courses →
            </Link>
          </div>
        </Card>
      </div>

      {/* Today's Tasks & Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Today's Tasks">
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
                    className="p-3 bg-neutral-50 dark:bg-neutral-50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-colors duration-[150ms]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
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
                        <div className="flex-1">
                          <div
                            className={`font-medium ${module.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-800'}`}
                          >
                            {module.name}
                          </div>
                          <div className="text-caption text-neutral-500 dark:text-neutral-500 mt-1">
                            {module.courseName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span
                          className={`text-caption px-2 py-1 rounded ${
                            module.courseType === 'coding'
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                              : 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400'
                          }`}
                        >
                          {module.courseType}
                        </span>
                        <Link
                          href={`/${module.courseType}/${module.courseId}`}
                          className="text-caption text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-[150ms]"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}

              {/* Regular Tasks */}
              {todayTasks.map((task) => {
                const isUpdating = updateTaskMutation.isPending;
                const taskTypeDisplay =
                  task.type === 'DeepWork'
                    ? 'Deep Work'
                    : task.type === 'TradingPractice'
                      ? 'Trading Practice'
                      : task.type;
                return (
                  <li
                    key={`task-${task.id}`}
                    className="p-3 bg-neutral-50 dark:bg-neutral-50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-colors duration-[150ms]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
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
                        <div className="flex-1">
                          <div
                            className={`font-medium ${task.completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-800'}`}
                          >
                            {task.title}
                          </div>
                          {task.taskProject && (
                            <div className="text-caption text-neutral-500 dark:text-neutral-500 mt-1">
                              {task.taskProject.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-caption px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          {taskTypeDisplay}
                        </span>
                        <Link
                          href="/tasks"
                          className="text-caption text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-[150ms]"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4">
            <Link
              href="/tasks"
              className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-[150ms]"
            >
              View all tasks →
            </Link>
          </div>
        </Card>

        <Card title="Today's Habits">
          {todayHabits.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-500 text-body-sm">
              No habits scheduled for today
            </p>
          ) : (
            <ul className="space-y-2">
              {todayHabits.map((habit) => {
                const isComplete = habit.completion?.completed || false;
                const completedSubHabits = habit.subHabitCompletions.filter(
                  (sc) => sc.completed
                ).length;
                const totalSubHabits = habit.subHabits.length;
                const progress =
                  totalSubHabits > 0 ? (completedSubHabits / totalSubHabits) * 100 : 0;
                const isExpanded = expandedHabits.has(habit.id);

                return (
                  <li
                    key={habit.id}
                    className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-50 rounded transition-colors duration-[150ms]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center flex-1">
                        <div
                          className={`mr-3 h-4 w-4 rounded border-2 flex items-center justify-center ${
                            isComplete
                              ? 'bg-success-500 dark:bg-success-500 border-success-500 dark:border-success-500'
                              : 'border-neutral-300 dark:border-neutral-200'
                          } transition-colors duration-[150ms]`}
                        >
                          {isComplete && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={
                            isComplete
                              ? 'line-through text-neutral-500 dark:text-neutral-500'
                              : 'text-neutral-800 dark:text-neutral-800'
                          }
                        >
                          {habit.name}
                        </span>
                      </div>
                      {totalSubHabits > 0 && (
                        <button
                          onClick={() => toggleExpandHabit(habit.id)}
                          className="ml-2 p-1 hover:bg-neutral-50 dark:hover:bg-neutral-50 rounded transition-colors duration-[150ms]"
                          aria-label={isExpanded ? 'Collapse sub-habits' : 'Expand sub-habits'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-neutral-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-600" />
                          )}
                        </button>
                      )}
                    </div>
                    {totalSubHabits > 0 && (
                      <div className="ml-7 text-caption text-neutral-600 dark:text-neutral-600 mb-1">
                        {completedSubHabits} / {totalSubHabits} sub-habits ({Math.round(progress)}%)
                      </div>
                    )}
                    {isExpanded && totalSubHabits > 0 && (
                      <div className="ml-7 mt-2 space-y-1">
                        {habit.subHabits
                          .sort((a, b) => a.order - b.order)
                          .map((subHabit) => {
                            const subCompletion = habit.subHabitCompletions.find(
                              (sc) => sc.subHabitId === subHabit.id
                            );
                            const isSubComplete = subCompletion?.completed || false;

                            return (
                              <div
                                key={subHabit.id}
                                className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-colors duration-[150ms]"
                              >
                                <span
                                  className={`text-body-sm flex-1 ${
                                    isSubComplete
                                      ? 'line-through text-neutral-500 dark:text-neutral-500'
                                      : 'text-neutral-800 dark:text-neutral-800'
                                  }`}
                                >
                                  {subHabit.name}
                                </span>
                                <button
                                  onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                  disabled={markSubHabitCompleteMutation.isPending}
                                  className={`ml-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-[150ms] ${
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
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4">
            <Link
              href="/habit-tracker"
              className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-[150ms]"
            >
              View all habits →
            </Link>
          </div>
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
