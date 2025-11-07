import Dexie from 'dexie';
import type {
  CodingCourse,
  CourseModule,
  SWETopic,
  Project,
  Task,
  FitnessLog,
  Trade,
  Review,
  Settings,
} from '../types';

export class ElitePerformerDB extends Dexie {
  codingCourses!: Dexie.Table<CodingCourse, number>;
  courseModules!: Dexie.Table<CourseModule, number>;
  sweCurriculum!: Dexie.Table<SWETopic, number>;
  projects!: Dexie.Table<Project, number>;
  tasks!: Dexie.Table<Task, number>;
  fitnessLogs!: Dexie.Table<FitnessLog, number>;
  trades!: Dexie.Table<Trade, number>;
  reviews!: Dexie.Table<Review, number>;
  settings!: Dexie.Table<Settings, number>;

  constructor() {
    super('ElitePerformerDB');
    this.version(1).stores({
      codingCourses: '++id, name, createdAt, startDate, targetDate',
      courseModules: '++id, courseId, order, completed',
      sweCurriculum: '++id, category, lastReviewed',
      projects: '++id, status, startDate, targetDate',
      tasks: '++id, type, projectId, completed, scheduledDate',
      fitnessLogs: '++id, date',
      trades: '++id, date, symbol',
      reviews: '++id, weekStartDate',
      settings: '++id, key',
    });
  }
}

export const db = new ElitePerformerDB();
