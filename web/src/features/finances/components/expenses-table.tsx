
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Expense } from "../types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";

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
  const [expense, setExpense] = useState<Expense | null>(null)

  const handleRowClick = (row: Row<Expense>) => {
    setExpense(row.original)

  }
  return (
    <>
      <DataTable onRowClick={handleRowClick} data={expenses} columns={columns} />
      <Sheet open={!!expense} onOpenChange={open => {
        if (!open) setExpense(null)
      }}>
        <SheetContent className="w-full">
          {JSON.stringify(expense)}
        </SheetContent>
      </Sheet>
    </>
  )
}



