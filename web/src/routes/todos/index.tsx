import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getListTodosQueryOptions } from '@/features/todos/api'
import type { Todo } from '@/features/todos/types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

export const Route = createFileRoute('/todos/')({
  component: RouteComponent,
})

const dummyTodos: Todo[] = [
  {
    id: 1,
    name: "Noah doctors appointment",
    description: "Sample description",
    status: "todo"
  }
]

function RouteComponent() {
  const { data } = useQuery(getListTodosQueryOptions())
  console.log(data)
  return (
    <div className="p-8">
      <div className="flex gap-4 ">
        <Lane title="Todo" todos={dummyTodos.filter(x => x.status === "todo")} />
        <Lane title="In Progress" todos={[]} />
        <Lane title="Done" todos={[]} />
      </div>
    </div>
  )
}

function Lane(props: { title: string, todos: Todo[] }) {
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
          <Button variant="ghost" className="w-full justify-start hover:bg-neutral-200" ><PlusIcon /> <span>Create</span></Button>
        </div>
      </div>
    </div>
  )
}
