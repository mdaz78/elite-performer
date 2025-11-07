import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CsvImporter, ProgressBar } from '../components';
import { db } from '../db';
import type { CodingCourse, CourseModule } from '../types';
import { formatDisplayDate } from '../utils/date';

interface SortableModuleItemProps {
  module: CourseModule;
  onToggle: (moduleId: number, completed: boolean) => void;
  onDelete: (moduleId: number) => void;
}

const SortableModuleItem = ({ module, onToggle, onDelete }: SortableModuleItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
        module.completed
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 mr-3 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
        >
          <svg
            className="w-5 h-5 text-gray-400 hover:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="shrink-0 mr-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              module.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {module.order}
          </div>
        </div>
        <input
          type="checkbox"
          checked={module.completed}
          onChange={() => onToggle(module.id!, module.completed)}
          className="mr-4 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-lg ${
              module.completed ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {module.name}
          </p>
          {module.completedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Completed on {formatDisplayDate(module.completedAt)}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(module.id!)}
        className="ml-4 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm font-medium transition-colors"
        title="Delete module"
      >
        Delete
      </button>
    </div>
  );
};

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CodingCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStartDate, setEditedStartDate] = useState('');
  const [editedTargetDate, setEditedTargetDate] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadCourse = useCallback(
    async (courseId: number) => {
      setIsLoading(true);
      const courseData = await db.codingCourses.get(courseId);
      if (!courseData) {
        navigate('/coding');
        return;
      }

      setCourse(courseData);

      const courseModules = await db.courseModules
        .where('courseId')
        .equals(courseId)
        .sortBy('order');

      setModules(courseModules);

      const completed = courseModules.filter((m) => m.completed).length;
      const prog = courseModules.length > 0 ? (completed / courseModules.length) * 100 : 0;
      setProgress(prog);

      setIsLoading(false);
    },
    [navigate]
  );

  useEffect(() => {
    if (id) {
      loadCourse(parseInt(id, 10));
    }
  }, [id, loadCourse]);

  const handleToggleModule = async (moduleId: number, completed: boolean) => {
    const now = new Date().toISOString();
    await db.courseModules.update(moduleId, {
      completed: !completed,
      completedAt: !completed ? now : undefined,
    });
    loadCourse(parseInt(id!, 10));
  };

  const handleAddModule = async () => {
    const name = prompt('Enter module name:');
    if (!name || !id) return;

    const courseModules = await db.courseModules
      .where('courseId')
      .equals(parseInt(id, 10))
      .toArray();

    const maxOrder = courseModules.length > 0 ? Math.max(...courseModules.map((m) => m.order)) : 0;

    const newModule: Omit<CourseModule, 'id'> = {
      courseId: parseInt(id, 10),
      name,
      order: maxOrder + 1,
      completed: false,
    };

    await db.courseModules.add(newModule);
    loadCourse(parseInt(id, 10));
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Delete this module?')) return;
    await db.courseModules.delete(moduleId);
    loadCourse(parseInt(id!, 10));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !id) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newModules = arrayMove(modules, oldIndex, newIndex);

    // Update order values in database
    const updates = newModules.map((module, index) => ({
      id: module.id!,
      order: index + 1,
    }));

    // Update all modules with new order values
    await Promise.all(
      updates.map((update) => db.courseModules.update(update.id, { order: update.order }))
    );

    // Update local state with new order (preserves scroll position)
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index + 1,
    }));
    setModules(updatedModules);
  };

  const handleSaveCourseName = async () => {
    if (!id || !editedName.trim()) return;
    await db.codingCourses.update(parseInt(id, 10), { name: editedName.trim() });
    setEditingName(false);
    loadCourse(parseInt(id, 10));
  };

  const handleSaveDescription = async () => {
    if (!id) return;
    await db.codingCourses.update(parseInt(id, 10), {
      description: editedDescription.trim() || undefined,
    });
    setEditingDescription(false);
    loadCourse(parseInt(id, 10));
  };

  const handleSaveDates = async () => {
    if (!id) return;
    await db.codingCourses.update(parseInt(id, 10), {
      startDate: editedStartDate || undefined,
      targetDate: editedTargetDate || undefined,
    });
    setEditingDates(false);
    loadCourse(parseInt(id, 10));
  };

  const handleEditName = () => {
    if (course) {
      setEditedName(course.name);
      setEditingName(true);
    }
  };

  const handleEditDescription = () => {
    if (course) {
      setEditedDescription(course.description || '');
      setEditingDescription(true);
    }
  };

  const handleEditDates = () => {
    if (course) {
      // Extract date part (YYYY-MM-DD) from date strings
      const startDate = course.startDate ? course.startDate.split('T')[0] : '';
      const targetDate = course.targetDate ? course.targetDate.split('T')[0] : '';
      setEditedStartDate(startDate);
      setEditedTargetDate(targetDate);
      setEditingDates(true);
    }
  };

  const handleCSVImport = async (data: Record<string, unknown>[]) => {
    if (!id) return;
    try {
      const courseModules = await db.courseModules
        .where('courseId')
        .equals(parseInt(id, 10))
        .toArray();

      const maxOrder =
        courseModules.length > 0 ? Math.max(...courseModules.map((m) => m.order)) : 0;

      const newModules: Omit<CourseModule, 'id'>[] = data.map(
        (row: Record<string, unknown>, index: number) => ({
          courseId: parseInt(id, 10),
          name: (row.name ||
            row.Name ||
            row.module ||
            row.Module ||
            `Module ${index + 1}`) as string,
          order: row.order ? parseInt(String(row.order), 10) : maxOrder + index + 1,
          completed: false,
        })
      );

      await db.courseModules.bulkAdd(newModules);
      loadCourse(parseInt(id, 10));
    } catch (error) {
      alert(
        'Failed to import modules: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const completedModules = modules.filter((m) => m.completed).length;
  const totalModules = modules.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/coding')}
          className="text-blue-500 hover:underline mb-4 text-sm font-medium"
        >
          ← Back to Courses
        </button>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3">
              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCourseName();
                      if (e.key === 'Escape') {
                        setEditingName(false);
                        setEditedName(course.name);
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveCourseName}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    aria-label="Save name"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setEditedName(course.name);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Cancel editing"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                  <button
                    onClick={handleEditName}
                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit course name"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {editingDescription ? (
              <div className="mt-2 flex items-start gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="text-gray-600 text-lg border-2 border-blue-500 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingDescription(false);
                      setEditedDescription(course.description || '');
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSaveDescription}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    aria-label="Save description"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setEditedDescription(course.description || '');
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Cancel editing"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-2 group">
                {course.description ? (
                  <p className="text-gray-600 text-lg">{course.description}</p>
                ) : (
                  <p className="text-gray-400 text-lg italic">No description</p>
                )}
                <button
                  onClick={handleEditDescription}
                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                  aria-label="Edit description"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <CsvImporter onImport={handleCSVImport} label="Import CSV" />
            <button
              onClick={handleAddModule}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Module
            </button>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalModules}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{completedModules}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">{Math.round(progress)}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </Card>
      </div>

      {/* Course Information */}
      <Card
        className="mb-6"
        title="Course Information"
        action={
          !editingDates ? (
            <button
              onClick={handleEditDates}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Edit dates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          ) : undefined
        }
      >
        {editingDates ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
                <input
                  type="date"
                  value={editedStartDate}
                  onChange={(e) => setEditedStartDate(e.target.value)}
                  className="w-full border-2 border-blue-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date:</label>
                <input
                  type="date"
                  value={editedTargetDate}
                  onChange={(e) => setEditedTargetDate(e.target.value)}
                  className="w-full border-2 border-blue-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveDates}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save
              </button>
              <button
                onClick={() => {
                  setEditingDates(false);
                  setEditedStartDate(course.startDate || '');
                  setEditedTargetDate(course.targetDate || '');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.startDate && (
              <div>
                <span className="text-sm font-medium text-gray-700">Start Date:</span>
                <p className="text-gray-900">{formatDisplayDate(course.startDate)}</p>
              </div>
            )}
            {course.targetDate && (
              <div>
                <span className="text-sm font-medium text-gray-700">Target Date:</span>
                <p className="text-gray-900">{formatDisplayDate(course.targetDate)}</p>
              </div>
            )}
            {!course.startDate && !course.targetDate && (
              <div className="col-span-2 text-gray-400 italic">
                No dates set. Click the edit icon to add dates.
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-700">Created:</span>
              <p className="text-gray-900">{formatDisplayDate(course.createdAt)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Progress Bar */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Overall Progress</h2>
          <ProgressBar progress={progress} color="career" showPercentage={true} />
          <p className="text-sm text-gray-600 mt-3">
            {completedModules} of {totalModules} modules completed
            {totalModules > 0 && (
              <span className="ml-2">({totalModules - completedModules} remaining)</span>
            )}
          </p>
        </div>
      </Card>

      {/* Course Contents */}
      <Card
        title={`Course Contents (${totalModules} ${totalModules === 1 ? 'Module' : 'Modules'})`}
      >
        {modules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-2 font-medium">No modules yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Add modules to start tracking your course progress
            </p>
            <button
              onClick={handleAddModule}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Your First Module
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {modules.map((module) => (
                  <SortableModuleItem
                    key={module.id}
                    module={module}
                    onToggle={handleToggleModule}
                    onDelete={handleDeleteModule}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
};
