import { queryOptions, useQuery } from "@tanstack/react-query";
import { finances } from "./api";
import type { Expense, FinanceSpace } from "./types";
import type { ByIdParams } from "../habits/types";

export function getUseListFinanceSpacesOptions() {
  return queryOptions({
    queryKey: ["finance-spaces-list"],
    queryFn: finances.listSpaces
  })
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
