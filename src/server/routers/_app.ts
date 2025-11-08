import { router } from '../trpc'
import { codingCoursesRouter } from './coding-courses'
import { courseModulesRouter } from './course-modules'
import { projectsRouter } from './projects'
import { tasksRouter } from './tasks'
import { fitnessRouter } from './fitness'
import { tradesRouter } from './trades'
import { reviewsRouter } from './reviews'
import { settingsRouter } from './settings'

export const appRouter = router({
  codingCourses: codingCoursesRouter,
  courseModules: courseModulesRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  fitness: fitnessRouter,
  trades: tradesRouter,
  reviews: reviewsRouter,
  settings: settingsRouter,
})

export type AppRouter = typeof appRouter
