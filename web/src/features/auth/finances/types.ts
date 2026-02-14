import z from "zod/v3"


export const ExpenseSchema = z.object({
  name: z.string(),
  amount: z.number(),
  category: z.string(),
  createdAt: z.coerce.date()
})

export type Expense = z.infer<typeof ExpenseSchema> 
