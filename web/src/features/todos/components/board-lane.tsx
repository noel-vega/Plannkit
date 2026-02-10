import { useDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import type { Todo, TodoStatus } from "../types";
import { TodoCard } from "./todo-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreateTodoDialog } from "./create-todo-dialog";

type BoardLaneProps = {
  title: string,
  status: TodoStatus,
  todos: Todo[],
  showDropZone?: boolean,
  onTodoClick: (todo: Todo) => void,
  activeTodo: Todo | null
}

export function BoardLane(props: BoardLaneProps) {
  const createTodoDialog = useDialog()
  const { setNodeRef } = useDroppable({ id: props.status, data: { type: "lane", status: props.status } });
  const handleCreateBtnClick = () => createTodoDialog.onOpenChange(true)

  return (
    <>
      <div ref={setNodeRef} className={cn("w-72 border bg-gray-50 rounded")}>
        <div className="p-4 uppercase text-xs flex gap-2 justify-between">
          {props.title}
          <p className="bg-neutral-200 py-1 px-2 rounded shrink-0 border">{props.todos.length}</p>
        </div>

        <>
          <div className="px-1.5 pb-1.5 space-y-1">
            <ul className="space-y-1">
              {props.todos.map((todo, index) => {
                return (
                  <li key={todo.id}>
                    <TodoCard
                      activeTodo={props.activeTodo}
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
      </div>
      <CreateTodoDialog status={props.status} {...createTodoDialog} />
    </>
  )
}
