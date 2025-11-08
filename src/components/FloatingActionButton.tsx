'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-50 transition-shadow duration-200"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      aria-label="Add habit"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  )
}
