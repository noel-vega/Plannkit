import { useTranslation } from "react-i18next"
import { CreateExpenseDialog } from "./create-expense-form"
import { ExpensesTable } from "./expenses-table"
import type { Expense } from "../types"

export function ListExpenses(props: { expenses: Expense[], spaceId: number }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-3 pt-3">
      {props.expenses.length === 0 ? (
        <CreateExpenseDialog spaceId={props.spaceId}>
          <button
            className="flex flex-col items-center gap-2 py-20 w-full text-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-secondary/30 transition-all duration-200 cursor-pointer"
          >
            <p className="text-sm text-muted-foreground">{t("No expenses yet")}</p>
            <span className="text-xs text-muted-foreground">{t("Create expense")}</span>
          </button>
        </CreateExpenseDialog>
      ) : (
        <ExpensesTable spaceId={props.spaceId} expenses={props.expenses} />
      )}
    </section>
  )
}
