import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatDisplayDate = (date: string | Date): string => {
  return dayjs(date).format('MMM D, YYYY');
};

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getWeekStart = (date?: string | Date): string => {
  return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
};

export const getWeekEnd = (date?: string | Date): string => {
  return dayjs(date).endOf('isoWeek').format('YYYY-MM-DD');
};

export const getDaysRemaining = (targetDate: string, startDate?: string): number => {
  const target = dayjs(targetDate);
  const start = startDate ? dayjs(startDate) : dayjs();
  return Math.max(0, target.diff(start, 'day'));
};

export const getDaysElapsed = (startDate: string): number => {
  return dayjs().diff(dayjs(startDate), 'day');
};

export const getDaysInPeriod = (startDate: string, endDate: string): number => {
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
};

export const getProgressPercentage = (
  startDate: string,
  endDate: string,
  currentDate?: string
): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const current = currentDate ? dayjs(currentDate) : dayjs();
  const total = end.diff(start, 'day');
  const elapsed = current.diff(start, 'day');
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export const addDays = (date: string, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
};

export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

export const isBefore = (date1: string | Date, date2: string | Date): boolean => {
  return dayjs(date1).isBefore(dayjs(date2), 'day');
};

export const isAfter = (date1: string | Date, date2: string | Date): boolean => {
  return dayjs(date1).isAfter(dayjs(date2), 'day');
};

export const getDaysInRange = (startDate: string, endDate: string): string[] => {
  const days: string[] = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);
  while (current.isSameOrBefore(end)) {
    days.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }
  return days;
};
