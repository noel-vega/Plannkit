
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Expense } from "../types";
import { useState } from "react";
import { UpdateExpenseDialog } from "./update-expense-form";
import { useDialog } from "@/hooks";

const columnHelper = createColumnHelper<Expense>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name"
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: ({ cell }) => formatCurrency(cell.getValue())
  }),
  columnHelper.accessor("category", {
    header: "Category"
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: ({ cell }) => format(cell.getValue(), "MMM d, yyyy")
  })
]

export function ExpensesTable({ expenses }: { spaceId: number; expenses: Expense[] }) {
  const dialog = useDialog()
  const [expense, setExpense] = useState<Expense | null>(null)

  const handleRowClick = (row: Row<Expense>) => {
    setExpense(row.original)
    dialog.onOpenChange(true)

  }
  return (
    <>
      <DataTable onRowClick={handleRowClick} data={expenses} columns={columns} />
      {expense && (
        <UpdateExpenseDialog expense={expense} {...dialog} />
      )}
    </>
  )
}



