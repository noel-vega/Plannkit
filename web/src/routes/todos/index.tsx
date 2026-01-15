import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getListTodosQueryOptions } from '@/features/todos/api'
import { CreateTodoDialog } from '@/features/todos/components/create-todo-dialog'
import type { Todo, TodoStatus } from '@/features/todos/types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

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
        <ul>
          {props.todos.map(x => (
            <li key={x.id}>
              <Card className="py-0 rounded hover:cursor-grab hover:bg-neutral-200 hover:border shadow-none">
                <CardContent className="p-4">
                  <div className="text-sm">{x.name}</div>
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
