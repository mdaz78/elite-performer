export interface CodingCourse {
  id?: number;
  name: string;
  description?: string;
  createdAt: string;
  startDate?: string;
  targetDate?: string;
}

export interface CourseModule {
  id?: number;
  courseId: number;
  name: string;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  startDate?: string;
  targetDate?: string;
  linkedTasks?: number[];
}

export type TaskType =
  | 'Deep Work'
  | 'Gym'
  | 'Trading Practice'
  | 'Coding'
  | 'Review'
  | 'Other';

export interface Task {
  id?: number;
  title: string;
  type: TaskType;
  projectId?: number;
  completed: boolean;
  scheduledDate: string;
  completedAt?: string;
}

export interface FitnessLog {
  id?: number;
  date: string;
  weight?: number;
  bodyFat?: number;
  waist?: number;
  calories?: number;
  workoutType?: string;
  notes?: string;
}

export interface Trade {
  id?: number;
  date: string;
  symbol: string;
  setup: string;
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  emotion?: string;
  notes?: string;
}

export interface Review {
  id?: number;
  weekStartDate: string;
  wins: string;
  mistakes: string;
  nextWeekGoals: string;
  metrics?: Record<string, any>;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
}
