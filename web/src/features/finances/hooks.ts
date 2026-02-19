import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { finances } from "./api";
import type { Expense, FinanceSpace, Goal } from "./types";
import { queryClient } from "@/lib/react-query";


// Finance Spaces
export function getUseListSpacesOptions() {
  return queryOptions({
    queryKey: ["finance-spaces-list"],
    queryFn: finances.spaces.list
  })
}

export async function invalidateUseListSpaces() {
  return queryClient.invalidateQueries(getUseListSpacesOptions())
}

export function useListSpaces({ initialData }: { initialData: FinanceSpace[] }) {
  return useQuery({ ...getUseListSpacesOptions(), initialData })
}


export function useCreateFinanceSpace() {
  return useMutation({
    mutationFn: finances.spaces.create,
    onSuccess: () => {
      invalidateUseListSpaces()
    }
  })
}

export function useDeleteSpace() {
  return useMutation({
    mutationFn: finances.spaces.delete,
    onSuccess: () => {
      invalidateUseListSpaces()
    }
  })
}

// Finance Space Expenses
export function useCreateExpense() {
  return useMutation({
    mutationFn: finances.expenses.create,
    onSuccess: ({ id }) => {
      invalidateUseListExpenses({ spaceId: id })
    }
  })
}

export function getUseListExpensesOptions(params: { spaceId: number }) {
  return queryOptions({
    queryKey: ["finance-space-expenses"],
    queryFn: () => finances.expenses.list(params)
  })
}

export async function invalidateUseListExpenses(params: { spaceId: number }) {
  return queryClient.invalidateQueries(getUseListExpensesOptions(params))
}

export function useListExpenses({ spaceId, initialData }: { spaceId: number, initialData: Expense[] }) {
  return useQuery({ ...getUseListExpensesOptions({ spaceId }), initialData })
}

export function useUpdateExpense() {
  return useMutation({
    mutationFn: finances.expenses.update,
    onSuccess: ({ id }) => {
      invalidateUseListExpenses({ spaceId: id })
    }
  })
}



export function useCreateGoal() {
  return useMutation({
    mutationFn: finances.goals.create,
    onSuccess: (_, { spaceId }) => {
      invalidateUseListGoals({ spaceId })
    },
    onError: ({ message }) => {
      console.error(message)
    }
  })
}

export function getUseListGoalsOptions(params: { spaceId: number; }) {
  return queryOptions({
    queryKey: ["list-goals"],
    queryFn: () => finances.goals.list(params)
  })
}

export async function invalidateUseListGoals(params: { spaceId: number }) {
  return queryClient.invalidateQueries(getUseListGoalsOptions(params))
}

export function useListGoals({ spaceId, initialData }: { spaceId: number, initialData: Goal[] }) {
  return useQuery({ ...getUseListGoalsOptions({ spaceId }), initialData })
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: finances.expenses.delete,
    onSuccess: (_, { spaceId }) => {
      invalidateUseListExpenses({ spaceId })
    }
  })
}
