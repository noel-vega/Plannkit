import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { CreditCardIcon } from "lucide-react";
import { data } from "../dummy-data";

export function MonthlyExpensesCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Monthly Expenses
        </CardTitle>
        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(2000)}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.monthlyIncome > 0
            ? `${((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(1)}% of income`
            : "0% of income"}
        </p>
      </CardContent>
    </Card>
  )
}
