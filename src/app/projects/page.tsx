'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/src/lib/trpc-client'
import { Card, ProgressBar } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { formatDisplayDate, getToday, addDays } from '@/src/utils/date'
import { createVariants, staggerContainer } from '@/src/lib/animations'

function ProjectsPageContent() {
  const utils = trpc.useUtils()
  const [formData, setFormData] = useState<{
    name: string
    description: string
    status: 'active' | 'completed' | 'paused'
    startDate: string
    targetDate: string
  }>({
    name: '',
    description: '',
    status: 'active',
    startDate: getToday(),
    targetDate: addDays(getToday(), 30),
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.getAll.useQuery()
  const { data: tasks = [], isLoading: tasksLoading } = trpc.tasks.getAll.useQuery()

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      setFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: getToday(),
        targetDate: addDays(getToday(), 30),
      })
    },
  })

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: getToday(),
        targetDate: addDays(getToday(), 30),
      })
    },
  })

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : undefined,
      })
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : undefined,
      })
    }
  }

  const handleEdit = (project: typeof projects[0]) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : getToday(),
      targetDate: project.targetDate ? new Date(project.targetDate).toISOString().split('T')[0] : addDays(getToday(), 30),
    })
    setEditingId(project.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project? Tasks linked to it will remain but lose the link.')) return
    await deleteMutation.mutateAsync({ id })
  }

  const getProjectTasks = (projectId: number) => {
    return tasks.filter((t) => t.projectId === projectId)
  }

  const getProjectProgress = (project: typeof projects[0]): number => {
    const projectTasks = getProjectTasks(project.id)
    if (projectTasks.length === 0) return 0
    const completed = projectTasks.filter((t) => t.completed).length
    return (completed / projectTasks.length) * 100
  }

  const isLoading = projectsLoading || tasksLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark transition-colors duration-200">Projects</h1>
        <p className="mt-2 text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">Manage your long-term projects and goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title={editingId ? 'Edit Project' : 'Add Project'} className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                placeholder="e.g., Build Portfolio App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                placeholder="Project description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'paused' })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 transition-colors duration-200">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-accent-blue dark:bg-accent-blue-dark text-white rounded-md hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 transition-colors duration-200"
              >
                {editingId ? 'Update' : 'Add'} Project
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      name: '',
                      description: '',
                      status: 'active',
                      startDate: getToday(),
                      targetDate: addDays(getToday(), 30),
                    })
                  }}
                  className="px-4 py-2 bg-background dark:bg-background-dark text-text-secondary dark:text-text-secondary-dark rounded-md hover:bg-background/80 dark:hover:bg-background-dark/80 border border-border dark:border-border-dark transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card title="Projects" className="lg:col-span-2">
          {projects.length === 0 ? (
            <p className="text-text-tertiary dark:text-text-tertiary-dark text-center py-8 transition-colors duration-200">No projects yet. Add your first project above!</p>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {projects.map((project) => {
                  const projectTasks = getProjectTasks(project.id)
                  const progress = getProjectProgress(project)
                  const statusColors = {
                    active: 'bg-accent-blue dark:bg-accent-blue-dark',
                    completed: 'bg-accent-emerald dark:bg-accent-emerald-dark',
                    paused: 'bg-text-tertiary dark:bg-text-tertiary-dark',
                  }

                  return (
                    <motion.div
                      key={project.id}
                      variants={createVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="p-4 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">{project.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium text-white rounded transition-colors duration-200 ${statusColors[project.status]}`}
                            >
                              {project.status}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2 transition-colors duration-200">{project.description}</p>
                          )}
                          {project.startDate && project.targetDate && (
                            <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">
                              {formatDisplayDate(project.startDate.toISOString())} - {formatDisplayDate(project.targetDate.toISOString())}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-accent-blue dark:text-accent-blue-dark hover:text-accent-blue/90 dark:hover:text-accent-blue-dark/90 text-sm transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
                            {projectTasks.filter((t) => t.completed).length} of {projectTasks.length} tasks completed
                          </span>
                          <span className="text-sm font-semibold text-accent-blue dark:text-accent-blue-dark transition-colors duration-200">{Math.round(progress)}%</span>
                        </div>
                        <ProgressBar progress={progress} color="career" showPercentage={false} />
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsPageContent />
    </ProtectedRoute>
  )
}
