import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EllipsisIcon } from "lucide-react"
import type { Todo } from "@/features/todos/types"
import { useMutation } from "@tanstack/react-query"
import type { MouseEvent, PropsWithChildren } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { tasks } from "../api"
import { invalidateGetBoardQuery } from "../hooks"

type Props = {
  todo: Todo
  index: number
  className?: string
  isDragging?: boolean
  onClick?: () => void
  activeTodo: Todo | null
}

export function TodoCard(props: Props) {

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging
  } = useDraggable({
    id: `draggable-${props.todo.id}`,
    data: { type: "todo", todo: props.todo, index: props.index }
  });

  // Two droppable zones: one for top half (insert before), one for bottom half (insert after)
  const { setNodeRef: setDroppableTopRef, isOver: isOverTop } = useDroppable({
    id: `droppable-top-${props.todo.id}`,
    data: { type: "todo", todo: props.todo, index: props.index, position: "before" }
  });

  const { setNodeRef: setDroppableBottomRef, isOver: isOverBottom } = useDroppable({
    id: `droppable-bottom-${props.todo.id}`,
    data: { type: "todo", todo: props.todo, index: props.index, position: "after" }
  });

  const style = {
    opacity: 1  // Keep card visible even when dragging
  };

  // Only show drop zones when something is being dragged
  const showDropZones = props.activeTodo !== null;

  return (
    <div className="relative">
      {/* Top drop zone - insert BEFORE this card - only active during drag */}
      {showDropZones && (
        <div ref={setDroppableTopRef} className="absolute top-0 left-0 right-0 h-1/2 z-20" />
      )}

      {/* Bottom drop zone - insert AFTER this card - only active during drag */}
      {showDropZones && (
        <div ref={setDroppableBottomRef} className="absolute bottom-0 left-0 right-0 h-1/2 z-20" />
      )}

      {/* Drop indicators */}
      {isOverTop && !isDragging && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}
      {isOverBottom && !isDragging && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}

      <Card
        ref={setDraggableRef} style={style} {...attributes} {...listeners}
        onClick={props.onClick}
        className={cn("transition-none rounded hover:cursor-pointer hover:bg-secondary hover:border hover:shadow hover:border-muted-foreground shadow-none p-4 group", props.className)}>
        <CardHeader className="p-0">
          <CardTitle className="flex w-full font-normal items-center">
            <p className="flex-1">{props.todo.name}</p>
            {/*Quick Todo Card Options */}
            <div className="w-10">
              <TodoCardOptionsDropdown id={props.todo.id}>
                <Button variant="ghost" size="icon-sm" className={cn("hover:bg-neutral-200 rounded invisible  transition-none", {
                  "invisible": props.isDragging,
                  "group-hover:visible": !props.isDragging
                })}>
                  <EllipsisIcon />
                </Button>
              </TodoCardOptionsDropdown>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
        </CardContent>
      </Card>
    </div>
  )
}

function TodoCardOptionsDropdown({ id, children }: { id: number } & PropsWithChildren) {
  const deleteTodoMutation = useMutation({
    mutationFn: tasks.delete,
    onSuccess: () => {
      invalidateGetBoardQuery()
    }
  })

  const handleDeleteTodo = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteTodoMutation.mutate({ id })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onClick={handleDeleteTodo}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
