import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getListTodosQueryOptions } from '@/features/todos/api'
import { CreateTodoDialog } from '@/features/todos/components/create-todo-dialog'
import type { Todo, TodoStatus } from '@/features/todos/types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { EllipsisIcon, PlusIcon } from 'lucide-react'

export const Route = createFileRoute('/todos/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery(getListTodosQueryOptions())
  const todos = data ?? []
  return (
    <div className="p-8">
      <div className="flex gap-4 ">
        <Lane title="Todo" status={"todo"} todos={todos.filter(x => x.status === "todo")} />
        <Lane title="In Progress" status={"in-progress"} todos={[]} />
        <Lane title="Done" status={"done"} todos={[]} />
      </div>
    </div>
  )
}

function Lane(props: { title: string, status: TodoStatus, todos: Todo[] }) {
  return (
    <div className="w-96 border bg-gray-50 rounded">
      <div className="p-4 uppercase text-xs">{props.title}</div>

      <div className="px-1.5 pb-1.5 space-y-1">
        <ul className="space-y-1">
          {props.todos.map(x => (
            <li key={x.id}>
              <Card className="rounded hover:cursor-grab hover:bg-neutral-100 hover:border shadow-none p-4 group">
                <CardHeader className="p-0">
                  <CardTitle className="flex w-full font-normal">
                    <p className="flex-1">{x.name}</p>
                    {/*Quick Todo Card Options */}
                    <div className="w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="hover:bg-neutral-200 rounded invisible group-hover:visible transition-none"><EllipsisIcon /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent >
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <div>
          <CreateTodoDialog status={props.status}>
            <Button variant="ghost" className="w-full justify-start hover:bg-neutral-200" ><PlusIcon /> <span>Create</span></Button>
          </CreateTodoDialog>
        </div>
      </div>
    </div>
  )
}
