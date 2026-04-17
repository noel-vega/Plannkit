import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { MarginStatusBanner } from '@/features/finances/components/margin-status-banner'
import { MonthlyExpensesCard } from '@/features/finances/components/monthly-expenses-card'
import { MonthlyGoalCommitmentsCard } from '@/features/finances/components/monthly-goal-commitment-card'
import { MonthlyIncomeCard } from '@/features/finances/components/monthly-income-card'
import { CreateExpenseDialog } from '@/features/finances/components/create-expense-form'
import { FinanceSpaceSwitcher } from '@/features/finances/components/finance-space-switcher'
import { getUseListExpensesOptions, getUseListGoalsOptions, getUseListIncomeSourcesOptions, useCurrentSpace, useListExpenses, useListGoals, useListSpacesQuery } from '@/features/finances/hooks'
import type { FinanceSpace } from '@/features/finances/types'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import z from 'zod/v3'
import { queryClient } from '@/lib/react-query'
import { CreateGoalDialog } from '@/features/finances/components/create-goal-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListGoals } from '@/features/finances/components/list-goals'
import { ListExpenses } from '@/features/finances/components/list-expenses'

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
              <Button variant="secondary">
                <PlusIcon className="size-3.5" />
                <span>{t("Goal")}</span>
              </Button>
            </CreateGoalDialog>
          ) : (
            <CreateExpenseDialog spaceId={spaceId}>
              <Button variant="secondary">
                <PlusIcon className="size-3.5" />
                <span>{t("Expense")}</span>
              </Button>
            </CreateExpenseDialog>
          )}
        </div>
        <TabsContent value="goals">
          <ListGoals spaceId={spaceId} goals={goals.data ?? []} />
        </TabsContent>
        <TabsContent value="expenses">
          <ListExpenses spaceId={spaceId} expenses={expenses.data ?? []} />
        </TabsContent>
      </Tabs>
    </Container>
  )
}

