import { BoardSchema, TodoSchema, type CreateTodoParams, type MoveTodoParams } from "./types"
import { pkFetch } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"

export const tasks = {
  create: async (params: CreateTodoParams) => {
    await pkFetch("/todos", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },
  getBoard: async () => {
    const response = await pkFetch("/todos/board")
    const json = await response.json()
    return BoardSchema.parse(json)
  },
  getById: async (id: number) => {
    const response = await pkFetch(`/todos/${id}`)
    const json = await response.json()
    return TodoSchema.parse(json)
  },
  list: async () => {
    const response = await pkFetch("/todos")
    const json = await response.json()
    return TodoSchema.array().parse(json)
  },
  delete: async (params: ByIdParams) => {
    await pkFetch(`/todos/${params.id}`, {
      method: "DELETE",
    })
  },
  move: async (params: MoveTodoParams) => {
    const { id, targetIndex, ...rest } = params
    console.log("MOVE TODO", params)
    await pkFetch(`/todos/${id}/position`, {
      method: "PATCH",
      body: JSON.stringify(rest), // Don't send targetIndex to server
    })
  }
}
