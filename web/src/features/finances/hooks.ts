import { queryOptions, useQuery } from "@tanstack/react-query";
import { finances, type FinanceSpace } from "./api";

export function getUseListFinanceSpacesQueryOptions() {
  return queryOptions({
    queryKey: ["finance-spaces-list"],
    queryFn: finances.listSpaces
  })
}

export function useListFinanceSpaces({ initialData }: { initialData: FinanceSpace[] }) {
  return useQuery({ ...getUseListFinanceSpacesQueryOptions(), initialData })

}
