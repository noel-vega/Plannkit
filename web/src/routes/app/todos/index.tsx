import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Page } from '@/components/layout/page'
import { getBoardQueryOptions, getListTodosQueryOptions } from '@/features/todos/hooks';
import { Board } from '@/features/todos/components/board';

export const Route = createFileRoute('/app/todos/')({
  loader: async ({ context: { queryClient } }) => {
    const todos = await queryClient.ensureQueryData(getListTodosQueryOptions())
    const board = await queryClient.ensureQueryData(getBoardQueryOptions())
    return { todos, board }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const board = useQuery({ ...getBoardQueryOptions(), initialData: loaderData.board })
  return (
    <Page title="Tasks" className="space-y-4">
      <div className="max-w-5xl w-full">
        <Board board={board.data} />
      </div>
    </Page>
  )
}
