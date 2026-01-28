import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circle-progress";
import type { HabitWithContributions } from "../types";
import { getDayOfYear } from "date-fns";

export function TodaysProgress(props: { habits: HabitWithContributions[] }) {
  const today = new Date()
  const completedHabits = props.habits.reduce((prev, curr) => {
    const completionsToday = curr.contributions.find(x => getDayOfYear(x.date) === getDayOfYear(today))?.completions ?? 0
    return curr.completionsPerDay === completionsToday ? prev + 1 : prev
  }, 0)

  const progress = completedHabits / props.habits.length * 100
  return (
    <Card className="bg-blue-100/50 border-blue-200">
      <CardContent className="flex justify-between items-center" >
        <div className="flex gap-6">
          <div className="">
            <p>Today's Progress</p>
            <p className="font-semibold text-lg">{completedHabits} of {props.habits.length} habits completed</p>
          </div>
        </div>

        <CircularProgress progress={progress} size={65} strokeWidth={5} showPercentage />
      </CardContent>
    </Card>
  )
}
