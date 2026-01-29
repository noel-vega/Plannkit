import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDayOfYear, addDays } from 'date-fns';
import type { HabitWithContributions } from "@/features/habits/types";
import { useAuth } from "@/features/auth/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysAround(date: Date = new Date(), range: number) {
  const days: Date[] = [];

  for (let i = -range; i <= range; i++) {
    days.push(addDays(date, i))
  }
  return days
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


export function getHeaders() {
  const { accessToken } = useAuth.getState()
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  }
}
