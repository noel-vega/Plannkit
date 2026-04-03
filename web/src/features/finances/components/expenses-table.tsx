
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import type { Expense } from "../types";
import { useState } from "react";
import { UpdateExpenseDialog } from "./update-expense-form";
import { useDialog } from "@/hooks";
import { useTranslation } from "react-i18next";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { t } = useTranslation()
  const dialog = useDialog()
  const [expense, setExpense] = useState<Expense | null>(null)

  const handleRowClick = (row: Row<Expense>) => {
    setExpense(row.original)
    dialog.onOpenChange(true)
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <InputGroup className="flex-1">
          <InputGroupInput placeholder={t("Search expenses...")} />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Select>
          <SelectTrigger className="w-full max-w-52">
            <SelectValue placeholder={t("Select a category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="en">{t("Childcare")}</SelectItem>
              <SelectItem value="es">{t("Housing")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <DataTable onRowClick={handleRowClick} data={expenses} columns={columns} />
      {expense && (
        <UpdateExpenseDialog expense={expense} {...dialog} />
      )}
    </>
  )
}



