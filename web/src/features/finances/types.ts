import z from "zod/v3"

export const FinanceSpaceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type FinanceSpace = z.infer<typeof FinanceSpaceSchema>

export const CreateFinanceSpaceSchema = z.object(({
  name: z.string().min(1)
}))

export type CreateFinanceSpaceParams = z.infer<typeof CreateFinanceSpaceSchema>

export const ExpenseSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  amount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Expense = z.infer<typeof ExpenseSchema>
