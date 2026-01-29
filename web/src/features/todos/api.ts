import { queryOptions } from "@tanstack/react-query"
import { TodoSchema, TodoStatusSchema, type CreateTodo, type TodoStatus } from "./types"
import { queryClient } from "@/lib/react-query"
import z from "zod/v3"
import { getHeaders } from "@/lib/utils"

const BoardSchema = z.record(TodoStatusSchema, TodoSchema.array())

export async function getBoard() {
  const headers = getHeaders()
  const response = await fetch("/api/todos/board", { headers })
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
  const headers = getHeaders()
  const res = await fetch(`/api/todos/${id}`, { headers })
  const json = await res.json()
  return TodoSchema.parse(json)
}

export async function listTodos() {
  const headers = getHeaders()
  const res = await fetch("/api/todos", { headers })
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
  const headers = getHeaders()
  await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify(params),
    headers
  })
}

export async function deleteTodo(params: { id: number }) {
  const headers = getHeaders()
  await fetch(`/api/todos/${params.id}`, {
    method: "DELETE",
    headers
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
  const headers = getHeaders()
  const { id, targetIndex, ...rest } = params
  await fetch(`/api/todos/${id}/position`, {
    method: "PATCH",
    body: JSON.stringify(rest), // Don't send targetIndex to server
    headers
  })

}
