import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { CreditCardIcon } from "lucide-react";
import { data } from "../dummy-data";
import type { Expense } from "../types";
import { useTranslation } from "react-i18next";

type Props = {
  expenses: Expense[]
}

export function MonthlyExpensesCard(props: Props) {
  const { t } = useTranslation()
  const total = props.expenses.reduce((total, expense) => total + expense.amount, 0)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("Monthly Expenses")}
        </CardTitle>
        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(total)}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.monthlyIncome > 0
            ? t("{{percent}}% of income", { percent: ((total / data.monthlyIncome) * 100).toFixed(1) })
            : t("0% of income")}
        </p>
      </CardContent>
    </Card>
  )
}
