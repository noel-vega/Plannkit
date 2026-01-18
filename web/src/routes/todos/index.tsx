import { Button } from '@/components/ui/button'
import { getBoardQueryOptions, getListTodosQueryOptions, invalidateGetBoardQuery, moveTodo } from '@/features/todos/api'
import { CreateTodoDialog } from '@/features/todos/components/create-todo-dialog'
import { TodoCard } from '@/features/todos/components/todo-card'
import { TodoSchema, TodoStatusSchema, type Todo, type TodoStatus } from '@/features/todos/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';

import { useState } from 'react'
import { cn } from '@/lib/utils'

import { useDialog } from '@/hooks'
import { TodoInfoDialog } from '@/features/todos/components/todo-info-dialog'
import z from 'zod/v3'
import { generateKeyBetween } from 'fractional-indexing'

export const Route = createFileRoute('/todos/')({
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

  const DraggableTodoSchema = z.object({
    type: z.literal("todo"),
    todo: TodoSchema,
    index: z.number()
  })

  const DroppableLaneSchema = z.object({
    type: z.literal("lane"),
    status: TodoStatusSchema
  })

  const DroppableTodoSchema = z.object({
    type: z.literal("todo"),
    todo: TodoSchema,
    index: z.number(),
    position: z.enum(["before", "after"])
  })

  const OverSchema = z.discriminatedUnion("type", [DroppableTodoSchema, DroppableLaneSchema])

  function handleDragEnd(event: DragEndEvent) {
    // Clear overlay immediately when drop happens
    setActiveTodo(null)
    
    if (!event.over) {
      console.log("no over")
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
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="p-8 h-full w-full">
          <div className="flex gap-4">
            <Lane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="Todo" status={"todo"} todos={board["todo"] ?? []} showDropZone={activeTodo && activeTodo.status !== "todo" ? true : false} />
            <Lane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="In Progress" status={"in-progress"} todos={board["in-progress"] ?? []} showDropZone={activeTodo && activeTodo.status !== "in-progress" ? true : false} />
            <Lane activeTodo={activeTodo} onTodoClick={handleTodoClick} title="Done" status={"done"} todos={board["done"] ?? []} showDropZone={activeTodo && activeTodo.status !== "done" ? true : false} />
          </div>
        </div>
        {activeTodo && (
          <DragOverlay>
            <TodoCard index={0} todo={activeTodo} className="shadow-lg hover:cursor-grabbing" />
          </DragOverlay>
        )}
      </DndContext>

      <TodoInfoDialog todo={openTodo} onClose={() => setOpenTodo(null)} />
    </>
  )
}

type LaneProps = { title: string, status: TodoStatus, todos: Todo[], showDropZone?: boolean, onTodoClick: (todo: Todo) => void, activeTodo: Todo | null }

function Lane(props: LaneProps) {
  const createTodoDialog = useDialog()
  const { setNodeRef, isOver } = useDroppable({ id: props.status, data: { type: "lane", status: props.status } });
  const handleCreateBtnClick = () => createTodoDialog.onOpenChange(true)

  return (
    <>
      <div ref={setNodeRef} className={cn("w-72 border bg-gray-50 rounded")}>
        <div className="p-4 uppercase text-xs flex gap-2 justify-between">
          {props.title}
          <p className="bg-neutral-200 py-1 px-2 rounded shrink-0 border">{props.todos.length}</p>
        </div>
        {props.showDropZone && (
          <div className={cn("h-40 border border-blue-500 flex items-center justify-center bg-blue-500/10", {
            "bg-blue-500/20": isOver
          })}>
            <p className="border border-blue-500 p-2 rounded text-xs font-bold">{props.title}</p>
          </div>
        )}

        {!props.showDropZone && (
          <>
            <div className="px-1.5 pb-1.5 space-y-1">
              <ul className="space-y-1">
                {props.todos.map((todo, index) => {
                  const activeIndex = props.activeTodo && props.activeTodo.status === props.status 
                    ? props.todos.findIndex(t => t.id === props.activeTodo?.id)
                    : -1;
                  return (
                    <li key={todo.id}>
                      <TodoCard 
                        activeTodo={props.activeTodo} 
                        activeIndex={activeIndex}
                        index={index} 
                        todo={todo} 
                        onClick={() => props.onTodoClick(todo)} 
                      />
                    </li>
                  );
                })}
              </ul>
              <div>
                <Button variant="ghost" className="w-full justify-start hover:bg-neutral-200" onClick={handleCreateBtnClick}>
                  <PlusIcon />
                  <span>Create</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <CreateTodoDialog status={props.status} {...createTodoDialog} />
    </>
  )
}


