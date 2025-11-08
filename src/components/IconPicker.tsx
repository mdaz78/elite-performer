'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, X } from 'lucide-react'

// Predefined list of commonly used icons for habits
const HABIT_ICONS = [
  'Activity',
  'AlarmClock',
  'Book',
  'Brain',
  'Coffee',
  'Dumbbell',
  'Flame',
  'Heart',
  'Moon',
  'Music',
  'PenTool',
  'Running',
  'Sun',
  'Target',
  'Trophy',
  'Water',
  'Zap',
  'CheckCircle',
  'Star',
  'Medal',
  'Award',
  'TrendingUp',
  'Lightbulb',
  'BookOpen',
  'GraduationCap',
  'Briefcase',
  'Code',
  'Gamepad2',
  'Camera',
  'Palette',
] as const

interface IconPickerProps {
  selectedIcon: string | null
  onSelect: (icon: string | null) => void
  onClose?: () => void
}

export function IconPicker({ selectedIcon, onSelect, onClose }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIcons = HABIT_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }>
    if (!IconComponent) return null
    return <IconComponent className="w-5 h-5" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-lg focus:ring-2 focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-transparent transition-colors duration-200"
          />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-text-primary dark:text-text-primary-dark" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2">
        {/* No icon option */}
        <button
          onClick={() => onSelect(null)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedIcon === null
              ? 'border-accent-blue dark:border-accent-blue-dark bg-accent-blue/10 dark:bg-accent-blue-dark/20'
              : 'border-border dark:border-border-dark hover:border-accent-blue/50 dark:hover:border-accent-blue-dark/50'
          }`}
        >
          <X className="w-5 h-5 mx-auto text-text-secondary dark:text-text-secondary-dark" />
        </button>
        {filteredIcons.map((iconName) => {
          const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }>
          if (!IconComponent) return null

          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedIcon === iconName
                  ? 'border-accent-blue dark:border-accent-blue-dark bg-accent-blue/10 dark:bg-accent-blue-dark/20'
                  : 'border-border dark:border-border-dark hover:border-accent-blue/50 dark:hover:border-accent-blue-dark/50'
              }`}
            >
              <IconComponent className="w-5 h-5 mx-auto text-text-primary dark:text-text-primary-dark transition-colors duration-200" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
