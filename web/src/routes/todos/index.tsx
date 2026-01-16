import { Button } from '@/components/ui/button'
import { getListTodosQueryOptions } from '@/features/todos/api'
import { CreateTodoDialog } from '@/features/todos/components/create-todo-dialog'
import { TodoCard } from '@/features/todos/components/todo-card'
import type { Todo, TodoStatus } from '@/features/todos/types'
import { useQuery } from '@tanstack/react-query'
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

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export const Route = createFileRoute('/todos/')({
  loader: async ({ context: { queryClient } }) => {
    const todos = await queryClient.ensureQueryData(getListTodosQueryOptions())
    return { todos }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const { data } = useQuery({ ...getListTodosQueryOptions(), initialData: loaderData.todos })
  const [todos, setTodos] = useState(data ?? [])

  useEffect(() => {
    setTodos(data ?? [])
  }, [data])

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating
      }
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTodo(null)
    if (!over) {
      return
    };

    const todo = findTodoById(active.id as number)
    if (!todo) {
      throw new Error("Could not find todo")
    }
    const sourceLaneId = todo.status;
    const overTodo = findTodoById(over.id as number);
    const targetLaneId: TodoStatus = overTodo
      ? overTodo.status           // Dropped over a card - use that card's lane
      : over.id as TodoStatus;


    if (!sourceLaneId || !targetLaneId) {
      return
    };


    setTodos(prev => {
      if (sourceLaneId === targetLaneId) {
        if (!overTodo) throw new Error("now over todo present")
        // reorder card in same lane
        const laneItems = prev.filter(t => t.status === sourceLaneId);
        const otherItems = prev.filter(t => t.status !== sourceLaneId);

        const oldIndex = laneItems.findIndex(t => t.id === todo.id);
        const newIndex = laneItems.findIndex(t => t.id === overTodo.id);

        const reordered = arrayMove(laneItems, oldIndex, newIndex);
        return [...otherItems, ...reordered];
      } else {
        const todos = prev.filter(x => {
          if (x.id !== todo.id) {
            return x
          }
        })
        todos.push({ ...todo, status: targetLaneId })
        return todos
      }
    })
  }

  function findTodoById(id: number) {
    return todos.find(x => x.id === id) ?? null
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTodo(findTodoById(active.id as number))
  }


  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="p-8 h-full w-full">
        <div className="flex gap-4">
          <Lane title="Todo" status={"todo"} todos={todos.filter(x => x.status === "todo")} showDropZone={activeTodo && activeTodo.status !== "todo" ? true : false} />
          <Lane title="In Progress" status={"in-progress"} todos={todos.filter(x => x.status === "in-progress")} showDropZone={activeTodo && activeTodo.status !== "in-progress" ? true : false} />
          <Lane title="Done" status={"done"} todos={todos.filter(x => x.status === "done")} showDropZone={activeTodo && activeTodo.status !== "done" ? true : false} />
        </div>
      </div>
      <DragOverlay>
        {activeTodo && (
          <TodoCard todo={activeTodo} className="shadow-lg hover:cursor-grabbing" isDragging={true} />
        )}
      </DragOverlay>
    </DndContext>
  )
}

type LaneProps = { title: string, status: TodoStatus, todos: Todo[], showDropZone?: boolean }

function Lane(props: LaneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: props.status, data: props });

  return (
    <SortableContext
      items={props.todos.map(t => t.id)}
      strategy={verticalListSortingStrategy}
    >

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
                {props.todos.map(todo => (
                  <li key={todo.id}>
                    <TodoCard todo={todo} />
                  </li>
                ))}
              </ul>
              <div>
                <CreateTodoDialog status={props.status}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-neutral-200" ><PlusIcon /> <span>Create</span></Button>
                </CreateTodoDialog>
              </div>
            </div>
          </>
        )}
      </div>
    </SortableContext>
  )
}
