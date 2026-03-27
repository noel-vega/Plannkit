import { useState } from "react"
import { getDayOfYear } from "date-fns"
import { CheckIcon, ChevronDownIcon, LayoutListIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { CircularProgress } from "@/components/ui/circle-progress"
import { CustomContributionCompletionsDialog } from "./habit-card"
import { cn } from "@/lib/utils"
import { useDialog } from "@/hooks"
import { useCreateContribution, useUpdateContribution } from "../hooks"
import type { RoutineWithHabits, HabitWithContributions, Contribution } from "../types"
import { useTranslation } from "react-i18next"

const ROUTINE_COLORS = [
  { border: "border-l-blue-500", bg: "bg-blue-500/10", text: "text-blue-600", stroke: "stroke-blue-500" },
  { border: "border-l-violet-500", bg: "bg-violet-500/10", text: "text-violet-600", stroke: "stroke-violet-500" },
  { border: "border-l-amber-500", bg: "bg-amber-500/10", text: "text-amber-600", stroke: "stroke-amber-500" },
  { border: "border-l-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-600", stroke: "stroke-emerald-500" },
  { border: "border-l-rose-500", bg: "bg-rose-500/10", text: "text-rose-600", stroke: "stroke-rose-500" },
  { border: "border-l-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-600", stroke: "stroke-cyan-500" },
]

type ColorScheme = (typeof ROUTINE_COLORS)[number]

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

function getMicroCopy(completed: number, total: number, t: (key: string) => string) {
  if (total === 0) return t("Add habits to get started")
  if (completed === 0) return t("Ready to start")
  if (completed < total) return t("Keep it up") + ` — ${completed} / ${total}`
  return t("All done — nice work!")
}

function RoutineHabitRowV2({ habit, colorScheme }: { habit: HabitWithContributions; colorScheme: ColorScheme }) {
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
        <div className={cn(
          "flex items-center h-16 px-5 hover:bg-secondary/30 transition-all duration-300",
          isDone && "opacity-75"
        )}>
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "size-9 rounded-md grid place-content-center shrink-0 transition-colors duration-300",
              isDone ? "bg-green-100" : colorScheme.bg
            )}>
              <DynamicIcon className="size-4" name={habit.icon} />
            </div>
            <span className={cn(
              "text-sm font-medium transition-all duration-300",
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
            <CircularProgress
              progress={progress}
              size={40}
              strokeWidth={3}
              showPercentage={false}
              primaryColor={isDone ? "stroke-green-600" : colorScheme.stroke}
            />
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

function RoutineItemV2({ routine, colorScheme }: { routine: RoutineWithHabits; colorScheme: ColorScheme }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  return (
    <Card className={cn(
      "p-0 gap-0 overflow-hidden border-l-4 transition-all duration-500",
      colorScheme.border
    )}>
      <CardHeader
        className="px-5 py-4 gap-1 grid-rows-[auto] cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-9 rounded-md grid place-content-center shrink-0 transition-colors duration-300",
            colorScheme.bg
          )}>
            <LayoutListIcon className={cn("size-4", colorScheme.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">{routine.name}</CardTitle>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {getMicroCopy(completed, total, t)}
            </p>
          </div>
          {allDone ? (
            <Badge className="bg-green-100 border border-green-500 text-green-800 gap-1">
              <CheckIcon size={12} />
              {t("Complete")}
            </Badge>
          ) : (
            <div className="relative shrink-0 grid place-content-center">
              <CircularProgress
                progress={progressPercent}
                size={44}
                strokeWidth={4}
                showPercentage={false}
                primaryColor={colorScheme.stroke}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {completed}/{total}
              </span>
            </div>
          )}
          <ChevronDownIcon
            size={18}
            className={cn(
              "transition-transform shrink-0 text-muted-foreground",
              !open && "-rotate-90"
            )}
          />
        </div>
      </CardHeader>

      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden min-h-0">
          <CardContent className="px-0 pb-0">
            <ul className="divide-y">
              {routine.habits.map(habit => (
                <RoutineHabitRowV2 key={habit.id} habit={habit} colorScheme={colorScheme} />
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
        </div>
      </div>
    </Card>
  )
}

export function RoutineListV2({ routines, ungroupedHabits }: {
  routines: RoutineWithHabits[]
  ungroupedHabits: HabitWithContributions[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground px-1">{t("Routines")}</div>
        <ul className="space-y-6">
          {routines.map((routine, index) => (
            <RoutineItemV2
              key={routine.id}
              routine={routine}
              colorScheme={ROUTINE_COLORS[index % ROUTINE_COLORS.length]}
            />
          ))}
        </ul>
      </div>

      {ungroupedHabits.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground px-1">{t("Habits")}</div>
          <Card className="p-0 overflow-hidden">
            <CardContent className="px-0 py-0">
              <ul className="divide-y">
                {ungroupedHabits.map(habit => (
                  <RoutineHabitRowV2
                    key={habit.id}
                    habit={habit}
                    colorScheme={{ border: "", bg: "bg-secondary/50", text: "text-muted-foreground", stroke: "stroke-green-600" }}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
