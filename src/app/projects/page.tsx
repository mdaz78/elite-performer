'use client'

import { useState } from 'react'
import { trpc } from '@/src/lib/trpc-client'
import { Card, ProgressBar } from '@/src/components'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { formatDisplayDate, getToday, addDays } from '@/src/utils/date'

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
        <p className="text-gray-500">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="mt-2 text-gray-600">Manage your long-term projects and goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title={editingId ? 'Edit Project' : 'Add Project'} className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Build Portfolio App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'paused' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card title="Projects" className="lg:col-span-2">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet. Add your first project above!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const projectTasks = getProjectTasks(project.id)
                const progress = getProjectProgress(project)
                const statusColors = {
                  active: 'bg-blue-500',
                  completed: 'bg-emerald-500',
                  paused: 'bg-gray-400',
                }

                return (
                  <div
                    key={project.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium text-white rounded ${statusColors[project.status]}`}
                          >
                            {project.status}
                          </span>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        )}
                        {project.startDate && project.targetDate && (
                          <p className="text-xs text-gray-500">
                            {formatDisplayDate(project.startDate.toISOString())} - {formatDisplayDate(project.targetDate.toISOString())}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">
                          {projectTasks.filter((t) => t.completed).length} of {projectTasks.length} tasks completed
                        </span>
                        <span className="text-sm font-semibold text-blue-500">{Math.round(progress)}%</span>
                      </div>
                      <ProgressBar progress={progress} color="career" showPercentage={false} />
                    </div>
                  </div>
                )
              })}
            </div>
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
