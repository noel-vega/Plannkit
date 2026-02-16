import { Button } from '@/components/ui/button'
import { MarginStatusBanner } from '@/features/auth/finances/components/margin-status-banner'
import { MonthlyExpensesCard } from '@/features/auth/finances/components/monthly-expenses-card'
import { MonthlyGoalCommitmentsCard } from '@/features/auth/finances/components/monthly-goal-commitment-card'
import { MonthlyIncomeCard } from '@/features/auth/finances/components/monthly-income-card'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances/$spaceId/overview')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3.5 mb-4">
        <MonthlyIncomeCard />
        <MonthlyExpensesCard />
        <MonthlyGoalCommitmentsCard />
      </div>
      <div className="mb-8">
        <MarginStatusBanner />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <p className="text-muted-foreground">
            Track your progress towards financial goals
          </p>
        </div>
        <Button><PlusIcon />Add Goal</Button>
      </div>
    </>
  )
}
