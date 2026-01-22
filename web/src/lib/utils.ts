import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfWeek, endOfWeek, eachDayOfInterval, getDayOfYear } from 'date-fns';
import type { HabitWithContributions } from "@/features/habits/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekDays() {
  const today = new Date();

  const weekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 1 }), // 1 = Monday
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });
  return weekDays
}


export function getCompletedHabits(params: { day: Date, habits: HabitWithContributions[] }) {
  if (params.habits.length === 0) {
    return { completed: 0, isDone: false, progress: 0 }
  }
  const completed = params.habits.reduce((prev, curr) => {
    const completionsToday = curr.contributions.find(x => getDayOfYear(x.date) === getDayOfYear(params.day))?.completions ?? 0
    return curr.completionsPerDay === completionsToday ? prev + 1 : prev
  }, 0)
  return { completed, isDone: completed === params.habits.length, progress: completed / params.habits.length * 100 }
}
