import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { finances } from "./api";
import type { Expense, FinanceSpace } from "./types";
import type { ByIdParams } from "../habits/types";
import { queryClient } from "@/lib/react-query";

export function getUseListFinanceSpacesOptions() {
  return queryOptions({
    queryKey: ["finance-spaces-list"],
    queryFn: finances.listSpaces
  })
}

export async function invalidateUseListFinanceSpaces() {
  return queryClient.invalidateQueries(getUseListFinanceSpacesOptions())
}

export function useListFinanceSpaces({ initialData }: { initialData: FinanceSpace[] }) {
  return useQuery({ ...getUseListFinanceSpacesOptions(), initialData })
}

export function getUseListFinanceExpensesOptions(params: ByIdParams) {
  return queryOptions({
    queryKey: ["finance-space-expenses"],
    queryFn: () => finances.listExpenses(params)
  })
}

export function useListFinanceExpenses({ spaceId, initialData }: { spaceId: number, initialData?: Expense[] }) {
  return useQuery({ ...getUseListFinanceExpensesOptions({ id: spaceId }), initialData })
}

export function useCreateFinanceSpace() {
  return useMutation({
    mutationFn: finances.createSpace,
    onSuccess: () => {
      console.log("SUCCESS")
      invalidateUseListFinanceSpaces()
    }
  })
}
