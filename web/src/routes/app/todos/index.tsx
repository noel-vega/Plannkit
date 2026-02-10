import { getBoardQueryOptions, getListTodosQueryOptions, invalidateGetBoardQuery, moveTodo } from '@/features/todos/api'
import { TodoCard } from '@/features/todos/components/todo-card'
import { DraggableTodoSchema, OverSchema, type Todo, type TodoStatus } from '@/features/todos/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';

import { useState } from 'react'

import { useDialog } from '@/hooks'
import { TodoInfoDialog } from '@/features/todos/components/todo-info-dialog'
import { generateKeyBetween } from 'fractional-indexing'
import { Page } from '@/components/layout/page'
import { BoardLane } from '@/features/todos/components/board-lane'

export const Route = createFileRoute('/app/todos/')({
  loader: async ({ context: { queryClient } }) => {
    const todos = await queryClient.ensureQueryData(getListTodosQueryOptions())
    const board = await queryClient.ensureQueryData(getBoardQueryOptions())
    return { todos, board }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const { data: board } = useQuery({ ...getBoardQueryOptions(), initialData: loaderData.board })
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [openTodo, setOpenTodo] = useState<Todo | null>(null)
  const todoDialog = useDialog()
  const queryClient = useQueryClient()

  const moveMutation = useMutation({
    mutationFn: moveTodo,
    onMutate: async (params) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['board'] })

      // Snapshot the previous value for rollback
      const previousBoard = queryClient.getQueryData(['board'])

      // Apply optimistic update
      queryClient.setQueryData(['board'], (oldBoard: typeof board) => {
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating
      }
    }),
  );


  function handleDragEnd(event: DragEndEvent) {
    // Clear overlay immediately when drop happens
    setActiveTodo(null)

    if (!event.over) {
      return
    };

    const active = DraggableTodoSchema.parse(event.active.data.current)
    const over = OverSchema.parse(event.over.data.current)

    if (over.type === "todo") {
      const activeIndex = active.index
      const overIndex = over.index
      const todos = board[over.todo.status]!
      const isSameLane = active.todo.status === over.todo.status

      // If dropping on itself in the same position, do nothing
      if (active.todo.id === over.todo.id) {
        return
      }

      let afterPosition = ""
      let beforePosition = ""
      let targetIndex = overIndex

      if (over.position === "before") {
        // Insert BEFORE the over card (top half)
        afterPosition = overIndex > 0 ? todos[overIndex - 1].position : ""
        beforePosition = over.todo.position
        targetIndex = overIndex

        // Adjust for same-lane removal
        if (isSameLane && activeIndex < overIndex) {
          targetIndex = overIndex - 1
        }
      } else {
        // Insert AFTER the over card (bottom half)
        afterPosition = over.todo.position
        beforePosition = todos[overIndex + 1]?.position ?? ""
        targetIndex = overIndex + 1

        // Adjust for same-lane removal
        if (isSameLane && activeIndex < overIndex) {
          targetIndex = overIndex
        } else if (isSameLane && activeIndex > overIndex) {
          targetIndex = overIndex + 1
        }
      }

      moveMutation.mutate({
        id: active.todo.id,
        status: over.todo.status,
        afterPosition,
        beforePosition,
        targetIndex
      })
    } else {
      // Dropping on empty lane
      const todos = board[over.status]
      moveMutation.mutate({
        id: active.todo.id,
        status: over.status,
        afterPosition: !todos ? "" : todos[todos.length - 1].position,
        beforePosition: "",
        targetIndex: todos?.length ?? 0
      })
    }
  }

  function handleDragStart({ active }: DragStartEvent) {
    const todo = active.data.current?.todo as Todo
    if (!todo) return
    setActiveTodo(todo)
  }

  function handleTodoClick(todo: Todo) {
    setOpenTodo(todo)
    todoDialog.onOpenChange(true)
  }

  return (
    <>
      <Page title="Tasks" className="space-y-4">
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="flex gap-4">
            <BoardLane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="Todo" status={"todo"} todos={board["todo"] ?? []} showDropZone={activeTodo && activeTodo.status !== "todo" ? true : false} />
            <BoardLane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="In Progress" status={"in-progress"} todos={board["in-progress"] ?? []} showDropZone={activeTodo && activeTodo.status !== "in-progress" ? true : false} />
            <BoardLane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="Done" status={"done"} todos={board["done"] ?? []} showDropZone={activeTodo && activeTodo.status !== "done" ? true : false} />
          </div>
          {activeTodo && (
            <DragOverlay>
              <TodoCard activeTodo={activeTodo} index={0} todo={activeTodo} className="shadow-lg hover:cursor-grabbing" />
            </DragOverlay>
          )}
        </DndContext>
      </Page>
      <TodoInfoDialog todo={openTodo} onClose={() => setOpenTodo(null)} />
    </>
  )
}
