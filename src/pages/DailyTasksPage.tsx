import { useEffect, useState } from 'react';
import { db } from '../db';
import { Card } from '../components';
import { getToday, formatDisplayDate } from '../utils/date';
import type { Task, Project, TaskType } from '../types';

export const DailyTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    type: 'Deep Work',
    projectId: undefined,
    completed: false,
    scheduledDate: getToday(),
  });
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [isLoading, setIsLoading] = useState(true);

  const taskTypes: TaskType[] = [
    'Deep Work',
    'Gym',
    'Trading Practice',
    'Coding',
    'SWE Prep',
    'Review',
    'Other',
  ];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    const allTasks = await db.tasks
      .where('scheduledDate')
      .equals(selectedDate)
      .toArray();
    setTasks(allTasks);

    const allProjects = await db.projects.toArray();
    setProjects(allProjects);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: Omit<Task, 'id'> = {
      title: formData.title || '',
      type: formData.type || 'Deep Work',
      projectId: formData.projectId,
      completed: false,
      scheduledDate: formData.scheduledDate || getToday(),
    };

    await db.tasks.add(taskData);

    // Reset form
    setFormData({
      title: '',
      type: 'Deep Work',
      projectId: undefined,
      completed: false,
      scheduledDate: selectedDate,
    });

    loadData();
  };

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    const now = new Date().toISOString();
    await db.tasks.update(taskId, {
      completed: !completed,
      completedAt: !completed ? now : undefined,
    });
    loadData();
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;
    await db.tasks.delete(taskId);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  const tasksByType = taskTypes.map((type) => ({
    type,
    tasks: tasks.filter((t) => t.type === type),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Tasks</h1>
        <p className="mt-2 text-gray-600">Manage your daily routine and tasks</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-career focus:border-career"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Add Task" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-career focus:border-career"
                placeholder="e.g., Complete React module"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-career focus:border-career"
              >
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
              <select
                value={formData.projectId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-career focus:border-career"
              >
                <option value="">None</option>
                {projects
                  .filter((p) => p.status === 'active')
                  .map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-career focus:border-career"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-career text-white rounded-md hover:bg-career-dark transition-colors"
            >
              Add Task
            </button>
          </form>
        </Card>

        <Card title={`Tasks for ${formatDisplayDate(selectedDate)}`} className="lg:col-span-2">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks for this date. Add one above!</p>
          ) : (
            <div className="space-y-6">
              {tasksByType.map(({ type, tasks: typeTasks }) => {
                if (typeTasks.length === 0) return null;

                return (
                  <div key={type}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{type}</h3>
                    <div className="space-y-2">
                      {typeTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId);
                        return (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center flex-1">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id!, task.completed)}
                                className="mr-3 h-4 w-4 text-career focus:ring-career border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                {project && (
                                  <p className="text-xs text-gray-500 mt-1">Project: {project.name}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(task.id!)}
                              className="ml-4 text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
