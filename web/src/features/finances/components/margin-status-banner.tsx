import { formatCurrency } from "@/lib/format"
import { data } from "../dummy-data"

export function MarginStatusBanner() {
  const monthlyRemaining = data.monthlyIncome - (data.monthlyExpenses + data.monthlyGoalCommitments)
  return (
    <>
      {monthlyRemaining < 0 ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-semibold">
            ⚠️ Warning: Your expenses and commitments exceed your income by{" "}
            {formatCurrency(Math.abs(monthlyRemaining))}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ You have {formatCurrency(monthlyRemaining)} remaining after
            expenses and commitments
          </p>
        </div>
      )}
    </>
  )
}
