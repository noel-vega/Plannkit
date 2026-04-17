import { Navigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { Goal } from "../types"
import { CreateGoalDialog } from "./create-goal-form"
import { ConfirmDeleteGoalDialog } from "./dialog-confirm-delete-goal"
import { type GoalAction, GoalCard } from "./goal-card"
import { UpdateGoalDialog } from "./update-goal-form"

export function ListGoals(props: { goals: Goal[], spaceId: number }) {
  const { t } = useTranslation()
  const [goalAction, setGoalAction] = useState<GoalAction>(null)
  return (
    <section className="space-y-3 pt-3">
      {props.goals.length === 0 ? (
        <CreateGoalDialog spaceId={props.spaceId}>
          <button
            className="flex flex-col items-center gap-2 py-20 w-full text-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-secondary/30 transition-all duration-200 cursor-pointer"
          >
            <p className="text-sm text-muted-foreground">{t("No goals yet")}</p>
            <span className="text-xs text-muted-foreground">{t("Create goal")}</span>
          </button>
        </CreateGoalDialog>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${props.goals.length > 1 ? "@5xl:grid-cols-2" : ""}`}>
          {props.goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onAction={setGoalAction} />
          ))}
        </div>
      )}

      {goalAction?.action === "details" && (
        <Navigate to={`/finances/$spaceId/goals/$goalId`} params={{ spaceId: props.spaceId, goalId: goalAction.goal.id }} />
      )}

      {goalAction?.action === "edit" && (
        <UpdateGoalDialog goal={goalAction.goal} open onOpenChange={() => setGoalAction(null)} />
      )}

      {goalAction?.action === "delete" && (
        <ConfirmDeleteGoalDialog
          open
          goal={goalAction.goal}
          onOpenChange={() => setGoalAction(null)}
        />
      )}
    </section>
  )
}
