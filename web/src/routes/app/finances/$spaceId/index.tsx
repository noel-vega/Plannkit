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
import { useListFinanceExpenses } from '@/features/finances/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon, TargetIcon } from 'lucide-react'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances/$spaceId/')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { spaceId } = Route.useParams()
  const expenses = useListFinanceExpenses({ spaceId })
  return (
    <div className="@container">
      <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-3.5 mb-4">
        <MonthlyIncomeCard />
        <MonthlyExpensesCard />
        <MonthlyGoalCommitmentsCard />
      </div>
      <div className="mb-8">
        <MarginStatusBanner />
      </div>

      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Goals</h2>
            <p className="text-muted-foreground">
              Track your progress towards financial goals.
            </p>
          </div>
          <Button><PlusIcon />Add Goal</Button>
        </div>
        <Card>
          <CardContent className="grid place-content-center place-items-center gap-4 h-52">
            <TargetIcon size={52} className="text-muted-foreground" />
            <p>No goals set yet. Click "Add Goal" to get started.</p>
          </CardContent>
        </Card>
        {/* Goals here  */}
      </Container>
      <Separator className="my-8 bg-transparent" />

      <Container className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Expenses</h2>
          <p className="text-muted-foreground">
            Track and organize your monthly expenses.
          </p>
        </div>
        <div className="flex gap-3 items-end">
          <Field className="max-w-sm w-full">
            <FieldLabel >Name</FieldLabel>
            <Input className="w-full" placeholder="Search expenses..." />
          </Field>
          <Select>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="en">Childcare</SelectItem>
                <SelectItem value="es">Housing</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <CreateExpenseDialog spaceId={spaceId}>
            <Button className="ml-auto">
              <PlusIcon /> Add Expense
            </Button>
          </CreateExpenseDialog>
        </div>

        <ExpensesTable spaceId={spaceId} expenses={expenses.data ?? []} />
      </Container>
    </div>
  )
}
