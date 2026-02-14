import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ExpensesTable } from "./expenses-table";
import { expenses } from "../dummy-data";

export function ExpensesTabContent() {
  return (
    <>
      <div className="flex gap-3 mb-4">
        <Input className="max-w-sm" placeholder="Search expenses..." />
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="en">Childcare</SelectItem>
              <SelectItem value="es">Housing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="secondary"><PlusIcon /> Add Expense</Button>
      </div>

      <ExpensesTable expenses={expenses} />
    </>
  )
}
