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

  // Load settings for transformation progress
  const { data: startDateSetting } = trpc.settings.getByKey.useQuery({
    key: 'transformationStartDate',
  });
  const { data: endDateSetting } = trpc.settings.getByKey.useQuery({
    key: 'transformationEndDate',
  });

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
  const startDate = startDateSetting?.value || today;
  const endDate = endDateSetting?.value || '';
  const transformationProgress = endDate ? getProgressPercentage(startDate, endDate) : 0;
  const daysRemaining = endDate
    ? getDaysRemaining(endDate, today < startDate ? startDate : today)
    : 0;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
          Dashboard
        </h1>
        <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
          180-Day Transformation Overview
        </p>
      </div>

      {/* 180-Day Progress */}
      {startDate && endDate && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
                Transformation Progress
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 transition-colors duration-200">
                {daysRemaining} days remaining • Started {formatDisplayDate(startDate)}
              </p>
            </div>
          </div>
          <ProgressBar progress={transformationProgress} color="career" />
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                Coding Progress
              </p>
              <p className="text-2xl font-bold text-accent-blue dark:text-accent-blue-dark mt-1 transition-colors duration-200">
                {Math.round(codingProgress)}%
              </p>
            </div>
            <div className="p-3 bg-accent-blue/10 dark:bg-accent-blue-dark/10 rounded-lg transition-colors duration-200">
              <svg
                className="w-8 h-8 text-accent-blue dark:text-accent-blue-dark transition-colors duration-200"
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
              className="text-sm text-accent-blue dark:text-accent-blue-dark hover:underline transition-colors duration-200"
            >
              View courses →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                Fitness
              </p>
              <p className="text-2xl font-bold text-accent-amber dark:text-accent-amber-dark mt-1 transition-colors duration-200">
                {latestWeight ? `${latestWeight} KG` : 'No data'}
              </p>
            </div>
            <div className="p-3 bg-accent-amber/10 dark:bg-accent-amber-dark/10 rounded-lg transition-colors duration-200">
              <svg
                className="w-8 h-8 text-accent-amber dark:text-accent-amber-dark transition-colors duration-200"
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
              className="text-sm text-accent-amber dark:text-accent-amber-dark hover:underline transition-colors duration-200"
            >
              View logs →
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                Trading Progress
              </p>
              <p className="text-2xl font-bold text-accent-emerald dark:text-accent-emerald-dark mt-1 transition-colors duration-200">
                {Math.round(tradingProgress)}%
              </p>
            </div>
            <div className="p-3 bg-accent-emerald/10 dark:bg-accent-emerald-dark/10 rounded-lg transition-colors duration-200">
              <svg
                className="w-8 h-8 text-accent-emerald dark:text-accent-emerald-dark transition-colors duration-200"
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
              className="text-sm text-accent-emerald dark:text-accent-emerald-dark hover:underline transition-colors duration-200"
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
            <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">
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
                    className="p-3 bg-surface dark:bg-surface-dark rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <button
                          onClick={() =>
                            toggleModuleCompletion(module.id, module.completed, module.courseType)
                          }
                          disabled={isUpdating}
                          className={`mt-0.5 mr-3 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            module.completed
                              ? 'bg-accent-blue dark:bg-accent-blue-dark border-accent-blue dark:border-accent-blue-dark text-white'
                              : 'border-border dark:border-border-dark hover:border-accent-blue dark:hover:border-accent-blue-dark'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {module.completed && <Check className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <div
                            className={`font-medium ${module.completed ? 'line-through text-text-tertiary dark:text-text-tertiary-dark' : 'text-text-primary dark:text-text-primary-dark'} transition-colors duration-200`}
                          >
                            {module.name}
                          </div>
                          <div className="text-xs text-text-tertiary dark:text-text-tertiary-dark mt-1 transition-colors duration-200">
                            {module.courseName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            module.courseType === 'coding'
                              ? 'bg-accent-blue/10 dark:bg-accent-blue-dark/10 text-accent-blue dark:text-accent-blue-dark'
                              : 'bg-accent-emerald/10 dark:bg-accent-emerald-dark/10 text-accent-emerald dark:text-accent-emerald-dark'
                          } transition-colors duration-200`}
                        >
                          {module.courseType}
                        </span>
                        <Link
                          href={`/${module.courseType}/${module.courseId}`}
                          className="text-xs text-accent-blue dark:text-accent-blue-dark hover:underline transition-colors duration-200"
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
                    className="p-3 bg-surface dark:bg-surface-dark rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <button
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                          disabled={isUpdating}
                          className={`mt-0.5 mr-3 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            task.completed
                              ? 'bg-accent-blue dark:bg-accent-blue-dark border-accent-blue dark:border-accent-blue-dark text-white'
                              : 'border-border dark:border-border-dark hover:border-accent-blue dark:hover:border-accent-blue-dark'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {task.completed && <Check className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <div
                            className={`font-medium ${task.completed ? 'line-through text-text-tertiary dark:text-text-tertiary-dark' : 'text-text-primary dark:text-text-primary-dark'} transition-colors duration-200`}
                          >
                            {task.title}
                          </div>
                          {task.taskProject && (
                            <div className="text-xs text-text-tertiary dark:text-text-tertiary-dark mt-1 transition-colors duration-200">
                              {task.taskProject.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs px-2 py-1 rounded bg-accent-blue/10 dark:bg-accent-blue-dark/10 text-accent-blue dark:text-accent-blue-dark transition-colors duration-200">
                          {taskTypeDisplay}
                        </span>
                        <Link
                          href="/tasks"
                          className="text-xs text-accent-blue dark:text-accent-blue-dark hover:underline transition-colors duration-200"
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
              className="text-sm text-accent-blue dark:text-accent-blue-dark hover:underline transition-colors duration-200"
            >
              View all tasks →
            </Link>
          </div>
        </Card>

        <Card title="Today's Habits">
          {todayHabits.length === 0 ? (
            <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm transition-colors duration-200">
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
                    className="p-2 hover:bg-background dark:hover:bg-background-dark rounded transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center flex-1">
                        <div
                          className={`mr-3 h-4 w-4 rounded border-2 flex items-center justify-center ${
                            isComplete
                              ? 'bg-green-500 border-green-500'
                              : 'border-border dark:border-border-dark'
                          } transition-colors duration-200`}
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
                              ? 'line-through text-text-tertiary dark:text-text-tertiary-dark'
                              : 'text-text-primary dark:text-text-primary-dark transition-colors duration-200'
                          }
                        >
                          {habit.name}
                        </span>
                      </div>
                      {totalSubHabits > 0 && (
                        <button
                          onClick={() => toggleExpandHabit(habit.id)}
                          className="ml-2 p-1 hover:bg-surface dark:hover:bg-surface-dark rounded transition-colors duration-200"
                          aria-label={isExpanded ? 'Collapse sub-habits' : 'Expand sub-habits'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                          )}
                        </button>
                      )}
                    </div>
                    {totalSubHabits > 0 && (
                      <div className="ml-7 text-xs text-text-secondary dark:text-text-secondary-dark transition-colors duration-200 mb-1">
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
                                className="flex items-center justify-between p-2 bg-surface dark:bg-surface-dark rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                              >
                                <span
                                  className={`text-sm flex-1 ${
                                    isSubComplete
                                      ? 'line-through text-text-tertiary dark:text-text-tertiary-dark'
                                      : 'text-text-primary dark:text-text-primary-dark'
                                  } transition-colors duration-200`}
                                >
                                  {subHabit.name}
                                </span>
                                <button
                                  onClick={() => toggleSubHabit(subHabit.id, isSubComplete)}
                                  disabled={markSubHabitCompleteMutation.isPending}
                                  className={`ml-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    isSubComplete
                                      ? 'bg-accent-blue dark:bg-accent-blue-dark border-accent-blue dark:border-accent-blue-dark text-white'
                                      : 'border-border dark:border-border-dark hover:border-accent-blue dark:hover:border-accent-blue-dark'
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
              className="text-sm text-accent-blue dark:text-accent-blue-dark hover:underline transition-colors duration-200"
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
