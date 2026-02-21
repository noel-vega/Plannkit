import { BackButton } from '@/components/back-button'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { getUseGetGoalOptions, useGetGoal } from '@/features/finances/hooks'
import { GoalIdentSchema } from '@/features/finances/types'
import { formatCurrency } from '@/lib/format'
import { queryClient } from '@/lib/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2Icon, CircleIcon, PauseIcon, PlusIcon, Trash2Icon } from 'lucide-react'

const DUMMY_CONTRIBUTIONS = [
  { id: 1, amount: 350, date: '2026-02-15' },
  { id: 2, amount: 200, date: '2026-01-15', note: 'Monthly auto-transfer' },
  { id: 3, amount: 200, date: '2025-12-15', note: 'Monthly auto-transfer' },
  { id: 4, amount: 500, date: '2025-11-20', note: 'Bonus deposit' },
  { id: 5, amount: 200, date: '2025-10-15' },
  { id: 6, amount: 200, date: '2025-09-15' },
]

const statusConfig = {
  active: { icon: CircleIcon, color: 'text-blue-600', label: 'Active' },
  complete: { icon: CheckCircle2Icon, color: 'text-emerald-600', label: 'Complete' },
  'on-hold': { icon: PauseIcon, color: 'text-gray-500', label: 'On Hold' },
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const Route = createFileRoute('/app/finances/$spaceId/goals/$goalId')({
  params: {
    parse: GoalIdentSchema.parse,
  },
  beforeLoad: async ({ params }) => {
    const goal = await queryClient.ensureQueryData(getUseGetGoalOptions(params))
    return { goal }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { spaceId, goalId } = Route.useParams()
  const rtCtx = Route.useRouteContext()
  const { data: goal } = useGetGoal({ spaceId, goalId }, rtCtx.goal)

  const currentAmount = DUMMY_CONTRIBUTIONS.reduce((sum, c) => sum + c.amount, 0)
  const progress = Math.min((currentAmount / goal.amount) * 100, 100)
  const isComplete = progress >= 100
  const remaining = Math.max(goal.amount - currentAmount, 0)
  const status = isComplete
    ? statusConfig.complete
    : goal.monthlyCommitment > 0
      ? statusConfig.active
      : statusConfig['on-hold']

  const monthsToComplete =
    remaining > 0 && goal.monthlyCommitment > 0
      ? Math.ceil(remaining / goal.monthlyCommitment)
      : 0

  const projectedDate = new Date()
  if (monthsToComplete > 0) {
    projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete)
  }

  return (
    <Container>
      <header className="flex gap-4 items-center mb-8">
        <BackButton to={`/app/finances/${spaceId}/#goals`} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Goal</p>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">{goal.name}</h2>
            <div className={`flex items-center gap-1 text-xs ${status.color}`}>
              <status.icon className="h-3.5 w-3.5" />
              <span>{status.label}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {goal.monthlyCommitment > 0
              ? `${formatCurrency(goal.monthlyCommitment)}/mo`
              : 'No monthly commitment set'}
            {!isComplete && status.label === 'Active' && monthsToComplete > 0 && (
              <> · Projected {formatDate(projectedDate.toISOString().split('T')[0])} ({monthsToComplete} {monthsToComplete === 1 ? 'month' : 'months'})</>
            )}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Saved</p>
            <p className="text-2xl font-semibold">{formatCurrency(currentAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Target</p>
            <p className="text-2xl font-semibold">{formatCurrency(goal.amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className="text-2xl font-semibold">{formatCurrency(remaining)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <Separator className="mb-8" />

      <div>
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold mb-4">Contributions</h3>
          <Button><PlusIcon /> Add Contribution</Button>
        </div>
        {DUMMY_CONTRIBUTIONS.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contributions yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-1">
            {DUMMY_CONTRIBUTIONS.map((contribution) => (
              <div
                key={contribution.id}
                className="group flex items-center justify-between text-sm py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-28 shrink-0">
                    {formatDate(contribution.date)}
                  </span>
                  <span className="font-medium text-emerald-600">
                    +{formatCurrency(contribution.amount)}
                  </span>
                  {contribution.note && (
                    <span className="text-muted-foreground text-sm">
                      {contribution.note}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
