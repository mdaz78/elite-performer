'use client'

import { motion } from 'framer-motion'

interface HabitProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  completed?: boolean
  onClick?: () => void
}

export function HabitProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  completed = false,
  onClick,
}: HabitProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (completed) return '#10B981' // green
    if (progress > 0) return '#F59E0B' // amber/yellow
    return '#9B9A97' // gray
  }

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border dark:text-border-dark opacity-20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        ) : (
          <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  )
}
