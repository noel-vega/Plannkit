import { queryOptions } from "@tanstack/react-query"
import { TodoSchema, TodoStatusSchema, type CreateTodo, type TodoStatus } from "./types"
import { queryClient } from "@/lib/react-query"
import z from "zod/v3"


const BoardSchema = z.record(TodoStatusSchema, TodoSchema.array())

export async function getBoard() {
  const response = await fetch("/api/todos/board")
  const json = await response.json()
  return BoardSchema.parse(json)
}

export function getBoardQueryOptions() {
  return queryOptions({
    queryKey: ['board'],
    queryFn: getBoard
  })
}

export function invalidateGetBoardQuery() {
  return queryClient.invalidateQueries(getBoardQueryOptions())
}

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
  targetIndex?: number; // Optional - used for optimistic update only
}
export async function moveTodo(params: MoveTodoParams) {
  const { id, targetIndex, ...rest } = params
  console.log("MOVE TODO:", params)
  await fetch(`/api/todos/${id}/position`, {
    method: "PATCH",
    body: JSON.stringify(rest), // Don't send targetIndex to server
    headers: {
      "content-type": "application/json"
    }
  })

}
