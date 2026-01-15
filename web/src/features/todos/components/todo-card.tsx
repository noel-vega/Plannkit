import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EllipsisIcon } from "lucide-react"
import type { Todo } from "@/features/todos/types"
import { deleteTodo, invalidateListTodosQuery } from "@/features/todos/api"
import { useMutation } from "@tanstack/react-query"

type Props = {
  todo: Todo
}

export function TodoCard({ todo }: Props) {

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      invalidateListTodosQuery()
    }
  })

  const handleDeleteTodo = () => {
    deleteTodoMutation.mutate({ id: todo.id })
  }
  return (

    <Card className="rounded hover:cursor-pointer hover:bg-neutral-100 hover:border shadow-none p-4 group">
      <CardHeader className="p-0">
        <CardTitle className="flex w-full font-normal">
          <p className="flex-1">{todo.name}</p>
          {/*Quick Todo Card Options */}
          <div className="w-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="hover:bg-neutral-200 rounded invisible group-hover:visible transition-none">
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={handleDeleteTodo}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent >
      </CardContent>
    </Card>
  )
}
