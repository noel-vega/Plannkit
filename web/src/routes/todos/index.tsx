import { Card, CardContent } from '@/components/ui/card'
import { getListTodosQueryOptions } from '@/features/todos/api'
import type { Todo } from '@/features/todos/types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

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
    <div className="w-96 border bg-accent rounded">
      <div className="p-4 uppercase text-xs">{props.title}</div>

      <div className="px-1.5 pb-1.5">
        {props.todos.map(x => (
          <Card className="py-0 rounded hover:cursor-grab">
            <CardContent className="p-4">
              <div className="text-sm">{x.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
