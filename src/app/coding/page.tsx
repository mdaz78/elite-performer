'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { trpc } from '@/src/lib/trpc-client'
import { Card, InputDialog, ProgressBar } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { formatDisplayDate } from '@/src/utils/date'
import { createVariants, staggerContainer } from '@/src/lib/animations'

function CodingPageContent() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: courses = [], isLoading } = trpc.codingCourses.getAll.useQuery()
  const createMutation = trpc.codingCourses.create.useMutation({
    onSuccess: () => {
      utils.codingCourses.getAll.invalidate()
      setShowAddDialog(false)
    },
  })
  const deleteMutation = trpc.codingCourses.delete.useMutation({
    onSuccess: () => {
      utils.codingCourses.getAll.invalidate()
    },
  })

  // Calculate progress for each course
  const coursesWithProgress = courses.map((course) => {
    const courseModules = course.modules || []
    const completed = courseModules.filter((m) => m.completed).length
    const progress = courseModules.length > 0 ? (completed / courseModules.length) * 100 : 0
    return { ...course, progress }
  })

  const handleAddCourse = async (name: string) => {
    if (!name.trim()) return
    await createMutation.mutateAsync({
      name: name.trim(),
    })
  }

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Delete this course? All modules will also be deleted.')) return
    await deleteMutation.mutateAsync({ id })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Coding Courses</h1>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Track your learning progress</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-md hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200"
          >
            Add Course
          </button>
        </div>
      </div>

      {coursesWithProgress.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-text-tertiary dark:text-text-tertiary-dark mb-4 transition-colors duration-200">
              No courses yet. Add your first course to get started!
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-md hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200"
            >
              Add Course
            </button>
          </div>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {coursesWithProgress.map((course) => (
              <motion.div
                key={course.id}
                variants={createVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer group relative"
                  onClick={() => router.push(`/coding/${course.id}`)}
                >
                  <div className="mb-4 relative z-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark group-hover:text-accent-blue dark:group-hover:text-accent-blue-dark transition-colors duration-200">
                        {course.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCourse(course.id)
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 relative z-20 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer"
                        aria-label={`Delete ${course.name}`}
                        title="Delete course"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    {course.description && (
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2 transition-colors duration-200">{course.description}</p>
                    )}
                    {course.startDate && (
                      <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">
                        Started: {formatDisplayDate(course.startDate.toISOString())}
                      </p>
                    )}
                  </div>
                  <ProgressBar progress={course.progress} color="career" showPercentage={true} />
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-accent-blue dark:text-accent-blue-dark font-medium group-hover:underline transition-colors duration-200">
                      View Details →
                    </span>
                    <span className="text-xs text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">{Math.round(course.progress)}%</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <InputDialog
        isOpen={showAddDialog}
        title="Add New Course"
        message="Enter a name for your new course"
        inputLabel="Course Name"
        inputPlaceholder="e.g., React Advanced Patterns"
        confirmLabel="Add Course"
        cancelLabel="Cancel"
        onConfirm={handleAddCourse}
        onCancel={() => setShowAddDialog(false)}
      />
    </div>
  )
}

export default function CodingPage() {
  return (
    <ProtectedRoute>
      <CodingPageContent />
    </ProtectedRoute>
  )
}
