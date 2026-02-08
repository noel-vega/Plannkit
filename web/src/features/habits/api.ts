import { queryOptions, useMutation } from "@tanstack/react-query"
import { HabitWithContributionsSchema, type CreateHabit, type Habit } from "./types"
import { queryClient } from "@/lib/react-query"
import { getHeaders } from "@/lib/utils"
import { pkFetch } from "@/lib/plannkit-api-client"

export async function getHabitById(params: { id: number }) {
  const res = await pkFetch(`/habits/${params.id}`)
  const data = await res.json()
  return HabitWithContributionsSchema.parse(data)
}

export function getHabitByIdQueryOptions(params: { id: number }) {
  return queryOptions({
    queryKey: ["habit", params.id],
    queryFn: () => getHabitById(params)
  })
}

export async function invalidateHabitById(id: number) {
  return queryClient.invalidateQueries(getHabitByIdQueryOptions({ id }))
}

export async function listHabits() {
  const res = await pkFetch("/habits")
  const data = await res.json()
  return HabitWithContributionsSchema.array().parse(data)
}

export function getListHabitsQueryOptions() {
  return queryOptions({
    queryKey: ["habits"],
    queryFn: listHabits,
  })
}

export async function invalidateListHabits() {
  return queryClient.invalidateQueries(getListHabitsQueryOptions())
}

export async function createHabit(params: CreateHabit) {
  const res = await pkFetch("/habits", {
    method: "POST",
    body: JSON.stringify(params),
  })
  const data = await res.json()
  return HabitWithContributionsSchema.parse(data)
}


export async function updateHabit(params: Habit) {
  const { id, ...body } = params
  await pkFetch(`/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteHabit(params: { id: number }) {
  await pkFetch(`/habits/${params.id}`, {
    method: "DELETE",
  })

  // TODO: return id from api
  return params
}

function removeHabitFromQueryCache(params: { id: number }) {
  queryClient.setQueryData(getListHabitsQueryOptions().queryKey, (oldData) => {
    return !oldData ? oldData : oldData.filter(x => x.id !== params.id)
  })
}

export function useDeleteHabit() {
  return useMutation({
    mutationFn: deleteHabit,
    onMutate: (vars) => {
      removeHabitFromQueryCache(vars)
    },
    onSuccess: async (data) => {
      removeHabitFromQueryCache(data)
      await invalidateListHabits()
    }
  })
}

export async function createContribution(params: { habitId: number, date: Date, completions: number }) {
  const headers = getHeaders()
  await fetch(`/habits/${params.habitId}/contributions`, {
    method: "POST",
    body: JSON.stringify({ date: params.date.toISOString(), completions: params.completions }),
    headers
  })
}

export async function deleteContribution(params: { id: number }) {
  await pkFetch(`/api/contributions/${params.id}`, {
    method: "DELETE",
  })
}

export async function updateContributionCompletions(params: { contributionId: number, completions: number }) {
  const { contributionId, completions } = params
  await pkFetch(`/habits/contributions/${contributionId}`, {
    method: "PATCH",
    body: JSON.stringify({ completions }),
  })
}
