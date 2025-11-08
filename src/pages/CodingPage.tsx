import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Card, ProgressBar, CsvImporter } from '../components';
import { formatDisplayDate } from '../utils/date';
import type { CodingCourse, CourseModule } from '../types';

export const CodingPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<(CodingCourse & { progress: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    const allCourses = await db.codingCourses.toArray();
    const allModules = await db.courseModules.toArray();

    const coursesWithProgress = allCourses.map((course) => {
      const courseModules = allModules.filter((m) => m.courseId === course.id);
      const completed = courseModules.filter((m) => m.completed).length;
      const progress = courseModules.length > 0 ? (completed / courseModules.length) * 100 : 0;
      return { ...course, progress };
    });

    setCourses(coursesWithProgress);
    setIsLoading(false);
  };

  const handleAddCourse = async () => {
    const name = prompt('Enter course name:');
    if (!name) return;

    const newCourse: Omit<CodingCourse, 'id'> = {
      name,
      description: '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    await db.codingCourses.add(newCourse);
    loadCourses();
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Delete this course? All modules will also be deleted.')) return;

    await db.courseModules.where('courseId').equals(id).delete();
    await db.codingCourses.delete(id);
    loadCourses();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coding Courses</h1>
          <p className="mt-2 text-gray-600">Track your learning progress</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddCourse}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Course
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No courses yet. Add your first course to get started!</p>
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Course
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-all cursor-pointer group relative"
              onClick={() => navigate(`/coding/${course.id}`)}
            >
              <div className="mb-4 relative z-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
                    {course.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id!);
                    }}
                    className="text-red-600 hover:text-red-700 relative z-20 p-1.5 hover:bg-red-100 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer"
                    aria-label={`Delete ${course.name}`}
                    title="Delete course"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {course.description && (
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                )}
                {course.startDate && (
                  <p className="text-xs text-gray-500">
                    Started: {formatDisplayDate(course.startDate)}
                  </p>
                )}
              </div>
              <ProgressBar progress={course.progress} color="career" showPercentage={true} />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-blue-500 font-medium group-hover:underline">
                  View Details →
                </span>
                <span className="text-xs text-gray-500">{Math.round(course.progress)}%</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
