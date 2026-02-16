import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExpensesTable } from '@/features/auth/finances/components/expenses-table'
import { useListFinanceExpenses } from '@/features/finances/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances/$spaceId/expenses')({
  params: {
    parse: z.object({ spaceId: z.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { spaceId } = Route.useParams()
  const expenses = useListFinanceExpenses({ spaceId })

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

      <ExpensesTable expenses={expenses.data ?? []} />
    </>
  )
}
