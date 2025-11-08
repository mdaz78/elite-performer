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
    <motion.div
      className="relative cursor-pointer group"
      onClick={onClick}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
        completed ? 'bg-accent-emerald dark:bg-accent-emerald-dark' : 'bg-accent-blue dark:bg-accent-blue-dark'
      }`} />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-background dark:text-background-dark opacity-40"
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
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {completed ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-8 h-8 rounded-full bg-accent-emerald dark:bg-accent-emerald-dark flex items-center justify-center shadow-md"
          >
            <svg
              className="w-5 h-5 text-white"
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
          <span className="text-xs font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
