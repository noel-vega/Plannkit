import { queryOptions, useMutation } from "@tanstack/react-query"
import { tasks } from "./api"
import { queryClient } from "@/lib/react-query"
import type { Board, Todo, TodoStatus } from "./types"
import { generateKeyBetween } from "fractional-indexing"

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

export function useCreateTodo() {
  return useMutation({
    mutationFn: tasks.create,
    onSuccess: async () => {
      await invalidateGetBoardQuery()
    }
  })
}

export function useMoveTodo() {
  return useMutation({
    mutationFn: tasks.move,
    onMutate: async (params) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['board'] })

      // Snapshot the previous value for rollback
      const previousBoard = queryClient.getQueryData(['board'])

      // Apply optimistic update
      queryClient.setQueryData(['board'], (oldBoard: Board) => {
        if (!oldBoard) return oldBoard

        // Find the todo by ID across all statuses
        let todo: Todo | undefined
        for (const status of Object.keys(oldBoard) as TodoStatus[]) {
          todo = oldBoard[status]?.find(t => t.id === params.id)
          if (todo) break
        }

        if (!todo) return oldBoard

        const newBoard = { ...oldBoard }

        // Remove from old status
        newBoard[todo.status] = newBoard[todo.status]?.filter(t => t.id !== params.id) ?? []

        // Calculate new position
        const newPosition = generateKeyBetween(
          params.afterPosition || null,
          params.beforePosition || null
        )

        // Add to new status with updated position
        const updatedTodo: Todo = {
          ...todo,
          status: params.status,
          position: newPosition
        }

        // Insert at specific index instead of sorting
        const targetLane = [...(newBoard[params.status] ?? [])]

        // Adjust target index if moving within same lane
        let insertIndex = params.targetIndex ?? targetLane.length
        if (todo.status === params.status && todo.id !== undefined) {
          // If moving within same lane, check if we need to adjust the index
          const originalIndex = oldBoard[todo.status]?.findIndex(t => t.id === todo.id) ?? -1
          if (originalIndex !== -1 && originalIndex < insertIndex) {
            // Item was removed from before the target position, so decrease index by 1
            insertIndex = Math.max(0, insertIndex - 1)
          }
        }

        targetLane.splice(insertIndex, 0, updatedTodo)
        newBoard[params.status] = targetLane

        return newBoard
      })

      // Return context for rollback
      return { previousBoard }
    },
    onError: (_err, _params, context) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(['board'], context.previousBoard)
      }
    },
    onSettled: () => {
      // Refetch to sync with server state
      invalidateGetBoardQuery()
    }
  })
}
