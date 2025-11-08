'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Check, ChevronDown, ChevronUp, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    icon: string | null;
    status: 'active' | 'paused';
    subHabits?: Array<{ id: number; name: string; order: number }>;
    completion?: { completed: boolean } | null;
    subHabitCompletions?: Array<{ subHabitId: number; completed: boolean }>;
  };
  completionRate?: number;
  weeklyProgress?: number;
  onToggleComplete: () => void;
  onToggleSubHabit?: (subHabitId: number, completed: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  showActions?: boolean;
}

export function HabitCard({
  habit,
  completionRate = 0,
  onToggleComplete,
  onToggleSubHabit,
  onEdit,
  onDelete,
  onPause,
  onResume,
  showActions = false,
}: HabitCardProps) {
  const [isSubHabitsExpanded, setIsSubHabitsExpanded] = useState(false);
  const isComplete = habit.completion?.completed || false;
  const completedSubHabits = (habit.subHabitCompletions || []).filter((sc) => sc.completed).length;
  const totalSubHabits = habit.subHabits?.length || 0;
  const progress =
    totalSubHabits > 0 ? (completedSubHabits / totalSubHabits) * 100 : isComplete ? 100 : 0;

  const renderIcon = () => {
    if (!habit.icon) {
      return (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          {habit.name.charAt(0).toUpperCase()}
        </div>
      );
    }

    const IconComponent = (
      LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
    )[habit.icon];
    if (!IconComponent) {
      return (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          {habit.name.charAt(0).toUpperCase()}
        </div>
      );
    }

    // Map icon colors and backgrounds based on icon name
    const iconStyles: Record<string, { bg: string; text: string }> = {
      Droplet: {
        bg: 'bg-primary-50 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400',
      },
      Running: {
        bg: 'bg-accent-50 dark:bg-accent-900/30',
        text: 'text-accent-600 dark:text-accent-400',
      },
      BookOpen: {
        bg: 'bg-success-50 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400',
      },
      Brain: {
        bg: 'bg-accent-50 dark:bg-accent-900/30',
        text: 'text-accent-600 dark:text-accent-400',
      },
      Laptop: {
        bg: 'bg-neutral-100 dark:bg-neutral-100',
        text: 'text-neutral-800 dark:text-neutral-800',
      },
    };

    const iconStyle = iconStyles[habit.icon] || {
      bg: 'bg-primary-50 dark:bg-primary-900/30',
      text: 'text-primary-600 dark:text-primary-400',
    };

    return (
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyle.bg}`}>
        <IconComponent className={`w-6 h-6 ${iconStyle.text}`} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-neutral-0 dark:bg-neutral-100 rounded-lg p-6 shadow hover:shadow-md dark:hover:shadow-dark-md transition-all duration-[150ms] relative h-full flex flex-col"
    >
      {/* Completion Checkbox - Top Right */}
      <button
        onClick={onToggleComplete}
        className={`absolute top-6 right-6 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-[150ms] shadow-sm hover:shadow-md z-10 ${
          isComplete
            ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600'
            : 'bg-white dark:bg-neutral-50 border-neutral-300 dark:border-neutral-200 hover:border-primary-400 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-50'
        }`}
        title={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isComplete ? <Check className="w-5 h-5" /> : <Check className="w-5 h-5 text-neutral-400 dark:text-neutral-400 opacity-50" />}
      </button>

      {/* Icon - Top Left */}
      <div className="mb-3">{renderIcon()}</div>

      {/* Title */}
      <h3 className="font-bold text-h3 text-neutral-800 dark:text-neutral-800 mb-4 pr-10">
        {habit.name}
      </h3>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-200 rounded overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Sub-habits List - Collapsible */}
      {totalSubHabits > 0 && onToggleSubHabit && (
        <div className="mb-4">
          <button
            onClick={() => setIsSubHabitsExpanded(!isSubHabitsExpanded)}
            className="w-full flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-colors duration-[150ms] mb-2"
          >
            <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-700">
              Sub-habits ({completedSubHabits}/{totalSubHabits})
            </span>
            {isSubHabitsExpanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-500 dark:text-neutral-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-500" />
            )}
          </button>
          {isSubHabitsExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
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
                      className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-50 rounded hover:bg-neutral-100 dark:hover:bg-neutral-100 transition-colors duration-[150ms]"
                    >
                      <span
                        className={`text-body-sm flex-1 ${
                          isSubComplete
                            ? 'line-through text-neutral-400 dark:text-neutral-400'
                            : 'text-neutral-700 dark:text-neutral-700'
                        }`}
                      >
                        {subHabit.name}
                      </span>
                      <button
                        onClick={() => onToggleSubHabit(subHabit.id, isSubComplete)}
                        className={`ml-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-[150ms] ${
                          isSubComplete
                            ? 'bg-primary-500 dark:bg-primary-500 border-primary-500 dark:border-primary-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-200 hover:border-primary-400 dark:hover:border-primary-400'
                        }`}
                      >
                        {isSubComplete && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
            </motion.div>
          )}
        </div>
      )}

      {/* Actions - Only show when showActions is true */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-50 rounded transition-colors duration-[150ms]"
              title="Edit habit"
            >
              <Edit className="w-4 h-4 text-neutral-600 dark:text-neutral-600" />
            </button>
          )}
          {habit.status === 'active'
            ? onPause && (
                <button
                  onClick={onPause}
                  className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-50 rounded transition-colors duration-[150ms]"
                  title="Pause habit"
                >
                  <Pause className="w-4 h-4 text-neutral-600 dark:text-neutral-600" />
                </button>
              )
            : onResume && (
                <button
                  onClick={onResume}
                  className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-50 rounded transition-colors duration-[150ms]"
                  title="Resume habit"
                >
                  <Play className="w-4 h-4 text-neutral-600 dark:text-neutral-600" />
                </button>
              )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-error-500/10 dark:hover:bg-error-500/20 rounded transition-colors duration-[150ms] text-error-600 dark:text-error-500 ml-auto"
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
