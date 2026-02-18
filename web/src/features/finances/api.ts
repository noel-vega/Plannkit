import { pkFetch } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"
import { ExpenseSchema, FinanceSpaceSchema, type CreateExpenseParams, type CreateFinanceSpaceParams, type Expense } from "./types"



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
  expenses: {
    list: async (params: { spaceId: number }) => {
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
    }
  }
}
