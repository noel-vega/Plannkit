import { queryOptions } from "@tanstack/react-query"
import { TodoSchema, type CreateTodo } from "./types"
import { queryClient } from "@/lib/react-query"

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

export async function invalidateListTodosQuery() {
  return queryClient.invalidateQueries(getListTodosQueryOptions())
}

export async function createTodo(params: CreateTodo) {
  await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "content-type": "application/json"
    }
  })
}
