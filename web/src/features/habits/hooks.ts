import { queryOptions, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/react-query"
import { contributions, habits } from "./api"

export function getHabitByIdQueryOptions(params: { id: number }) {
  return queryOptions({
    queryKey: ["habit", params.id],
    queryFn: () => habits.getById(params)
  })
}

export async function invalidateHabitById(id: number) {
  return queryClient.invalidateQueries(getHabitByIdQueryOptions({ id }))
}

export function getListHabitsQueryOptions() {
  return queryOptions({
    queryKey: ["habits"],
    queryFn: habits.list,
  })
}

export async function invalidateListHabits() {
  return queryClient.invalidateQueries(getListHabitsQueryOptions())
}

function removeHabitFromQueryCache(params: { id: number }) {
  queryClient.setQueryData(getListHabitsQueryOptions().queryKey, (oldData) => {
    return !oldData ? oldData : oldData.filter(x => x.id !== params.id)
  })
}


export function useDeleteHabit() {
  return useMutation({
    mutationFn: habits.delete,
    onMutate: (vars) => {
      removeHabitFromQueryCache(vars)
    },
    onSuccess: async (data) => {
      removeHabitFromQueryCache(data)
      await invalidateListHabits()
    }
  })
}

export function useCreateHabit() {
  return useMutation({
    mutationFn: habits.create,
    onSuccess: (newHabit) => {
      const queryKey = getListHabitsQueryOptions().queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
        return oldData ? [...oldData, newHabit] : oldData
      })
    }
  })
}

export function useUpdateHabit() {
  return useMutation({
    mutationFn: habits.update,
    onSuccess: (_, { id }) => {
      invalidateHabitById(id)
    },
    onError: (e) => {
      console.error("Could not create habit", e.message)
    }
  })
}

export function useCreateContribution() {
  return useMutation({
    mutationFn: contributions.create,
    onSuccess: (_, { habitId }) => {
      invalidateListHabits()
      invalidateHabitById(habitId)
    }
  })
}

export function useUpdateContribution() {
  return useMutation({
    mutationFn: contributions.update,
    onSuccess: (_, { habitId }) => {
      invalidateListHabits()
      invalidateHabitById(habitId)
    }
  })
}
