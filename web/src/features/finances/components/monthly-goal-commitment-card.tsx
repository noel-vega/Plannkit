import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { TargetIcon } from "lucide-react";
import { data } from "../dummy-data";
import type { Goal } from "../types";

export function MonthlyGoalCommitmentsCard(props: { goals: Goal[] }) {
  const totalCommitments = props.goals.reduce((total, goal) => total + goal.monthlyCommitment, 0)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Monthly Goal Commitments
        </CardTitle>
        <TargetIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(totalCommitments)}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.monthlyIncome > 0
            ? `${((totalCommitments / data.monthlyIncome) * 100).toFixed(1)}% of income`
            : "0% of income"}
        </p>
      </CardContent>
    </Card>
  )
}
