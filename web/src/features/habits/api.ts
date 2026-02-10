import { HabitWithContributionsSchema, type ByIdParams, type CreateContributionParams, type CreateHabitParams, type Habit, type UpdateContributionParams } from "./types"
import { pkFetch } from "@/lib/plannkit-api-client"

export const habits = {
  create: async (params: CreateHabitParams) => {
    const response = await pkFetch("/habits", {
      method: "POST",
      body: JSON.stringify(params),
    })
    const data = await response.json()
    return HabitWithContributionsSchema.parse(data)
  },
  list: async () => {
    const response = await pkFetch("/habits")
    const data = await response.json()
    return HabitWithContributionsSchema.array().parse(data)
  },
  getById: async (params: ByIdParams) => {
    const response = await pkFetch(`/habits/${params.id}`)
    const data = await response.json()
    return HabitWithContributionsSchema.parse(data)
  },
  update: async (params: Habit) => {
    const { id, ...body } = params
    await pkFetch(`/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },
  delete: async (params: ByIdParams) => {
    await pkFetch(`/habits/${params.id}`, {
      method: "DELETE",
    })
    // TODO: return id from api
    return params
  }
}


export const contributions = {
  create: async (params: CreateContributionParams) => {
    await pkFetch(`/habits/${params.habitId}/contributions`, {
      method: "POST",
      body: JSON.stringify({
        date: params.date.toISOString(),
        completions: params.completions
      }),
    })
  },
  update: async (params: UpdateContributionParams) => {
    await pkFetch(`/habits/contributions/${params.contributionId}`, {
      method: "PATCH",
      body: JSON.stringify({ completions: params.completions }),
    })
  },
  delete: async (params: ByIdParams) => {
    await pkFetch(`/api/contributions/${params.id}`, {
      method: "DELETE",
    })
  },
}
