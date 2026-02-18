import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { finances } from "./api";
import type { Expense, FinanceSpace } from "./types";
import { queryClient } from "@/lib/react-query";


// Finance Spaces
export function getUseListFinanceSpacesOptions() {
  return queryOptions({
    queryKey: ["finance-spaces-list"],
    queryFn: finances.spaces.list
  })
}

export async function invalidateUseListFinanceSpaces() {
  return queryClient.invalidateQueries(getUseListFinanceSpacesOptions())
}

export function useListFinanceSpaces({ initialData }: { initialData: FinanceSpace[] }) {
  return useQuery({ ...getUseListFinanceSpacesOptions(), initialData })
}


export function useCreateFinanceSpace() {
  return useMutation({
    mutationFn: finances.spaces.create,
    onSuccess: () => {
      invalidateUseListFinanceSpaces()
    }
  })
}

export function useDeleteFinanceSpace() {
  return useMutation({
    mutationFn: finances.spaces.delete,
    onSuccess: () => {
      invalidateUseListFinanceSpaces()
    }
  })
}

// Finance Space Expenses
export function useCreateFinanceExpense() {
  return useMutation({
    mutationFn: finances.expenses.create,
    onSuccess: ({ id }) => {
      invalidateUseListFinanceExpenses({ spaceId: id })
    }
  })
}

export function getUseListFinanceExpensesOptions(params: { spaceId: number }) {
  return queryOptions({
    queryKey: ["finance-space-expenses"],
    queryFn: () => finances.expenses.list(params)
  })
}

export async function invalidateUseListFinanceExpenses(params: { spaceId: number }) {
  return queryClient.invalidateQueries(getUseListFinanceExpensesOptions(params))
}

export function useListFinanceExpenses({ spaceId, initialData }: { spaceId: number, initialData?: Expense[] }) {
  return useQuery({ ...getUseListFinanceExpensesOptions({ spaceId }), initialData })
}

export function useUpdateFinanceExpense() {
  return useMutation({
    mutationFn: finances.expenses.update,
    onSuccess: ({ id }) => {
      invalidateUseListFinanceExpenses({ spaceId: id })
    }
  })
}
