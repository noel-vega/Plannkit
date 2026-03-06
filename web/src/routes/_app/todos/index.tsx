import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Page } from '@/components/layout/page'
import { getBoardQueryOptions, getListTodosQueryOptions } from '@/features/todos/hooks';
import { Board } from '@/features/todos/components/board';
import { Container } from '@/components/layout/container';
import { ListIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/todos/')({
  head: () => ({ meta: [{ title: "Tasks" }] }),
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
      <div className="border-b py-2 px-8">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold">Tasks</h2>
        </div>
      </div>
      <Container className="w-full">
        <Board board={board.data} />
      </Container>
    </Page>
  )
}
