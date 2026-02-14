import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Expense } from "../types";

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

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  return <DataTable data={expenses} columns={columns} />
}



