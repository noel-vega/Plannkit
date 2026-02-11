import { queryOptions } from "@tanstack/react-query"
import { tasks } from "./api"
import { queryClient } from "@/lib/react-query"

export function getBoardQueryOptions() {
  return queryOptions({
    queryKey: ['board'],
    queryFn: tasks.getBoard
  })
}

export function invalidateGetBoardQuery() {
  return queryClient.invalidateQueries(getBoardQueryOptions())
}

export function getListTodosQueryOptions() {
  return queryOptions({
    queryFn: tasks.list,
    queryKey: ["todos"]
  })
}

export async function invalidateListTodosQuery() {
  return queryClient.invalidateQueries(getListTodosQueryOptions())
}
