import { useState } from "react"
import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { getDayOfYear } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HabitCard } from "./habit-card"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { cn } from "@/lib/utils"
import { useDialog } from "@/hooks"
import type { RoutineWithHabits, HabitWithContributions } from "../types"
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

function RoutineCollapsibleItem({ routine }: { routine: RoutineWithHabits }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer w-full flex items-center gap-3 py-3 px-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <ChevronDownIcon
          size={18}
          className={cn(
            "transition-transform shrink-0",
            !open && "-rotate-90"
          )}
        />
        <span className="font-semibold text-base flex-1 text-left">{routine.name}</span>
        <Badge
          className={cn(
            allDone
              ? "bg-green-100 border border-green-500 text-green-800"
              : "bg-secondary border text-muted-foreground"
          )}
        >
          {completed}/{total} {t("Complete")}
        </Badge>
      </button>

      {open && (
        <div className="mt-4 ml-2 pl-4 border-l-2 border-border space-y-4">
          <ul className="space-y-4">
            {routine.habits.map(habit => (
              <li key={habit.id}>
                <Link to="/habits/$id" params={{ id: habit.id }}>
                  <HabitCard habit={habit} />
                </Link>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            className="w-full border border-dashed text-muted-foreground"
            onClick={createHabitDialog.handleOpenDialog}
          >
            <PlusIcon size={16} />
            <span>{t("Add Habit")}</span>
          </Button>
          <CreateHabitDialogDrawer routineId={routine.id} {...createHabitDialog} />
        </div>
      )}
    </div>
  )
}

export function RoutineCollapsibleDesign({ routines, ungroupedHabits }: {
  routines: RoutineWithHabits[]
  ungroupedHabits: HabitWithContributions[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {routines.map(routine => (
        <RoutineCollapsibleItem key={routine.id} routine={routine} />
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
