import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Card, ProgressBar, CsvImporter } from '../components';
import { formatDisplayDate, formatDateTime } from '../utils/date';
import type { CodingCourse, CourseModule } from '../types';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CodingCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse(parseInt(id, 10));
    }
  }, [id]);

  const loadCourse = async (courseId: number) => {
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
  };

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

    const maxOrder = courseModules.length > 0
      ? Math.max(...courseModules.map((m) => m.order))
      : 0;

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

  const handleCSVImport = async (data: any[]) => {
    if (!id) return;
    try {
      const courseModules = await db.courseModules
        .where('courseId')
        .equals(parseInt(id, 10))
        .toArray();

      const maxOrder = courseModules.length > 0
        ? Math.max(...courseModules.map((m) => m.order))
        : 0;

      const newModules: Omit<CourseModule, 'id'>[] = data.map((row: any, index: number) => ({
        courseId: parseInt(id, 10),
        name: row.name || row.Name || row.module || row.Module || `Module ${index + 1}`,
        order: row.order ? parseInt(row.order, 10) : maxOrder + index + 1,
        completed: false,
      }));

      await db.courseModules.bulkAdd(newModules);
      loadCourse(parseInt(id, 10));
    } catch (error) {
      alert('Failed to import modules: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/coding')}
          className="text-career hover:underline mb-4 text-sm"
        >
          ← Back to Courses
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            {course.description && (
              <p className="mt-2 text-gray-600">{course.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <CsvImporter
              onImport={handleCSVImport}
              label="Import CSV"
            />
            <button
              onClick={handleAddModule}
              className="px-4 py-2 bg-career text-white rounded-md hover:bg-career-dark transition-colors"
            >
              Add Module
            </button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Progress</h2>
          <ProgressBar progress={progress} color="career" showPercentage={true} />
          <p className="text-sm text-gray-600 mt-2">
            {modules.filter((m) => m.completed).length} of {modules.length} modules completed
          </p>
        </div>
      </Card>

      <Card title="Modules">
        {modules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No modules yet. Add modules to get started!</p>
            <button
              onClick={handleAddModule}
              className="px-4 py-2 bg-career text-white rounded-md hover:bg-career-dark transition-colors"
            >
              Add Module
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {modules.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={module.completed}
                    onChange={() => handleToggleModule(module.id!, module.completed)}
                    className="mr-4 h-5 w-5 text-career focus:ring-career border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${module.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {module.name}
                    </p>
                    {module.completedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {formatDateTime(module.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteModule(module.id!)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
