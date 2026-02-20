import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/format'
import type { Goal } from '../types'
import { CheckCircle2Icon, CircleIcon, PauseIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const statusConfig = {
  active: { icon: CircleIcon, color: 'text-blue-600', label: 'Active' },
  complete: { icon: CheckCircle2Icon, color: 'text-emerald-600', label: 'Complete' },
  'on-hold': { icon: PauseIcon, color: 'text-gray-500', label: 'On Hold' },
}

type GoalCardProps = {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const currentAmount = 1650
  const progress = Math.min((currentAmount / goal.amount) * 100, 100)
  const isComplete = progress >= 100
  const remaining = Math.max(goal.amount - currentAmount, 0)
  const status = isComplete
    ? statusConfig.complete
    : goal.monthlyCommitment > 0
      ? statusConfig.active
      : statusConfig['on-hold']

  return (
    <Link
      to="/app/finances/$spaceId/goals/$goalId"
      params={{ spaceId: goal.spaceId, goalId: goal.id }}
      resetScroll={true}
    >
      <Card className="cursor-pointer transition-colors hover:bg-accent/50">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{goal.name}</h3>
                <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                  <status.icon className="h-3.5 w-3.5" />
                  <span>{status.label}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly commitment:{' '}
                {goal.monthlyCommitment > 0
                  ? formatCurrency(goal.monthlyCommitment)
                  : 'Not set'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(currentAmount)} of {formatCurrency(goal.amount)}
              </span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {formatCurrency(remaining)} remaining
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
