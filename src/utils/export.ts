import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { db } from '../db';
import type {
  CodingCourse,
  CourseModule,
  Trade,
  FitnessLog,
} from '../types';

export const exportDatabaseAsJSON = async (): Promise<void> => {
  const data = {
    codingCourses: await db.codingCourses.toArray(),
    courseModules: await db.courseModules.toArray(),
    sweCurriculum: await db.sweCurriculum.toArray(),
    projects: await db.projects.toArray(),
    tasks: await db.tasks.toArray(),
    fitnessLogs: await db.fitnessLogs.toArray(),
    trades: await db.trades.toArray(),
    reviews: await db.reviews.toArray(),
    settings: await db.settings.toArray(),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `elite-performer-backup-${new Date().toISOString().split('T')[0]}.json`);
};

export const importDatabaseFromJSON = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Clear existing data
        await db.codingCourses.clear();
        await db.courseModules.clear();
        await db.sweCurriculum.clear();
        await db.projects.clear();
        await db.tasks.clear();
        await db.fitnessLogs.clear();
        await db.trades.clear();
        await db.reviews.clear();
        await db.settings.clear();

        // Import data
        if (data.codingCourses) await db.codingCourses.bulkAdd(data.codingCourses);
        if (data.courseModules) await db.courseModules.bulkAdd(data.courseModules);
        if (data.sweCurriculum) await db.sweCurriculum.bulkAdd(data.sweCurriculum);
        if (data.projects) await db.projects.bulkAdd(data.projects);
        if (data.tasks) await db.tasks.bulkAdd(data.tasks);
        if (data.fitnessLogs) await db.fitnessLogs.bulkAdd(data.fitnessLogs);
        if (data.trades) await db.trades.bulkAdd(data.trades);
        if (data.reviews) await db.reviews.bulkAdd(data.reviews);
        if (data.settings) await db.settings.bulkAdd(data.settings);

        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const exportCoursesAsCSV = async (): Promise<void> => {
  const courses = await db.codingCourses.toArray();
  const modules = await db.courseModules.toArray();

  const csvData = courses.map((course) => {
    const courseModules = modules
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.order - b.order);

    return {
      'Course Name': course.name,
      'Description': course.description || '',
      'Start Date': course.startDate || '',
      'Target Date': course.targetDate || '',
      'Modules': courseModules.map((m) => m.name).join('; '),
      'Completed Modules': courseModules.filter((m) => m.completed).length,
      'Total Modules': courseModules.length,
    };
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `courses-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportTradesAsCSV = async (): Promise<void> => {
  const trades = await db.trades.toArray();

  const csvData = trades.map((trade) => ({
    Date: trade.date,
    Symbol: trade.symbol,
    Setup: trade.setup,
    Entry: trade.entry,
    Exit: trade.exit,
    Quantity: trade.quantity,
    'P&L': trade.pnl,
    Emotion: trade.emotion || '',
    Notes: trade.notes || '',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `trades-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportFitnessLogsAsCSV = async (): Promise<void> => {
  const logs = await db.fitnessLogs.toArray();

  const csvData = logs.map((log) => ({
    Date: log.date,
    Weight: log.weight || '',
    'Body Fat %': log.bodyFat || '',
    Waist: log.waist || '',
    Calories: log.calories || '',
    'Workout Type': log.workoutType || '',
    Notes: log.notes || '',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `fitness-logs-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const importModulesFromCSV = async (
  file: File,
  courseId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const existingModules = await db.courseModules
            .where('courseId')
            .equals(courseId)
            .toArray();

          const maxOrder = existingModules.length > 0
            ? Math.max(...existingModules.map((m) => m.order))
            : 0;

          const modules: Omit<CourseModule, 'id'>[] = results.data.map(
            (row: any, index: number) => ({
              courseId,
              name: row.name || row.Name || row.module || row.Module || `Module ${index + 1}`,
              order: row.order ? parseInt(row.order, 10) : maxOrder + index + 1,
              completed: false,
            })
          );

          await db.courseModules.bulkAdd(modules);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
};
