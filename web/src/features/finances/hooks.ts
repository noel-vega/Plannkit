import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { finances } from "./api";
import type { Expense, FinanceSpace, Goal, GoalContribution, GoalIdent, SpaceIdent } from "./types";
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

export function getUseListExpensesOptions(params: SpaceIdent) {
  return queryOptions({
    queryKey: ["finance-space-expenses", params.spaceId],
    queryFn: () => finances.expenses.list(params)
  })
}

export async function invalidateUseListExpenses(params: SpaceIdent) {
  return queryClient.invalidateQueries(getUseListExpensesOptions(params))
}

export function useListExpenses({ spaceId, initialData }: SpaceIdent & { initialData: Expense[] }) {
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

export function getUseListGoalsOptions(params: SpaceIdent) {
  return queryOptions({
    queryKey: ["list-goals", params.spaceId],
    queryFn: () => finances.goals.list(params)
  })
}

export async function invalidateUseListGoals(params: SpaceIdent) {
  return queryClient.invalidateQueries(getUseListGoalsOptions(params))
}

export function useListGoals({ spaceId, initialData }: { spaceId: number, initialData: Goal[] }) {
  return useQuery({ ...getUseListGoalsOptions({ spaceId }), initialData })
}

export function getUseGetGoalOptions(params: GoalIdent) {
  return queryOptions({
    queryKey: ['goal', params.spaceId, params.goalId],
    queryFn: () => finances.goals.getById(params)
  })
}

export function invalidateUseGetGoal(params: GoalIdent) {
  return queryClient.invalidateQueries(getUseGetGoalOptions(params))
}

export function useGetGoal(params: GoalIdent, initialData: Goal) {
  return useQuery({ ...getUseGetGoalOptions(params), initialData })
}

export function getUseGoalContributionsQueryOptions(params: GoalIdent) {
  return queryOptions({
    queryKey: ["goal", params.goalId],
    queryFn: () => finances.goals.contributions.list(params)
  })
}

export function invalidateUseGoalContributionsQuery(params: GoalIdent) {
  return queryClient.invalidateQueries(getUseGoalContributionsQueryOptions(params))
}

export function useGetGoalContributionsQuery(params: GoalIdent, initialData: GoalContribution[]) {
  return useQuery({ ...getUseGoalContributionsQueryOptions(params), initialData })
}

export function useCreateGoalContributionMutation() {
  return useMutation({
    mutationFn: finances.goals.contributions.create,
    onSuccess: (_, vars) => {
      invalidateUseGoalContributionsQuery(vars)
    }
  })
}

export function useDeleteGoalContributionMutation() {
  return useMutation({
    mutationFn: finances.goals.contributions.delete,
    onSuccess: (_, vars) => {
      invalidateUseGoalContributionsQuery(vars)
    }
  })
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: finances.expenses.delete,
    onSuccess: (_, { spaceId }) => {
      invalidateUseListExpenses({ spaceId })
    }
  })
}
