import { HabitWithContributionsSchema, ListRoutinesResponseSchema, RoutineSchema, type ByIdParams, type CreateContributionParams, type CreateHabitParams, type CreateRoutineParams, type Habit, type UpdateContributionParams, type UpdateRoutineParams } from "./types"
import { api } from "@/lib/plannkit-api-client"

export const habits = {
  create: async (params: CreateHabitParams) => {
    const response = await api.POST("/habits", {
      ...params,
      ...(params.routineId != null && { routineId: params.routineId }),
    })
    const data = await response.json()
    return HabitWithContributionsSchema.parse(data)
  },
  list: async () => {
    const response = await api.GET("/habits")
    const data = await response.json()
    return HabitWithContributionsSchema.array().parse(data)
  },
  getById: async (params: ByIdParams) => {
    const response = await api.GET(`/habits/${params.id}`)
    const data = await response.json()
    return HabitWithContributionsSchema.parse(data)
  },
  update: async (params: Habit) => {
    const { id, ...body } = params
    return await api.PATCH(`/habits/${id}`, body)
  },
  delete: async (params: ByIdParams) => {
    await api.DELETE(`/habits/${params.id}`)
    // TODO: return id from api
    return params
  },
  routines: {
    create: async (params: CreateRoutineParams) => {
      await api.POST(`/habits/routines`, params)
    },
    list: async () => {
      const response = await api.GET("/habits/routines")
      const data = await response.json()
      return ListRoutinesResponseSchema.parse(data)
    },
    update: async (params: UpdateRoutineParams) => {
      await api.PATCH(`/habits/routines/${params.id}`, {
        name: params.name
      })
    },

    // updatePosition: async (params: UpdateRoutineParams) => {
    //   const response = await api.PATCH(`/habits/routines/${params.id}/position`, {
    //     name: params.name
    //   })
    //   const data = await response.json()
    //   return RoutineSchema.parse(data)
    // },
    delete: async (params: ByIdParams) => {
      await api.DELETE(`/habits/routines/${params.id}`)
    }
  },

  contributions: {
    create: async (params: CreateContributionParams) => {
      return await api.POST(`/habits/${params.habitId}/contributions`, {
        date: params.date.toISOString(),
        completions: params.completions
      })
    },
    update: async (params: UpdateContributionParams) => {
      return await api.PATCH(`/habits/contributions/${params.contributionId}`, {
        completions: params.completions
      })
    },
    delete: async (params: ByIdParams) => {
      return await api.DELETE(`/habits/contributions/${params.id}`)
    },
  }
}


