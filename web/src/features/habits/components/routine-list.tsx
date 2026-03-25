import { useState } from "react"
import { getDayOfYear } from "date-fns"
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { HabitCard } from "./habit-card"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { CircularProgress } from "@/components/ui/circle-progress"
import { CustomContributionCompletionsDialog } from "./habit-card"
import { cn } from "@/lib/utils"
import { useDialog } from "@/hooks"
import { useCreateContribution, useUpdateContribution } from "../hooks"
import type { RoutineWithHabits, HabitWithContributions, Habit, Contribution } from "../types"
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

function RoutineHabitRow({ habit }: { habit: HabitWithContributions }) {
  const contributionsDialog = useDialog()
  const contributions = new Map<number, Contribution>(
    habit.contributions.map(c => [getDayOfYear(c.date), c])
  )
  const todayContrib = contributions.get(getDayOfYear(new Date()))
  const isDone = todayContrib?.completions === habit.completionsPerDay
  const progress = !todayContrib ? 0 : (todayContrib.completions / habit.completionsPerDay) * 100

  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()

  const handleContribution = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (habit.completionType === "custom") {
      contributionsDialog.onOpenChange(true)
      return
    }
    if (!todayContrib) {
      createContribution.mutate({ habitId: habit.id, date: new Date(), completions: 1 })
      return
    }
    const completions = isDone ? 0 : todayContrib.completions + 1
    updateContribution.mutate({ habitId: habit.id, contributionId: todayContrib.id, completions })
  }

  return (
    <li>
      <Link to="/habits/$id" params={{ id: habit.id }} className="block">
        <div className="flex items-center h-14 px-5">
          <div className="flex items-center gap-3 flex-1">
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
          <button
            className="cursor-pointer relative size-10 rounded-full grid place-content-center shrink-0"
            onClick={handleContribution}
          >
            {isDone ? (
              <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 stroke-green-600" size={16} />
            ) : (
              <PlusIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" size={16} />
            )}
            <CircularProgress progress={progress} size={40} strokeWidth={3} showPercentage={false} />
          </button>
        </div>
      </Link>
      <CustomContributionCompletionsDialog
        {...contributionsDialog}
        date={new Date()}
        habit={habit}
        contribution={todayContrib}
      />
    </li>
  )
}

function RoutineItem({ routine }: { routine: RoutineWithHabits }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader
        className="px-5 py-4 gap-3 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <ChevronDownIcon
            size={18}
            className={cn(
              "transition-transform shrink-0 text-muted-foreground",
              !open && "-rotate-90"
            )}
          />
          <CardTitle className="flex-1 text-base">{routine.name}</CardTitle>
          {allDone ? (
            <Badge className="bg-green-100 border border-green-500 text-green-800">
              {t("Complete")}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">{completed}/{total}</span>
          )}
        </div>
        <Progress className="h-1.5" value={progressPercent} />
      </CardHeader>

      {open && (
        <CardContent className="px-0 pb-0">
          <ul className="divide-y">
            {routine.habits.map(habit => (
              <RoutineHabitRow key={habit.id} habit={habit} />
            ))}
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
      )}
    </Card>
  )
}

export function RoutineList({ routines, ungroupedHabits }: {
  routines: RoutineWithHabits[]
  ungroupedHabits: HabitWithContributions[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {routines.map(routine => (
        <RoutineItem key={routine.id} routine={routine} />
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
