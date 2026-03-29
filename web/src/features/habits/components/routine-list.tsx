import { useState } from "react"
import { getDayOfYear } from "date-fns"
import { CheckIcon, ChevronDownIcon, LayoutListIcon, MoreVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { CreateRoutineDialogDrawer } from "./create-routine-form"
import { CircularProgress } from "@/components/ui/circle-progress"
import { CustomContributionCompletionsDialog } from "./habit-card"
import { cn } from "@/lib/utils"
import { useDialog } from "@/hooks"
import { useCreateContribution, useUpdateContribution } from "../hooks"
import type { RoutineWithHabits, HabitWithContributions, Contribution, Routine } from "../types"
import { useTranslation } from "react-i18next"
import { ConfirmDeleteRoutineDialog } from "./dialog-confirm-delete-routine"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { EditRoutineDialog } from "./edit-routine-form"

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

function RoutineHabitRow({ habit }: { habit: HabitWithContributions; }) {
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
        <div className="flex items-center h-13 px-5 hover:bg-secondary/30 transition-all duration-300">
          <div className={cn(
            "flex items-center gap-3 flex-1",
            isDone && "opacity-60"
          )}>
            <div className="size-8 grid place-content-center shrink-0 text-muted-foreground">
              <DynamicIcon className="size-4" name={habit.icon} />
            </div>
            <span className={cn(
              "text-sm transition-all duration-300",
              isDone ? "text-muted-foreground line-through" : "font-medium"
            )}>
              {habit.name}
            </span>
          </div>
          {habit.completionsPerDay === 1 ? (
            <button
              className={cn(
                "cursor-pointer size-10 rounded-full border-2 grid place-content-center shrink-0 transition-all duration-300 group/check",
                isDone
                  ? "bg-green-600 border-green-600"
                  : "border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
              )}
              onClick={handleContribution}
            >
              <CheckIcon
                className={cn(
                  "transition-all duration-300",
                  isDone
                    ? "stroke-white opacity-100"
                    : "stroke-muted-foreground/50 group-hover/check:stroke-green-500 group-hover/check:opacity-80"
                )}
                size={18}
                strokeWidth={2.5}
              />
            </button>
          ) : (
            <button
              className="cursor-pointer relative size-10 rounded-full grid place-content-center shrink-0 transition-all duration-300"
              onClick={handleContribution}
            >
              {isDone ? (
                <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 stroke-green-600" size={18} />
              ) : (
                <PlusIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground/50 transition-colors duration-300" size={18} />
              )}
              <CircularProgress
                progress={progress}
                size={40}
                strokeWidth={2}
                showPercentage={false}
                primaryColor="stroke-green-600"
                secondaryColor="color-mix(in oklch, var(--muted-foreground) 30%, transparent)"
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

type RoutineItemProps = {
  routine: RoutineWithHabits;
  colorScheme: ColorScheme,
  onDelete: (routineId: number) => void
  onEdit: (routineId: number) => void
}

function RoutineItem({ routine, colorScheme, onDelete, onEdit }: RoutineItemProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0
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
          {allDone && (
            <Badge className="bg-green-100 border border-green-500 text-green-800 gap-1">
              <CheckIcon size={12} />
              {t("Complete")}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="size-8 grid place-content-center rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
                <MoreVerticalIcon className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={e => {
                e.stopPropagation()
                onEdit(routine.id)
              }}>
                <PencilIcon className="size-4" />
                {t("Edit")}
              </DropdownMenuItem>

              <DropdownMenuItem variant="destructive" onClick={(e) => {
                e.stopPropagation()
                onDelete(routine.id)
              }}>
                <TrashIcon className="size-4" />
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              !open && "-rotate-90"
            )}
          />
        </div>
      </CardHeader>

      <hr className="border-border/50" />

      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden min-h-0">
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border/50">
              {routine.habits.map(habit => (
                <RoutineHabitRow key={habit.id} habit={habit} />
              ))}
            </ul>
            <button
              className="flex items-center gap-3 w-full h-13 px-5 text-muted-foreground hover:bg-secondary/30 transition-all duration-300 cursor-pointer border-t border-border/50"
              onClick={() => createHabitDialog.handleOpenDialog()}
            >
              <div className="size-8 grid place-content-center shrink-0">
                <PlusIcon className="size-4" />
              </div>
              <span className="text-sm">{t("Add habit")}</span>
            </button>
            <CreateHabitDialogDrawer routineId={routine.id} {...createHabitDialog} />
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

type RoutineAction = { routine: Routine; action: "delete" | "edit" } | null

export function RoutineList({ routines }: { routines: RoutineWithHabits[] }) {
  const { t } = useTranslation()
  const createRoutineDialog = useDialog()
  const [routineAction, setRoutineAction] = useState<RoutineAction>(null)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-medium text-muted-foreground">{t("Routines")}</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={createRoutineDialog.handleOpenDialog}>
            <PlusIcon className="size-3.5" />
            <span>{t("Routine")}</span>
          </Button>
          <CreateRoutineDialogDrawer {...createRoutineDialog} />
        </div>
        {routines.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayoutListIcon />
              </EmptyMedia>
              <EmptyTitle>{t("No routines yet")}</EmptyTitle>
              <EmptyDescription>{t("Group your habits into routines to build a structured daily flow.")}</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" size="sm" onClick={createRoutineDialog.handleOpenDialog}>
              <PlusIcon className="size-3.5" />
              {t("Create routine")}
            </Button>
          </Empty>
        ) : (
          <ul className="space-y-4">
            {routines.map((routine, index) => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                colorScheme={ROUTINE_COLORS[index % ROUTINE_COLORS.length]}
                onDelete={() => {
                  setRoutineAction({ routine, action: "delete" })
                }}
                onEdit={() => {
                  setRoutineAction({ routine, action: "edit" })
                }}
              />
            ))}
          </ul>
        )}
      </div>
      {routineAction?.action === "delete" && (
        <ConfirmDeleteRoutineDialog
          routineId={routineAction.routine.id}
          open
          onOpenChange={() => setRoutineAction(null)}
        />
      )}

      {routineAction?.action === "edit" && (
        <EditRoutineDialog
          routine={routineAction.routine}
          open
          onOpenChange={() => setRoutineAction(null)}
        />
      )}
    </>
  )
}

export function HabitsList({ habits }: { habits: HabitWithContributions[] }) {
  const { t } = useTranslation()
  const createHabitDialog = useDialog()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium text-muted-foreground">{t("Habits")}</div>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon className="size-3.5" />
          <span>{t("Habit")}</span>
        </Button>
        <CreateHabitDialogDrawer {...createHabitDialog} />
      </div>
      {habits.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckIcon />
            </EmptyMedia>
            <EmptyTitle>{t("No habits yet")}</EmptyTitle>
            <EmptyDescription>{t("Start tracking a habit to build consistency over time.")}</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" onClick={createHabitDialog.handleOpenDialog}>
            <PlusIcon className="size-3.5" />
            {t("Create habit")}
          </Button>
        </Empty>
      ) : (
        <Card className="p-0 overflow-hidden">
          <CardContent className="px-0 py-1.75">
            <ul className="divide-y divide-border/50">
              {habits.map(habit => (
                <RoutineHabitRow
                  key={habit.id}
                  habit={habit}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
