import { getHabitByIdQueryOptions } from '@/api'
import { ContributionsGrid } from '@/components/ContributionsGrid'
import { Button } from '@/components/ui/button'
import { queryClient } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getDayOfYear } from 'date-fns/getDayOfYear'
import { MoveLeftIcon } from 'lucide-react'
import z from 'zod/v3'

export const Route = createFileRoute('/habits/$id')({
  params: {
    parse: z.object({ id: z.coerce.number() }).parse
  },
  beforeLoad: async ({ params }) => {
    const habit = await queryClient.ensureQueryData(getHabitByIdQueryOptions(params))
    return { habit }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const rtContext = Route.useRouteContext()

  const { data: habit } = useQuery({ ...getHabitByIdQueryOptions(params), initialData: rtContext.habit })


  const contributions = new Map(habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  return <div className="max-w-7xl mx-auto">
    <div>
      <div className="flex gap-3 items-center py-8">
        <Link to="/habits">
          <Button variant="outline" size="icon">
            <MoveLeftIcon />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold">{habit.name}</h2>
      </div>
      <p>{!habit.description ? "No Description" : habit.description}</p>
    </div>
    <div className="py-4">
      <ContributionsGrid contributions={contributions} />
    </div>
  </div>
}
