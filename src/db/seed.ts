import type { CodingCourse, CourseModule } from '../types';
import { addDays, getToday } from '../utils/date';
import { db } from './index';

export const seedDatabase = async (forceReseed: boolean = false): Promise<void> => {
  const today = getToday();
  const transformationStartDate = '2025-11-10';
  const targetDate = addDays(transformationStartDate, 180);

  // Always update settings
  const startDateSetting = await db.settings.where('key').equals('transformationStartDate').first();
  const endDateSetting = await db.settings.where('key').equals('transformationEndDate').first();

  if (startDateSetting) {
    await db.settings.update(startDateSetting.id!, { value: transformationStartDate });
  } else {
    await db.settings.add({ key: 'transformationStartDate', value: transformationStartDate });
  }

  if (endDateSetting) {
    await db.settings.update(endDateSetting.id!, { value: targetDate });
  } else {
    await db.settings.add({ key: 'transformationEndDate', value: targetDate });
  }

  // Check if already seeded
  const existingCourses = await db.codingCourses.count();
  if (existingCourses > 0 && !forceReseed) {
    return; // Already seeded
  }

  // Seed App Academy courses
  const jsTrack: CodingCourse = {
    name: 'App Academy – JS Track',
    description:
      'Full-stack JavaScript curriculum covering React, Node.js, and modern web development',
    createdAt: today,
    startDate: transformationStartDate,
    targetDate,
  };

  const railsTrack: CodingCourse = {
    name: 'App Academy – Ruby on Rails Track',
    description:
      'Full-stack Ruby on Rails curriculum covering backend development and MVC architecture',
    createdAt: today,
    startDate: transformationStartDate,
    targetDate,
  };

  const jsTrackId = await db.codingCourses.add(jsTrack);
  const railsTrackId = await db.codingCourses.add(railsTrack);

  // Seed sample modules for JS Track
  const jsModules: Omit<CourseModule, 'id'>[] = [
    { courseId: jsTrackId, name: 'JavaScript Fundamentals', order: 1, completed: false },
    { courseId: jsTrackId, name: 'DOM Manipulation', order: 2, completed: false },
    { courseId: jsTrackId, name: 'Async JavaScript', order: 3, completed: false },
    { courseId: jsTrackId, name: 'React Basics', order: 4, completed: false },
    { courseId: jsTrackId, name: 'React Hooks', order: 5, completed: false },
    { courseId: jsTrackId, name: 'State Management', order: 6, completed: false },
    { courseId: jsTrackId, name: 'Node.js & Express', order: 7, completed: false },
    { courseId: jsTrackId, name: 'Database Integration', order: 8, completed: false },
    { courseId: jsTrackId, name: 'Authentication & Security', order: 9, completed: false },
    { courseId: jsTrackId, name: 'Deployment', order: 10, completed: false },
  ];

  // Seed sample modules for Rails Track
  const railsModules: Omit<CourseModule, 'id'>[] = [
    { courseId: railsTrackId, name: 'Ruby Fundamentals', order: 1, completed: false },
    { courseId: railsTrackId, name: 'Object-Oriented Ruby', order: 2, completed: false },
    { courseId: railsTrackId, name: 'Rails MVC', order: 3, completed: false },
    { courseId: railsTrackId, name: 'ActiveRecord', order: 4, completed: false },
    { courseId: railsTrackId, name: 'RESTful Routes', order: 5, completed: false },
    { courseId: railsTrackId, name: 'Authentication', order: 6, completed: false },
    { courseId: railsTrackId, name: 'Associations', order: 7, completed: false },
    { courseId: railsTrackId, name: 'Testing', order: 8, completed: false },
    { courseId: railsTrackId, name: 'Deployment', order: 9, completed: false },
  ];

  await db.courseModules.bulkAdd([...jsModules, ...railsModules]);
};
