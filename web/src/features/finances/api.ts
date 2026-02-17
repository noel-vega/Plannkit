import { pkFetch } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"
import { ExpenseSchema, FinanceSpaceSchema, type CreateFinanceSpaceParams } from "./types"



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
  listExpenses: async (params: ByIdParams) => {
    const response = await pkFetch(`/finances/spaces/${params.id}/expenses`)
    const data = await response.json()
    return ExpenseSchema.array().parse(data)
  },
}
