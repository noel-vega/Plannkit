import { useState } from "react"
import { getDayOfYear } from "date-fns"
import { CheckIcon, LayoutListIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
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
  { bg: "bg-blue-500/10", text: "text-blue-600" },
  { bg: "bg-violet-500/10", text: "text-violet-600" },
  { bg: "bg-amber-500/10", text: "text-amber-600" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  { bg: "bg-rose-500/10", text: "text-rose-600" },
  { bg: "bg-cyan-500/10", text: "text-cyan-600" },
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

function getSubtitle(completed: number, total: number, t: (key: string) => string) {
  if (total === 0) return t("No habits yet")
  if (completed === 0) return `${total} ${t("habits")}`
  if (completed < total) return `${completed} ${t("of")} ${total} ${t("complete")}`
  return null
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
          "flex items-center h-13 px-5 hover:bg-secondary/30 transition-all duration-300",
          isDone && "opacity-60"
        )}>
          <div className="flex items-center gap-3 flex-1">
            <div className="size-8 rounded-md grid place-content-center shrink-0 bg-secondary/50">
              <DynamicIcon className="size-3.5" name={habit.icon} />
            </div>
            <span className={cn(
              "text-sm transition-all duration-300",
              isDone ? "text-muted-foreground" : "font-medium"
            )}>
              {habit.name}
            </span>
          </div>
          {habit.completionsPerDay === 1 ? (
            <button
              className={cn(
                "cursor-pointer size-9 rounded-full border-2 grid place-content-center shrink-0 transition-all duration-300",
                isDone
                  ? "bg-green-600 border-green-600"
                  : "border-border hover:border-green-400"
              )}
              onClick={handleContribution}
            >
              {isDone && <CheckIcon className="stroke-white" size={14} />}
            </button>
          ) : (
            <button
              className="cursor-pointer relative size-9 rounded-full grid place-content-center shrink-0"
              onClick={handleContribution}
            >
              {isDone ? (
                <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 stroke-green-600" size={14} />
              ) : (
                <PlusIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" size={14} />
              )}
              <CircularProgress
                progress={progress}
                size={36}
                strokeWidth={2.5}
                showPercentage={false}
                primaryColor="stroke-green-600"
              />
            </button>
          )}
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
  const subtitle = getSubtitle(completed, total, t)

  return (
    <Card className={cn(
      "p-0 gap-0 overflow-hidden transition-all duration-500"
    )}>
      <CardHeader
        className="px-5 py-3.5 gap-1 grid-rows-[auto] cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-9 rounded-md grid place-content-center shrink-0",
            colorScheme.bg
          )}>
            <LayoutListIcon className={cn("size-4", colorScheme.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold">{routine.name}</CardTitle>
            {subtitle && (
              <p className="text-xs mt-0.5 text-muted-foreground">
                {subtitle}
              </p>
            )}
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
                size={40}
                strokeWidth={3}
                showPercentage={false}
                primaryColor="stroke-green-600"
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                {completed}/{total}
              </span>
            </div>
          )}
          <button
            className="cursor-pointer size-9 rounded-full border-2 border-dashed border-border grid place-content-center shrink-0 text-muted-foreground hover:border-foreground/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              createHabitDialog.handleOpenDialog()
            }}
          >
            <PlusIcon size={14} />
          </button>
        </div>
      </CardHeader>

      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden min-h-0">
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border/50">
              {routine.habits.map(habit => (
                <RoutineHabitRowV2 key={habit.id} habit={habit} colorScheme={colorScheme} />
              ))}
            </ul>
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
        <ul className="space-y-4">
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
              <ul className="divide-y divide-border/50">
                {ungroupedHabits.map(habit => (
                  <RoutineHabitRowV2
                    key={habit.id}
                    habit={habit}
                    colorScheme={{ bg: "bg-secondary/50", text: "text-muted-foreground" }}
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
