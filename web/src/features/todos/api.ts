import { queryOptions } from "@tanstack/react-query"
import { TodoSchema } from "./types"

export async function listTodos() {
  const res = await fetch("/api/todos")
  const json = await res.json()
  return TodoSchema.array().parse(json)
}

export function getListTodosQueryOptions() {
  return queryOptions({
    queryFn: listTodos,
    queryKey: ["todos"]
  })
}
