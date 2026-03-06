import { BoardSchema, TodoSchema, type CreateTodoParams, type MoveTodoParams } from "./types"
import { api } from "@/lib/plannkit-api-client"
import type { ByIdParams } from "../habits/types"

export const tasks = {
  create: async (params: CreateTodoParams) => {
    return await api.POST("/todos", params)
  },
  getBoard: async () => {
    const response = await api.GET("/todos/board")
    const json = await response.json()
    return BoardSchema.parse(json)
  },
  getById: async (id: number) => {
    const response = await api.GET(`/todos/${id}`)
    const json = await response.json()
    return TodoSchema.parse(json)
  },
  list: async () => {
    const response = await api.GET("/todos")
    const json = await response.json()
    return TodoSchema.array().parse(json)
  },
  delete: async (params: ByIdParams) => {
    return await api.DELETE(`/todos/${params.id}`)
  },
  move: async (params: MoveTodoParams) => {
    const { id, targetIndex, ...data } = params
    return await api.PATCH(`/todos/${id}/position`, data)
  }
}
