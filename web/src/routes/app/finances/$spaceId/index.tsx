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
import { getUseListExpensesOptions, getUseListGoalsOptions, useListExpenses, useListGoals } from '@/features/finances/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2Icon, CircleIcon, PauseIcon, PlusIcon, TargetIcon } from 'lucide-react'
import z from 'zod/v3'
import { queryClient } from '@/lib/react-query'
import { CreateGoalDialog } from '@/features/finances/components/create-goal-form'
import { formatCurrency } from '@/lib/format'
import { Progress } from '@/components/ui/progress'
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
  const rtCtx = Route.useRouteContext()
  const expenses = useListExpenses({ spaceId, initialData: rtCtx.expenses })
  const goals = useListGoals({ spaceId, initialData: rtCtx.goals })
  return (
    <div className="@container">
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
          <TabsContent value="goals">
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

            <div className="grid-cols-1 grid @3xl:grid-cols-2  gap-4">
              {goals.data.map((goal) => {
                const progress = 50
                const isComplete = progress >= 100;
                {/* const projectedDate = getProjectedCompletionDate(goal); */ }
                {/* const monthsToComplete = getMonthsToCompletion(goal); */ }
                {/* const status = getGoalStatus(goal); */ }

                const statusConfig = {
                  active: {
                    icon: CircleIcon,
                    color: "text-blue-600",
                    label: "Active",
                  },
                  complete: {
                    icon: CheckCircle2Icon,
                    color: "text-emerald-600",
                    label: "Complete",
                  },
                  "on-hold": {
                    icon: PauseIcon,
                    color: "text-gray-500",
                    label: "On Hold",
                  },
                };
                const projectedDate = new Date();
                const getCurrentAmount = () => 10

                const monthsToComplete = 1;

                const status = statusConfig["active"];

                const formatDate = (dateString: string) => {
                  return new Date(dateString).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                };

                return (
                  <Card key={goal.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{goal.name}</h3>
                            <div
                              className={`flex items-center gap-1 text-xs ${status.color}`}
                            >
                              <status.icon className="h-3.5 w-3.5" />
                              <span>{status.label}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Monthly commitment:{" "}
                            {goal.monthlyCommitment > 0
                              ? formatCurrency(goal.monthlyCommitment)
                              : "Not set"}
                          </div>
                          {!isComplete && projectedDate && status.label !== "on-hold" && (
                            <div className="text-sm text-muted-foreground">
                              Projected completion:{" "}
                              {formatDate(
                                projectedDate.toISOString().split("T")[0],
                              )}
                              {monthsToComplete > 0 &&
                                monthsToComplete !== Infinity && (
                                  <span className="ml-2">
                                    ({monthsToComplete}{" "}
                                    {monthsToComplete === 1 ? "month" : "months"})
                                  </span>
                                )}
                            </div>
                          )}
                          {status.label === "on-hold" && (
                            <div className="text-sm text-muted-foreground italic">
                              Set a monthly commitment to activate this goal
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(getCurrentAmount())} of{" "}
                            {formatCurrency(goal.amount)}
                          </span>
                          <span className="font-semibold">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-sm gap-3">
                          <span className="text-muted-foreground">
                            {formatCurrency(
                              goal.amount - 5000,
                            )}{" "}
                            remaining
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
