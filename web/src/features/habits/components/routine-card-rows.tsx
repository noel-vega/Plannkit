import { getDayOfYear } from "date-fns"
import { PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { HabitCard, HabitContributionButton } from "./habit-card"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { cn } from "@/lib/utils"
import { useDialog } from "@/hooks"
import type { RoutineWithHabits, HabitWithContributions, Contribution } from "../types"
import { useTranslation } from "react-i18next"

function getRoutineProgress(habits: HabitWithContributions[]) {
  const today = getDayOfYear(new Date())
  let completed = 0
  for (const habit of habits) {
    const todayContrib = habit.contributions.find(c => getDayOfYear(c.date) === today)
    if (todayContrib && todayContrib.completions >= habit.completionsPerDay) {
      completed++
    }
  }
  return { completed, total: habits.length }
}

function RoutineCardItem({ routine }: { routine: RoutineWithHabits }) {
  const { t } = useTranslation()
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="px-5 py-4 gap-3">
        <div className="flex items-center gap-3">
          <CardTitle className="flex-1 text-base">{routine.name}</CardTitle>
          {allDone && (
            <Badge className="bg-green-100 border border-green-500 text-green-800">
              {t("Complete")}
            </Badge>
          )}
          {!allDone && (
            <span className="text-sm text-muted-foreground">{completed}/{total}</span>
          )}
        </div>
        <Progress className="h-1.5" value={progressPercent} />
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y">
          {routine.habits.map(habit => {
            const contributions = new Map<number, Contribution>(
              habit.contributions.map(c => [getDayOfYear(c.date), c])
            )
            const todayContrib = contributions.get(getDayOfYear(new Date()))
            const isDone = todayContrib?.completions === habit.completionsPerDay

            return (
              <li key={habit.id}>
                <Link to="/habits/$id" params={{ id: habit.id }} className="block">
                  <div className="flex items-center h-16">
                    <div className="flex items-center gap-3 flex-1 px-5">
                      <div className={cn(
                        "size-9 rounded-md grid place-content-center shrink-0",
                        isDone ? "bg-green-100" : "bg-secondary/50"
                      )}>
                        <DynamicIcon className="size-4" name={habit.icon} />
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        isDone && "text-muted-foreground line-through"
                      )}>
                        {habit.name}
                      </span>
                    </div>
                    <HabitContributionButton habit={habit} contributions={contributions} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="border-t px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={createHabitDialog.handleOpenDialog}
          >
            <PlusIcon size={16} />
            <span>{t("Add Habit")}</span>
          </Button>
        </div>
        <CreateHabitDialogDrawer routineId={routine.id} {...createHabitDialog} />
      </CardContent>
    </Card>
  )
}

export function RoutineCardRowsDesign({ routines, ungroupedHabits }: {
  routines: RoutineWithHabits[]
  ungroupedHabits: HabitWithContributions[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {routines.map(routine => (
        <RoutineCardItem key={routine.id} routine={routine} />
      ))}

      {ungroupedHabits.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground px-1">{t("Other Habits")}</div>
          <ul className="space-y-4">
            {ungroupedHabits.map(habit => (
              <li key={habit.id}>
                <Link to="/habits/$id" params={{ id: habit.id }}>
                  <HabitCard habit={habit} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
