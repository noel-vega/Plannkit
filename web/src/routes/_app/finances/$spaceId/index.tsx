import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ExpensesTable } from '@/features/finances/components/expenses-table'
import { MarginStatusBanner } from '@/features/finances/components/margin-status-banner'
import { MonthlyExpensesCard } from '@/features/finances/components/monthly-expenses-card'
import { MonthlyGoalCommitmentsCard } from '@/features/finances/components/monthly-goal-commitment-card'
import { MonthlyIncomeCard } from '@/features/finances/components/monthly-income-card'
import { CreateExpenseDialog } from '@/features/finances/components/create-expense-form'
import { FinanceSpaceSwitcher } from '@/features/finances/components/finance-space-switcher'
import { getUseListExpensesOptions, getUseListGoalsOptions, getUseListIncomeSourcesOptions, useCurrentSpace, useListExpenses, useListGoals, useListSpacesQuery } from '@/features/finances/hooks'
import type { Expense, FinanceSpace, Goal } from '@/features/finances/types'
import { GoalCard, type GoalAction } from '@/features/finances/components/goal-card'
import { ConfirmDeleteGoalDialog } from '@/features/finances/components/dialog-confirm-delete-goal'
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import z from 'zod/v3'
import { queryClient } from '@/lib/react-query'
import { CreateGoalDialog } from '@/features/finances/components/create-goal-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditGoalDialog } from '@/features/finances/components/edit-goal-dialog'

export const Route = createFileRoute('/_app/finances/$spaceId/')({
  beforeLoad: async ({ params }) => {
    localStorage.setItem("last_visited_finance_space_id", params.spaceId.toString())
    const [expenses, goals, incomeSources] = await Promise.all([
      queryClient.ensureQueryData(getUseListExpensesOptions(params)),
      queryClient.ensureQueryData(getUseListGoalsOptions(params)),
      queryClient.ensureQueryData(getUseListIncomeSourcesOptions(params))
    ])
    return { expenses, goals, incomeSources }
  },
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { spaceId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rtCtx = Route.useRouteContext()
  const expenses = useListExpenses({ spaceId, initialData: rtCtx.expenses })
  const goals = useListGoals({ spaceId, initialData: rtCtx.goals })
  const spaces = useListSpacesQuery({ initialData: rtCtx.spaces })
  const currentSpace = useCurrentSpace({ spaceId })
  const [activeTab, setActiveTab] = useState("goals")

  const handleSwitchSpace = (space: FinanceSpace) => {
    navigate({ to: "/finances/$spaceId", params: { spaceId: space.id } })
  }
  const handleCreate = (space: FinanceSpace) => {
    navigate({ to: "/finances/$spaceId", params: { spaceId: space.id } })
  }
  const handleSettings = (space: FinanceSpace) => {
    navigate({ to: "/finances/$spaceId/settings", params: { spaceId: space.id } })
  }


  return (
    <Container>
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-4">
          <FinanceSpaceSwitcher
            currentSpace={currentSpace.data}
            spaces={spaces.data}
            onSpaceSelect={handleSwitchSpace}
            onCreate={handleCreate}
            onSettings={handleSettings}
          />
        </div>
        <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-3.5">
          <MonthlyIncomeCard spaceId={spaceId} incomeSources={rtCtx.incomeSources} />
          <MonthlyExpensesCard expenses={expenses.data ?? []} />
          <MonthlyGoalCommitmentsCard goals={goals.data ?? []} />
        </div>
        <MarginStatusBanner spaceId={spaceId} />
      </div>

      <Tabs defaultValue="goals" className="gap-0" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger className="min-w-32" value="goals">{t("Goals")}</TabsTrigger>
            <TabsTrigger className='min-w-32' value="expenses">{t("Expenses")}</TabsTrigger>
          </TabsList>
          {activeTab === "goals" ? (
            <CreateGoalDialog spaceId={spaceId}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                <PlusIcon className="size-3.5" />
                <span>{t("Goal")}</span>
              </Button>
            </CreateGoalDialog>
          ) : (
            <CreateExpenseDialog spaceId={spaceId}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                <PlusIcon className="size-3.5" />
                <span>{t("Expense")}</span>
              </Button>
            </CreateExpenseDialog>
          )}
        </div>
        <TabsContent value="goals">
          <Goals spaceId={spaceId} goals={goals.data ?? []} />
        </TabsContent>
        <TabsContent value="expenses">
          <Expenses spaceId={spaceId} expenses={expenses.data ?? []} />
        </TabsContent>
      </Tabs>
    </Container>
  )
}


function Goals(props: { goals: Goal[], spaceId: number }) {
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
        <EditGoalDialog goal={goalAction.goal} open onOpenChange={() => setGoalAction(null)} />
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


function Expenses(props: { expenses: Expense[], spaceId: number }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-3 pt-3">
      {props.expenses.length === 0 ? (
        <CreateExpenseDialog spaceId={props.spaceId}>
          <button
            className="flex flex-col items-center gap-2 py-20 w-full text-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-secondary/30 transition-all duration-200 cursor-pointer"
          >
            <p className="text-sm text-muted-foreground">{t("No expenses yet")}</p>
            <span className="text-xs text-muted-foreground">{t("Create expense")}</span>
          </button>
        </CreateExpenseDialog>
      ) : (
        <ExpensesTable spaceId={props.spaceId} expenses={props.expenses} />
      )}
    </section>
  )
}
