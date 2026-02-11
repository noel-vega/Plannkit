import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { BoardLane } from "./board-lane";
import { TodoCard } from "./todo-card";
import { DraggableTodoSchema, OverSchema, type Board, type Todo } from "../types";
import { useMoveTodo } from "../hooks";
import { TodoInfoDialog } from "./todo-info-dialog";
import { useDialog } from "@/hooks";
import { useState } from "react";

type BoardProps = {
  board: Board
}
export function Board(props: BoardProps) {
  const { board } = props
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating
      }
    }),
  );
  const moveTodo = useMoveTodo()
  const todoDialog = useDialog()
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [openTodo, setOpenTodo] = useState<Todo | null>(null)

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

      moveTodo.mutate({
        id: active.todo.id,
        status: over.todo.status,
        afterPosition,
        beforePosition,
        targetIndex
      })
    } else {
      // Dropping on empty lane
      const todos = board[over.status]
      moveTodo.mutate({
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
      <TodoInfoDialog todo={openTodo} onClose={() => setOpenTodo(null)} />
    </>
  )
}
