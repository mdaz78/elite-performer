import { db } from './index';
import type { CodingCourse, CourseModule, SWETopic, Settings } from '../types';
import { getToday, addDays } from '../utils/date';

export const seedDatabase = async (): Promise<void> => {
  // Check if already seeded
  const existingCourses = await db.codingCourses.count();
  if (existingCourses > 0) {
    return; // Already seeded
  }

  const today = getToday();
  const targetDate = addDays(today, 180);

  // Seed App Academy courses
  const jsTrack: CodingCourse = {
    name: 'App Academy – JS Track',
    description: 'Full-stack JavaScript curriculum covering React, Node.js, and modern web development',
    createdAt: today,
    startDate: today,
    targetDate,
  };

  const railsTrack: CodingCourse = {
    name: 'App Academy – Ruby on Rails Track',
    description: 'Full-stack Ruby on Rails curriculum covering backend development and MVC architecture',
    createdAt: today,
    startDate: today,
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

  // Seed SWE Curriculum
  const sweTopics: Omit<SWETopic, 'id'>[] = [
    // Data Structures
    { category: 'Data Structures', topic: 'Arrays & Strings', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Linked Lists', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Stacks & Queues', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Trees & Binary Trees', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Binary Search Trees', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Heaps', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Hash Tables', practiceCount: 0 },
    { category: 'Data Structures', topic: 'Graphs', practiceCount: 0 },

    // Algorithms
    { category: 'Algorithms', topic: 'Sorting Algorithms', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Search Algorithms', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Recursion', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Dynamic Programming', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Greedy Algorithms', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Backtracking', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Two Pointers', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Sliding Window', practiceCount: 0 },
    { category: 'Algorithms', topic: 'Bit Manipulation', practiceCount: 0 },

    // System Design
    { category: 'System Design', topic: 'Scalability Basics', practiceCount: 0 },
    { category: 'System Design', topic: 'Load Balancing', practiceCount: 0 },
    { category: 'System Design', topic: 'Caching Strategies', practiceCount: 0 },
    { category: 'System Design', topic: 'Database Design', practiceCount: 0 },
    { category: 'System Design', topic: 'API Design', practiceCount: 0 },
    { category: 'System Design', topic: 'Microservices', practiceCount: 0 },
    { category: 'System Design', topic: 'Distributed Systems', practiceCount: 0 },
    { category: 'System Design', topic: 'Message Queues', practiceCount: 0 },

    // Behavioral
    { category: 'Behavioral', topic: 'STAR Method', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Leadership Examples', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Conflict Resolution', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Technical Challenges', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Team Collaboration', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Failure & Learning', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Career Goals', practiceCount: 0 },
    { category: 'Behavioral', topic: 'Company Research', practiceCount: 0 },
  ];

  await db.sweCurriculum.bulkAdd(sweTopics);

  // Seed default settings
  const defaultSettings: Omit<Settings, 'id'>[] = [
    { key: 'transformationStartDate', value: today },
    { key: 'transformationEndDate', value: targetDate },
  ];

  await db.settings.bulkAdd(defaultSettings);
};
