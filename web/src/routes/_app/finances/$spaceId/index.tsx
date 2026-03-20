import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ExpensesTable } from '@/features/finances/components/expenses-table'
import { MarginStatusBanner } from '@/features/finances/components/margin-status-banner'
import { MonthlyExpensesCard } from '@/features/finances/components/monthly-expenses-card'
import { MonthlyGoalCommitmentsCard } from '@/features/finances/components/monthly-goal-commitment-card'
import { MonthlyIncomeCard } from '@/features/finances/components/monthly-income-card'
import { CreateExpenseDialog } from '@/features/finances/components/create-expense-form'
import { FinanceSpaceSwitcher } from '@/features/finances/components/finance-space-switcher'
import { getUseListExpensesOptions, getUseListGoalsOptions, getUseListIncomeSourcesOptions, useCurrentSpace, useListExpenses, useListGoals, useListSpacesQuery } from '@/features/finances/hooks'
import type { Expense, FinanceSpace, Goal } from '@/features/finances/types'
import { GoalCard } from '@/features/finances/components/goal-card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon, TargetIcon } from 'lucide-react'
import z from 'zod/v3'
import { queryClient } from '@/lib/react-query'
import { CreateGoalDialog } from '@/features/finances/components/create-goal-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const { spaceId } = Route.useParams()
  const navigate = useNavigate()
  const rtCtx = Route.useRouteContext()
  const expenses = useListExpenses({ spaceId, initialData: rtCtx.expenses })
  const goals = useListGoals({ spaceId, initialData: rtCtx.goals })
  const spaces = useListSpacesQuery({ initialData: rtCtx.spaces })
  const currentSpace = useCurrentSpace({ spaceId })

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
    <div className="@container">
      <Container>
        <div className="mb-4 grid grid-cols-1 @3xl:grid-cols-3 gap-4">
          <FinanceSpaceSwitcher
            currentSpace={currentSpace.data}
            spaces={spaces.data}
            onSpaceSelect={handleSwitchSpace}
            onCreate={handleCreate}
            onSettings={handleSettings}
          />
        </div>
        <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-3.5 mb-4">
          <MonthlyIncomeCard spaceId={spaceId} incomeSources={rtCtx.incomeSources} />
          <MonthlyExpensesCard expenses={expenses.data ?? []} />
          <MonthlyGoalCommitmentsCard goals={goals.data ?? []} />
        </div>
        <div className="mb-4">
          <MarginStatusBanner spaceId={spaceId} />
        </div>

        <Tabs defaultValue='goals'>
          <TabsList className="w-full">
            <TabsTrigger value="goals">{t("Goals")}</TabsTrigger>
            <TabsTrigger value="expenses">{t("Expenses")}</TabsTrigger>
          </TabsList>
          <Separator className="my-2 bg-transparent" />
          <TabsContent value="goals" id="goals">
            <Goals spaceId={spaceId} goals={goals.data ?? []} />
          </TabsContent>
          <TabsContent value="expenses">
            <Expenses spaceId={spaceId} expenses={expenses.data ?? []} />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}

function Goals(props: { goals: Goal[], spaceId: number }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("Goals")}</h2>
          <p className="text-muted-foreground">
            {t("Track your progress towards financial goals.")}
          </p>
        </div>
        <CreateGoalDialog spaceId={props.spaceId}>
          <Button><PlusIcon />{t("Add Goal")}</Button>
        </CreateGoalDialog>
      </div>
      {/* Goals Here */}
      {props.goals.length === 0 && (
        <Card>
          <CardContent className="grid place-content-center place-items-center gap-4 h-52">
            <TargetIcon size={52} className="text-muted-foreground" />
            <p>{t('No goals set yet. Click "Add Goal" to get started.')}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid-cols-1 grid @6xl:grid-cols-2 gap-4">
        {props.goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </>
  )
}

function Expenses(props: { expenses: Expense[], spaceId: number }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex items-end mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{t("Expenses")}</h2>
          <p className="text-muted-foreground">
            {t("Track and organize your monthly expenses.")}
          </p>
        </div>

        <CreateExpenseDialog spaceId={props.spaceId}>
          <Button className="ml-auto">
            <PlusIcon /> {t("Add Expense")}
          </Button>
        </CreateExpenseDialog>
      </div>

      <div className="flex gap-3 items-end mb-4">
        <Field className="w-full">
          <FieldLabel>{t("Search")}</FieldLabel>
          <Input className="w-full" placeholder={t("Search expenses...")} />
        </Field>
        <Select>
          <SelectTrigger className="w-full max-w-52">
            <SelectValue placeholder={t("Select a category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="en">{t("Childcare")}</SelectItem>
              <SelectItem value="es">{t("Housing")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <ExpensesTable spaceId={props.spaceId} expenses={props.expenses} />
    </>
  )
}
