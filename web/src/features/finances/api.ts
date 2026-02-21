import { pkFetch } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"
import { ExpenseSchema, FinanceSpaceSchema, GoalSchema, type CreateExpenseParams, type CreateFinanceSpaceParams, type CreateGoalParams, type Expense, type ExpenseIdent, type GoalIdent, type SpaceIdent } from "./types"

export const finances = {
  spaces: {
    create: async (params: CreateFinanceSpaceParams) => {
      const response = await pkFetch("/finances/spaces", {
        method: "POST",
        body: JSON.stringify(params)
      })
      const data = await response.json()
      return FinanceSpaceSchema.parse(data)
    },
    list: async () => {
      const response = await pkFetch("/finances/spaces")
      const data = await response.json()
      return FinanceSpaceSchema.array().parse(data)
    },
    delete: async (params: ByIdParams) => {
      await pkFetch(`/finances/spaces/${params.id}`, {
        method: "DELETE"
      })
    },
  },
  goals: {
    create: async (params: CreateGoalParams) => {
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/goals`, {
        method: "POST",
        body: JSON.stringify(params)
      })
      const data = await response.json()
      return GoalSchema.parse(data)
    },
    list: async (params: SpaceIdent) => {
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/goals`)
      const data = await response.json()
      return GoalSchema.array().parse(data)
    },
    getById: async (params: GoalIdent) => {
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/goals/${params.goalId}`)
      const data = await response.json()
      return GoalSchema.parse(data)
    }
  },
  expenses: {
    list: async (params: SpaceIdent) => {
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/expenses`)
      const data = await response.json()
      return ExpenseSchema.array().parse(data)
    },
    create: async (params: CreateExpenseParams) => {
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/expenses`, {
        method: "POST",
        body: JSON.stringify(params)
      })
      const data = await response.json()
      return ExpenseSchema.parse(data)
    },
    update: async (params: Expense) => {
      const { id, spaceId, ...rest } = params
      const response = await pkFetch(`/finances/spaces/${params.spaceId}/expenses/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(rest)
      })
      const data = await response.json()
      return ExpenseSchema.parse(data)
    },
    delete: async (params: ExpenseIdent) => {
      return await pkFetch(`/finances/spaces/${params.spaceId}/expenses/${params.expenseId}`, {
        method: "DELETE",
      })
    }
  }
}
