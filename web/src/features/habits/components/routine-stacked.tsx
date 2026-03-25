import { useState } from "react"
import { getDayOfYear } from "date-fns"
import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circle-progress"
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

function RoutineStackedItem({ routine }: { routine: RoutineWithHabits }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const createHabitDialog = useDialog()
  const { completed, total } = getRoutineProgress(routine.habits)
  const allDone = completed === total && total > 0
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  // Number of "peek" cards to show behind the header
  const peekCount = Math.min(routine.habits.length - 1, 2)

  return (
    <div className="relative">
      {/* Stacked peek cards behind the header */}
      {!expanded && Array.from({ length: peekCount }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-x-0 rounded-xl border bg-card shadow-sm"
          style={{
            top: `${(i + 1) * 6}px`,
            left: `${(i + 1) * 4}px`,
            right: `${(i + 1) * 4}px`,
            height: "100%",
            zIndex: peekCount - i,
            opacity: 1 - (i + 1) * 0.15,
          }}
        />
      ))}

      {/* Header card */}
      <Card
        className={cn(
          "p-0 relative cursor-pointer transition-shadow hover:shadow-md",
          !expanded && "z-10"
        )}
        style={!expanded ? { marginBottom: `${peekCount * 6}px` } : undefined}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4 p-4">
          <CircularProgress
            progress={progressPercent}
            size={48}
            strokeWidth={4}
            showPercentage={false}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{routine.name}</p>
            <p className="text-sm text-muted-foreground">
              {completed}/{total} {t("habits complete")}
            </p>
          </div>
          {allDone && (
            <Badge className="bg-green-100 border border-green-500 text-green-800">
              {t("Complete")}
            </Badge>
          )}
          <ChevronDownIcon
            size={20}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </Card>

      {/* Expanded habit list */}
      {expanded && (
        <div className="mt-3 space-y-4 relative">
          <div className="absolute top-0 bottom-0 left-6 w-px bg-border" />
          <ul className="space-y-4 pl-4">
            {routine.habits.map(habit => (
              <li key={habit.id}>
                <Link to="/habits/$id" params={{ id: habit.id }}>
                  <HabitCard habit={habit} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="pl-4">
            <Button
              variant="ghost"
              className="w-full border border-dashed text-muted-foreground"
              onClick={createHabitDialog.handleOpenDialog}
            >
              <PlusIcon size={16} />
              <span>{t("Add Habit")}</span>
            </Button>
          </div>
          <CreateHabitDialogDrawer routineId={routine.id} {...createHabitDialog} />
        </div>
      )}
    </div>
  )
}

export function RoutineStackedDesign({ routines, ungroupedHabits }: {
  routines: RoutineWithHabits[]
  ungroupedHabits: HabitWithContributions[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {routines.map(routine => (
        <RoutineStackedItem key={routine.id} routine={routine} />
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
