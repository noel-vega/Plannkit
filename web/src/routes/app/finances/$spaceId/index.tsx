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
import { getUseListExpensesOptions, getUseListGoalsOptions, useListExpenses, useListGoals, useListSpaces } from '@/features/finances/hooks'
import type { FinanceSpace } from '@/features/finances/types'
import { GoalCard } from '@/features/finances/components/goal-card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon, TargetIcon } from 'lucide-react'
import z from 'zod/v3'
import { queryClient } from '@/lib/react-query'
import { CreateGoalDialog } from '@/features/finances/components/create-goal-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/app/finances/$spaceId/')({
  beforeLoad: async ({ params }) => {
    const [expenses, goals] = await Promise.all([
      queryClient.ensureQueryData(getUseListExpensesOptions(params)),
      queryClient.ensureQueryData(getUseListGoalsOptions(params))
    ])
    return { expenses, goals }
  },
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { spaceId } = Route.useParams()
  const navigate = useNavigate()
  const rtCtx = Route.useRouteContext()
  const expenses = useListExpenses({ spaceId, initialData: rtCtx.expenses })
  const goals = useListGoals({ spaceId, initialData: rtCtx.goals })
  const spaces = useListSpaces({ initialData: rtCtx.spaces })

  const handleSwitchSpace = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId", params: { spaceId: space.id } })
  }
  const handleCreate = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId", params: { spaceId: space.id } })
  }
  const handleSettings = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId/settings", params: { spaceId: space.id } })
  }

  return (
    <div className="@container">
      <Container>
        <div className="mb-4 grid grid-cols-1 @7xl:grid-cols-3 gap-4">
          <FinanceSpaceSwitcher
            currentSpace={rtCtx.currentSpace}
            spaces={spaces.data}
            onSpaceSelect={handleSwitchSpace}
            onCreate={handleCreate}
            onSettings={handleSettings}
          />
        </div>
      </Container>
      <Container>
        <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-3.5 mb-4">
          <MonthlyIncomeCard />
          <MonthlyExpensesCard expenses={expenses.data} />
          <MonthlyGoalCommitmentsCard goals={goals.data} />
        </div>
        <div className="mb-4">
          <MarginStatusBanner />
        </div>
      </Container>

      <Container>
        <Tabs defaultValue='goals'>
          <TabsList className="w-full">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <Separator className="my-2 bg-transparent" />
          <TabsContent value="goals" id="goals">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Goals</h2>
                <p className="text-muted-foreground">
                  Track your progress towards financial goals.
                </p>
              </div>
              <CreateGoalDialog spaceId={spaceId}>
                <Button><PlusIcon />Add Goal</Button>
              </CreateGoalDialog>
            </div>

            {goals.data.length === 0 && (
              <Card>
                <CardContent className="grid place-content-center place-items-center gap-4 h-52">
                  <TargetIcon size={52} className="text-muted-foreground" />
                  <p>No goals set yet. Click "Add Goal" to get started.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid-cols-1 grid @3xl:grid-cols-2 gap-4">
              {goals.data.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="expenses">
            <div className="flex items-end mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Expenses</h2>
                <p className="text-muted-foreground">
                  Track and organize your monthly expenses.
                </p>
              </div>

              <CreateExpenseDialog spaceId={spaceId}>
                <Button className="ml-auto">
                  <PlusIcon /> Add Expense
                </Button>
              </CreateExpenseDialog>
            </div>

            <div className="flex gap-3 items-end mb-4">
              <Field className="w-full">
                <FieldLabel>Search</FieldLabel>
                <Input className="w-full" placeholder="Search expenses..." />
              </Field>
              <Select>
                <SelectTrigger className="w-full max-w-52">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="en">Childcare</SelectItem>
                    <SelectItem value="es">Housing</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <ExpensesTable spaceId={spaceId} expenses={expenses.data ?? []} />
          </TabsContent>
        </Tabs>
      </Container>


    </div>
  )
}
