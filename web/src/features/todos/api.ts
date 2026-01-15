import { queryOptions } from "@tanstack/react-query"
import { TodoSchema, type CreateTodo } from "./types"

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

export async function createTodo(params: CreateTodo) {
  await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "content-type": "application/json"
    }
  })
}
