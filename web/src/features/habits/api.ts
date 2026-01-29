import { queryOptions, useMutation } from "@tanstack/react-query"
import { HabitWithContributionsSchema, type CreateHabit, type Habit } from "./types"
import { queryClient } from "@/lib/react-query"
import { useAuth } from "../auth/store"
import { getHeaders } from "@/lib/utils"

export async function getHabitById(params: { id: number }) {
  const headers = getHeaders()
  const res = await fetch(`/api/habits/${params.id}`, { headers })
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
  const headers = getHeaders()
  const res = await fetch("/api/habits", { headers })
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
  const headers = getHeaders()
  const res = await fetch("/api/habits", {
    method: "POST",
    body: JSON.stringify(params),
    headers
  })
  const data = await res.json()
  return HabitWithContributionsSchema.parse(data)
}


export async function updateHabit(params: Habit) {
  const headers = getHeaders()
  const { id, ...rest } = params
  await fetch(`/api/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(rest),
    headers
  })
}

export async function deleteHabit(params: { id: number }) {
  const headers = getHeaders()
  await fetch(`/api/habits/${params.id}`, {
    method: "DELETE",
    headers
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
  await fetch(`/api/habits/${params.habitId}/contributions`, {
    method: "POST",
    body: JSON.stringify({ date: params.date.toISOString(), completions: params.completions }),
    headers
  })
}

export async function deleteContribution(params: { id: number }) {
  const { accessToken } = useAuth.getState()
  await fetch(`/api/contributions/${params.id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
}

export async function updateContributionCompletions(params: { contributionId: number, completions: number }) {
  const { contributionId, completions } = params
  const headers = getHeaders()
  await fetch(`/api/habits/contributions/${contributionId}`, {
    method: "PATCH",
    body: JSON.stringify({ completions }),
    headers
  })
}
