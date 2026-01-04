import { queryOptions } from "@tanstack/react-query"
import { HabitSchema, type CreateHabit } from "./types"
import { queryClient } from "./lib/react-query"

export async function getHabitById(params: { id: number }) {
  const res = await fetch(`/api/habits/${params.id}`)
  const data = await res.json()
  return HabitSchema.parse(data)
}

export function getHabitByIdQueryOptions(params: { id: number }) {
  return queryOptions({
    queryKey: ["habit", params.id],
    queryFn: () => getHabitById(params)
  })
}

export async function listHabits() {
  const res = await fetch("/api/habits")
  const data = await res.json()
  return HabitSchema.array().parse(data)
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
  console.log("new habit ...", data)
  return HabitSchema.parse(data)
}


export async function createContribution(params: { habitId: number, date: Date }) {
  await fetch(`/api/habits/${params.habitId}/contributions`, {
    method: "POST",
    body: JSON.stringify({ date: params.date.toISOString() }),
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
