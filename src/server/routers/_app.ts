import { router } from '../trpc'
import { codingCoursesRouter } from './coding-courses'
import { courseModulesRouter } from './course-modules'
import { tradingCoursesRouter } from './trading-courses'
import { tradingCourseModulesRouter } from './trading-course-modules'
import { projectsRouter } from './projects'
import { tasksRouter } from './tasks'
import { fitnessRouter } from './fitness'
import { tradesRouter } from './trades'
import { reviewsRouter } from './reviews'
import { settingsRouter } from './settings'
import { habitsRouter } from './habits'

export const appRouter = router({
  codingCourses: codingCoursesRouter,
  courseModules: courseModulesRouter,
  tradingCourses: tradingCoursesRouter,
  tradingCourseModules: tradingCourseModulesRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  fitness: fitnessRouter,
  trades: tradesRouter,
  reviews: reviewsRouter,
  settings: settingsRouter,
  habits: habitsRouter,
})

export type AppRouter = typeof appRouter
