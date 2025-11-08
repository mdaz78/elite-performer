'use client'

import { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  minDate?: string
  maxDate?: string
  variant?: 'default' | 'icon'
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  minDate,
  maxDate,
  variant = 'default',
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs(value || undefined))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedDate = value ? dayjs(value) : null
  const monthStart = currentMonth.startOf('month')
  const monthEnd = currentMonth.endOf('month')
  const startDate = monthStart.startOf('week')
  const endDate = monthEnd.endOf('week')
  const days: dayjs.Dayjs[] = []
  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    days.push(current)
    current = current.add(1, 'day')
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateSelect = (date: dayjs.Dayjs) => {
    if (minDate && date.isBefore(dayjs(minDate), 'day')) return
    if (maxDate && date.isAfter(dayjs(maxDate), 'day')) return
    onChange(date.format('YYYY-MM-DD'))
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => prev.add(direction === 'next' ? 1 : -1, 'month'))
  }

  const isToday = (date: dayjs.Dayjs) => date.isSame(dayjs(), 'day')
  const isSelected = (date: dayjs.Dayjs) => selectedDate && date.isSame(selectedDate, 'day')
  const isCurrentMonth = (date: dayjs.Dayjs) => date.month() === currentMonth.month()
  const isDisabled = (date: dayjs.Dayjs) => {
    if (minDate && date.isBefore(dayjs(minDate), 'day')) return true
    if (maxDate && date.isAfter(dayjs(maxDate), 'day')) return true
    return false
  }

  const displayText = value ? dayjs(value).format('MMM D, YYYY') : placeholder

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={value ? `Assigned: ${displayText}` : placeholder}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            value
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50'
              : 'bg-neutral-50 dark:bg-neutral-50 text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-11 px-4 py-3 border-[1.5px] border-neutral-300 dark:border-neutral-200 rounded bg-neutral-0 dark:bg-neutral-50 text-body text-neutral-900 dark:text-neutral-900 focus:outline-none focus:ring-[3px] focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 cursor-pointer transition-all duration-[150ms] hover:border-neutral-400 dark:hover:border-neutral-300 w-full text-left ${
            value ? 'font-medium' : 'text-neutral-500 dark:text-neutral-500'
          }`}
        >
          {displayText}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-50 ${variant === 'icon' ? 'right-0' : 'left-0'} mt-1 bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 rounded-lg shadow-xl p-4 min-w-[280px]`}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-100 text-neutral-800 dark:text-neutral-800 transition-colors duration-[150ms]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-800">
                  {currentMonth.format('MMMM YYYY')}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-100 text-neutral-800 dark:text-neutral-800 transition-colors duration-[150ms]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-caption font-semibold text-neutral-500 dark:text-neutral-500 text-center py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date) => {
                  const disabled = isDisabled(date)
                  const selected = isSelected(date)
                  const today = isToday(date)
                  const currentMonthDay = isCurrentMonth(date)

                  return (
                    <button
                      key={date.format('YYYY-MM-DD')}
                      type="button"
                      onClick={() => !disabled && handleDateSelect(date)}
                      disabled={disabled}
                      className={`
                        text-body-sm p-2 rounded transition-all duration-[150ms]
                        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-100'}
                        ${selected ? 'bg-primary-500 dark:bg-primary-500 text-white font-semibold' : ''}
                        ${today && !selected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : ''}
                        ${!currentMonthDay && !selected ? 'opacity-40' : ''}
                        ${!selected && !today && currentMonthDay ? 'text-neutral-800 dark:text-neutral-800' : ''}
                      `}
                    >
                      {date.format('D')}
                    </button>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = dayjs()
                    if (!isDisabled(today)) {
                      handleDateSelect(today)
                    }
                  }}
                  className="flex-1 text-body-sm px-3 py-1.5 rounded bg-neutral-50 dark:bg-neutral-50 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-neutral-800 dark:text-neutral-800 transition-colors duration-[150ms] font-medium"
                >
                  Today
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('')
                      setIsOpen(false)
                    }}
                    className="flex-1 text-body-sm px-3 py-1.5 rounded bg-neutral-50 dark:bg-neutral-50 hover:bg-error-500/10 dark:hover:bg-error-500/20 text-error-600 dark:text-error-500 transition-colors duration-[150ms] font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
