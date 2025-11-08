// Import Prisma-generated types
import type {
  User,
  Account,
  Session,
  CodingCourse as PrismaCodingCourse,
  CourseModule as PrismaCourseModule,
  Project as PrismaProject,
  Task as PrismaTask,
  FitnessLog as PrismaFitnessLog,
  Trade as PrismaTrade,
  Review as PrismaReview,
  Settings as PrismaSettings,
  TaskType as PrismaTaskType,
  ProjectStatus as PrismaProjectStatus,
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Account,
  Session,
  PrismaCodingCourse,
  PrismaCourseModule,
  PrismaProject,
  PrismaTask,
  PrismaFitnessLog,
  PrismaTrade,
  PrismaReview,
  PrismaSettings,
  PrismaTaskType,
  PrismaProjectStatus,
}

// Extended types with relations for frontend use
export type CodingCourse = PrismaCodingCourse & {
  modules?: CourseModule[]
}

export type CourseModule = PrismaCourseModule

export type Project = PrismaProject & {
  tasks?: Task[]
}

export type Task = PrismaTask & {
  project?: Project | null
}

export type FitnessLog = PrismaFitnessLog

export type Trade = PrismaTrade

export type Review = PrismaReview

export type Settings = PrismaSettings

// Type helpers for frontend
export type TaskType = PrismaTaskType
export type ProjectStatus = PrismaProjectStatus

// Additional utility types
export type ReviewMetrics = Record<string, string | number | boolean>
