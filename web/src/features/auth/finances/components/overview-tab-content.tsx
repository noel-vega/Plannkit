import { Button } from "@/components/ui/button";
import { MarginStatusBanner } from "./margin-status-banner";
import { MonthlyExpensesCard } from "./monthly-expenses-card";
import { MonthlyGoalCommitmentsCard } from "./monthly-goal-commitment-card";
import { MonthlyIncomeCard } from "./monthly-income-card";
import { PlusIcon } from "lucide-react";

export function OverviewTabContent() {
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
