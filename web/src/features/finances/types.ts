import z from "zod/v3"

export const FinanceSpaceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type FinanceSpace = z.infer<typeof FinanceSpaceSchema>

export const SpaceIdentSchema = z.object({
  spaceId: z.coerce.number()
})
export type SpaceIdent = z.infer<typeof SpaceIdentSchema>


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
  totalContributions: z.number()
})
export type Goal = z.infer<typeof GoalSchema>

export const GoalContributionSchema = z.object({
  id: z.number(),
  spaceId: z.number(),
  goalId: z.number(),
  userId: z.number(),
  amount: z.coerce.number(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type GoalContribution = z.infer<typeof GoalContributionSchema>

export const CreateGoalContributionParamsSchema = z.object({
  amount: z.coerce.number(),
  note: z.string()
})
export type CreateGoalContributionParams = z.infer<typeof CreateGoalContributionParamsSchema>

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

export const ExpenseIdentSchema = SpaceIdentSchema.merge(z.object({ expenseId: z.coerce.number() }))
export type ExpenseIdent = z.infer<typeof ExpenseIdentSchema>

export const CreateExpenseParamsSchema = z.object({
  spaceId: z.number(),
  name: z.string().min(1, { message: "Required" }),
  amount: z.coerce.number().positive({ message: "Minimum $1" }),
  category: z.string().nullable(),
  description: z.string().nullable(),
})
export type CreateExpenseParams = z.infer<typeof CreateExpenseParamsSchema>


export const GoalIdentSchema = SpaceIdentSchema.merge(z.object({ goalId: z.coerce.number() }))
export type GoalIdent = z.infer<typeof GoalIdentSchema>

export const IncomeSourceSchema = z.object({
  id: z.number(),
  spaceId: z.number(),
  userId: z.number(),
  name: z.string(),
  amount: z.coerce.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type IncomeSource = z.infer<typeof IncomeSourceSchema>

export const CreateIncomeSourceParamsSchema = IncomeSourceSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
export type CreateIncomeSourceParams = z.infer<typeof CreateIncomeSourceParamsSchema>
