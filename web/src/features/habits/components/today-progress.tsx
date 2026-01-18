import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circle-progress";
import { CheckIcon, GoalIcon } from "lucide-react";
import type { HabitWithContributions } from "../types";
import { format, getDayOfYear } from "date-fns";
import { cn, getCompletedHabits, getWeekDays } from "@/lib/utils";

export function TodaysProgress(props: { habits: HabitWithContributions[] }) {
  const today = new Date()
  const completedHabits = props.habits.reduce((prev, curr) => {
    const completionsToday = curr.contributions.find(x => getDayOfYear(x.date) === getDayOfYear(today))?.completions ?? 0
    return curr.completionsPerDay === completionsToday ? prev + 1 : prev
  }, 0)

  const progress = completedHabits / props.habits.length * 100
  const weekDays = getWeekDays()
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-6">
            <div className="size-10 flex items-center justify-center">
              <GoalIcon size={32} className="stroke-2" />
            </div>
            <div>
              <p className="text-sm">Today's Progress</p>
              <p className="font-semibold text-lg">{completedHabits} of {props.habits.length} habits completed</p>
            </div>
          </div>

          <CircularProgress progress={progress} size={75} strokeWidth={5} showPercentage />
        </div>

        <ul className="flex gap-1">
          {weekDays.map(day => {
            const { isDone } = getCompletedHabits({ day, habits: props.habits })

            return (
              <li key={day.getDay()} className="flex-1">
                <div className={cn("p-4 rounded-lg hover:bg-secondary flex flex-col items-center gap-1.5", {
                  "bg-secondary": getDayOfYear(day) === getDayOfYear(new Date())
                })}>
                  <p className="text-sm">{format(day, 'EEEEE')}</p>
                  <div className={cn("size-10 rounded-full bg-white border-2 flex items-center justify-center", {
                    "bg-green-600 text-white border-green-600": isDone
                  })}>
                    {isDone && (
                      <CheckIcon />
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
