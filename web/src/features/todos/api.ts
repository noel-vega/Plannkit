import { queryOptions } from "@tanstack/react-query"
import { TodoSchema, type CreateTodo, type TodoStatus } from "./types"
import { queryClient } from "@/lib/react-query"

export async function getTodoById(id: number) {
  const res = await fetch(`/api/todos/${id}`)
  const json = await res.json()
  return TodoSchema.parse(json)
}

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

export async function deleteTodo(params: { id: number }) {
  await fetch(`/api/todos/${params.id}`, {
    method: "DELETE",
  })
}

type MoveTodoParams = {
  id: number;
  status: TodoStatus;
  afterPosition: string;
  beforePosition: string;
}
export async function moveTodo(params: MoveTodoParams) {
  const { id, ...rest } = params
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(rest),
    headers: {
      "content-type": "application/json"
    }
  })

}
