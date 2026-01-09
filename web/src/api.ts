import { queryOptions } from "@tanstack/react-query"
import { HabitWithContributionsSchema, type CreateHabit, type Habit } from "./types"
import { queryClient } from "./lib/react-query"

export async function getHabitById(params: { id: number }) {
  const res = await fetch(`/api/habits/${params.id}`)
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
  const res = await fetch("/api/habits")
  const data = await res.json()
  return HabitWithContributionsSchema.array().parse(data)
}

export function getListHabitsQueryOptions() {
  return queryOptions({
    queryKey: ["habits"],
    queryFn: listHabits
  })
}

export function invalidateListHabits() {
  queryClient.invalidateQueries(getListHabitsQueryOptions())
}

export async function createHabit(params: CreateHabit) {
  console.log("create habit")
  const res = await fetch("/api/habits", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "content-type": "application/json"
    }
  })
  const data = await res.json()
  return HabitWithContributionsSchema.parse(data)
}


export async function updateHabit(params: Habit) {
  const { id, ...rest } = params
  console.log("Update habit", params)
  await fetch(`/api/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(rest),
    headers: {
      "content-type": "application/json"
    }
  })
}

export async function createContribution(params: { habitId: number, date: Date, completions: number }) {
  await fetch(`/api/habits/${params.habitId}/contributions`, {
    method: "POST",
    body: JSON.stringify({ date: params.date.toISOString(), completions: params.completions }),
    headers: {
      "content-type": "application/json"
    }
  })
}

export async function deleteContribution(params: { id: number }) {
  await fetch(`/api/contributions/${params.id}`, {
    method: "DELETE",
  })
}

export async function updateContributionCompletions(params: { contributionId: number, completions: number }) {
  const { contributionId, completions } = params
  await fetch(`/api/habits/contributions/${contributionId}/completions`, {
    method: "PATCH",
    body: JSON.stringify({ completions }),
    headers: {
      "content-type": "application/json"
    }
  })
}
