import { api } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"
import { ExpenseSchema, FinanceSpaceSchema, GoalContributionSchema, GoalSchema, IncomeSourceSchema, SpaceMemberSchema, SpaceWithMembershipSchema, type CreateExpenseParams, type CreateFinanceSpaceParams, type CreateGoalContributionParams, type CreateGoalParams, type CreateIncomeSourceParams, type Expense, type ExpenseIdent, type GoalIdent, type SpaceIdent, type SpaceMemberRole } from "./types"

export const finances = {
  spaces: {
    create: async (params: CreateFinanceSpaceParams) => {
      const response = await api.POST("/finances/spaces", params)
      const data = await response.json()
      return FinanceSpaceSchema.parse(data)
    },
    list: async () => {
      const response = await api.GET("/finances/spaces")
      const data = await response.json()
      return SpaceWithMembershipSchema.array().parse(data)
    },
    acceptInvite: async (params: SpaceIdent) => {
      await api.PATCH(`/finances/spaces/${params.spaceId}/members`)
    },
    delete: async (params: ByIdParams) => {
      return await api.DELETE(`/finances/spaces/${params.id}`)
    },
  },
  members: {
    invite: async (params: SpaceIdent & { userId: number; role: SpaceMemberRole }) => {
      const { spaceId, ...body } = params
      const response = await api.POST(`/finances/spaces/${params.spaceId}/members`, body)
      await response.json()
    },
    list: async (params: SpaceIdent) => {
      const response = await api.GET(`/finances/spaces/${params.spaceId}/members`)
      const data = await response.json()
      return SpaceMemberSchema.array().parse(data)
    },
    delete: async (params: SpaceIdent & { userId: number }) => {
      const { spaceId, userId } = params
      return api.DELETE(`/finances/spaces/${spaceId}/members/${userId}`)
    },
  },
  goals: {
    create: async (params: CreateGoalParams) => {
      const response = await api.POST(`/finances/spaces/${params.spaceId}/goals`, params)
      const data = await response.json()
      return GoalSchema.parse(data)
    },
    list: async (params: SpaceIdent) => {
      const response = await api.GET(`/finances/spaces/${params.spaceId}/goals`)
      const data = await response.json()
      return GoalSchema.array().parse(data)
    },
    getById: async (params: GoalIdent) => {
      const response = await api.GET(`/finances/spaces/${params.spaceId}/goals/${params.goalId}`)
      const data = await response.json()
      return GoalSchema.parse(data)
    },
    contributions: {
      create: async (params: GoalIdent & { data: CreateGoalContributionParams }) => {
        const response = await api.POST(`/finances/spaces/${params.spaceId}/goals/${params.goalId}/contributions`, params.data)
        const data = await response.json()
        return GoalContributionSchema.parse(data)
      },
      list: async (params: GoalIdent) => {
        const response = await api.GET(`/finances/spaces/${params.spaceId}/goals/${params.goalId}/contributions`)
        const data = await response.json()
        return GoalContributionSchema.array().parse(data)
      },
      delete: async (params: GoalIdent & { contributionId: number }) => {
        return api.DELETE(`/finances/spaces/${params.spaceId}/goals/${params.goalId}/contributions/${params.contributionId}`)
      }
    }
  },
  expenses: {
    list: async (params: SpaceIdent) => {
      const response = await api.GET(`/finances/spaces/${params.spaceId}/expenses`)
      const data = await response.json()
      return ExpenseSchema.array().parse(data)
    },
    create: async (params: CreateExpenseParams) => {
      const response = await api.POST(`/finances/spaces/${params.spaceId}/expenses`, params)
      const data = await response.json()
      return ExpenseSchema.parse(data)
    },
    update: async (params: Expense) => {
      const { id, spaceId, ...rest } = params
      const response = await api.PATCH(`/finances/spaces/${params.spaceId}/expenses/${params.id}`, rest)
      const data = await response.json()
      return ExpenseSchema.parse(data)
    },
    delete: async (params: ExpenseIdent) => {
      return await api.DELETE(`/finances/spaces/${params.spaceId}/expenses/${params.expenseId}`)
    }
  },
  incomeSources: {
    list: async (params: SpaceIdent) => {
      const response = await api.GET(`/finances/spaces/${params.spaceId}/incomes`)
      const data = await response.json()
      return IncomeSourceSchema.array().parse(data)
    },
    create: async (params: CreateIncomeSourceParams) => {
      const response = await api.POST(`/finances/spaces/${params.spaceId}/incomes`, params)
      const data = await response.json()
      return IncomeSourceSchema.parse(data)
    },
    delete: async (params: SpaceIdent & { incomeSourceId: number }) => {
      return await api.DELETE(`/finances/spaces/${params.spaceId}/incomes/${params.incomeSourceId}`)
    }
  }
}
