import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Item, ItemActions, ItemContent } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CreateGoalContributionDialog } from '@/features/finances/components/create-goal-contribution-form'
import { getUseGetGoalOptions, getUseGoalContributionsQueryOptions, useDeleteGoalContributionMutation, useGetGoal, useGetGoalContributionsQuery } from '@/features/finances/hooks'
import { GoalIdentSchema, type Goal, type GoalContribution } from '@/features/finances/types'
import { formatCurrency } from '@/lib/format'
import { queryClient } from '@/lib/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2Icon, CircleIcon, PauseIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

const statusConfig = {
  active: { icon: CircleIcon, color: 'text-blue-600', labelKey: 'Active' },
  complete: { icon: CheckCircle2Icon, color: 'text-emerald-600', labelKey: 'Complete' },
  'on-hold': { icon: PauseIcon, color: 'text-gray-500', labelKey: 'On Hold' },
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const Route = createFileRoute('/_app/finances/$spaceId/goals/$goalId')({
  params: {
    parse: GoalIdentSchema.parse,
  },
  beforeLoad: async ({ params }) => {
    const [goal, contributions] = await Promise.all([
      queryClient.ensureQueryData(getUseGetGoalOptions(params)),
      queryClient.ensureQueryData(getUseGoalContributionsQueryOptions(params))
    ])
    return { goal, contributions }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { spaceId, goalId } = Route.useParams()
  const rtCtx = Route.useRouteContext()
  const { data: goal } = useGetGoal({ spaceId, goalId }, rtCtx.goal)
  const { data: contributions } = useGetGoalContributionsQuery({ spaceId, goalId }, rtCtx.contributions)

  const currentAmount = contributions.reduce((sum, c) => sum + c.amount, 0)
  const progress = Math.min((currentAmount / goal.amount) * 100, 100)
  const remaining = Math.max(goal.amount - currentAmount, 0)

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
      <GoalHeader goal={goal} contributions={contributions} />
      <section className="grid grid-cols-1 @3xl:grid-cols-3 gap-4 mb-8">
        <GoalInfoCard title={t("Saved")}>
          {formatCurrency(currentAmount)}
        </GoalInfoCard>
        <GoalInfoCard title={t("Target")}>
          {formatCurrency(goal.amount)}
        </GoalInfoCard>
        <GoalInfoCard title={t("Remaining")}>
          {formatCurrency(remaining)}
        </GoalInfoCard>
      </section>

      <GoalProgress progress={progress} />

      <Separator className="mb-8" />

      <section>
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold mb-4">{t("Contributions")}</h3>
          <CreateGoalContributionDialog spaceId={spaceId} goalId={goalId}>
            <Button><PlusIcon /> {t("Add Contribution")}</Button>
          </CreateGoalContributionDialog>
        </div>
        <GoalContributionList contributions={contributions ?? []} />
      </section>
    </Container>
  )
}

function GoalHeader(props: { goal: Goal; contributions: GoalContribution[] }) {
  const { t } = useTranslation()
  const currentAmount = props.contributions.reduce((sum, c) => sum + c.amount, 0)
  const progress = Math.min((currentAmount / props.goal.amount) * 100, 100)
  const isComplete = progress >= 100
  const remaining = Math.max(props.goal.amount - currentAmount, 0)

  const monthsToComplete =
    remaining > 0 && props.goal.monthlyCommitment > 0
      ? Math.ceil(remaining / props.goal.monthlyCommitment)
      : 0

  const projectedDate = new Date()
  if (monthsToComplete > 0) {
    projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete)
  }

  const status = isComplete
    ? statusConfig.complete
    : props.goal.monthlyCommitment > 0
      ? statusConfig.active
      : statusConfig['on-hold']
  return (
    <header className="flex gap-4 items-center mb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{t("Goal")}</p>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">{props.goal.name}</h2>
          <div className={`flex items-center gap-1 text-xs ${status.color}`}>
            <status.icon className="h-3.5 w-3.5" />
            <span>{t(status.labelKey)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {props.goal.monthlyCommitment > 0
            ? `${formatCurrency(props.goal.monthlyCommitment)}/mo`
            : t('No monthly commitment set')}
          {!isComplete && status.labelKey === 'Active' && monthsToComplete > 0 && (
            <> · Projected {formatDate(projectedDate.toISOString().split('T')[0])} ({monthsToComplete} {monthsToComplete === 1 ? 'month' : 'months'})</>
          )}
        </p>
      </div>
    </header>
  )
}

function GoalInfoCard({ title, children }: { title: string } & PropsWithChildren) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-semibold">{children}</p>
      </CardContent>
    </Card>
  )
}

function GoalContributionList(props: { contributions: GoalContribution[] }) {
  const { t } = useTranslation()
  const deleteContribution = useDeleteGoalContributionMutation()

  const handleDelete = (contribution: GoalContribution) => {
    deleteContribution.mutate({
      spaceId: contribution.spaceId,
      goalId: contribution.goalId,
      contributionId: contribution.id
    })
  }
  return (
    <>
      {props.contributions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("No contributions yet. Add your first one above.")}
        </p>
      ) : (
        <ul className="space-y-1">
          {props.contributions.map((contribution) => (
            <GoalContributionItem key={contribution.id} contribution={contribution} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </>
  )
}

function GoalProgress(props: { progress: number }) {
  const { t } = useTranslation()
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">{t("Progress")}</span>
        <span className="font-semibold">{props.progress.toFixed(1)}%</span>
      </div>
      <Progress value={props.progress} className="h-3" />
    </div>
  )
}

function GoalContributionItem(props: { contribution: GoalContribution, onDelete: (contribution: GoalContribution) => void }) {
  const { contribution } = props
  return (
    <Item variant="outline" className="group flex items-center justify-between text-sm py-3 hover:bg-muted">
      <ItemContent>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground w-28 shrink-0">
            {formatDate(contribution.createdAt.toISOString())}
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
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" onClick={() => props.onDelete(contribution)}>
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </ItemActions>
    </Item>
  )
}
