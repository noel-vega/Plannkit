import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EllipsisIcon } from "lucide-react"
import type { Todo } from "@/features/todos/types"
import { deleteTodo, invalidateListTodosQuery } from "@/features/todos/api"
import { useMutation } from "@tanstack/react-query"
import type { PropsWithChildren } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils"

type Props = {
  todo: Todo
  className?: string
  isDragging?: boolean
}

export function TodoCard(props: Props) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1

  };

  return (
    <Card
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={cn("rounded hover:cursor-pointer hover:bg-neutral-100 hover:border shadow-none p-4 group", props.className)}>
      <CardHeader className="p-0">
        <CardTitle className="flex w-full font-normal">
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
    </Card>
  )
}

function TodoCardOptionsDropdown({ id, children }: { id: number } & PropsWithChildren) {
  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      invalidateListTodosQuery()
    }
  })

  const handleDeleteTodo = () => {
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
