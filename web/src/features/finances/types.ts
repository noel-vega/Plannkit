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

export const CreateGoalParamsSchema = z.object({
  spaceId: z.number(),
  name: z.string().min(1, { message: "Required" }),
  amount: z.coerce.number().positive({ message: "Minimum $1" }),
  monthlyCommitment: z.coerce.number(),
})
export type CreateGoalParams = z.infer<typeof CreateGoalParamsSchema>

export const GoalSchema = z.object({
  id: z.number(),
  spaceId: z.number(),
  name: z.string(),
  amount: z.coerce.number(),
  monthlyCommitment: z.coerce.number(),
})
export type Goal = z.infer<typeof GoalSchema>

export const ExpenseSchema = z.object({
  id: z.number(),
  spaceId: z.number(),
  name: z.string(),
  amount: z.coerce.number(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Expense = z.infer<typeof ExpenseSchema>

export const CreateExpenseParamsSchema = z.object({
  spaceId: z.number(),
  name: z.string().min(1, { message: "Required" }),
  amount: z.coerce.number().positive({ message: "Minimum $1" }),
  category: z.string().nullable(),
  description: z.string().nullable(),
})
export type CreateExpenseParams = z.infer<typeof CreateExpenseParamsSchema>
