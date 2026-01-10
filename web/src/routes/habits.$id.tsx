import { getHabitByIdQueryOptions } from '@/api'
import { BackButton } from '@/components/BackButton'
import { ContributionsGrid } from '@/components/ContributionsGrid'
import { EditHabitDialog } from '@/components/EditHabitForm'
import { Button } from '@/components/ui/button'
import { queryClient } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getDayOfYear } from 'date-fns/getDayOfYear'
import { EditIcon } from 'lucide-react'
import z from 'zod/v3'

import { Calendar } from '@/components/ui/calendar'


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
  return <div className="px-3 lg:px-0 max-w-6xl mx-auto">
    <div>
      <div className="flex gap-8 items-center py-8">
        <BackButton to="/habits" />
        <h2 className="text-2xl font-semibold">{habit.name}</h2>
        <EditHabitDialog habit={habit}>
          <Button className="ml-auto">
            <EditIcon /> <span>Edit Habit</span>
          </Button>
        </EditHabitDialog>
      </div>
      <p>{!habit.description ? "No Description" : habit.description}</p>
    </div>

    <div className="py-4 mb-4">
      <ContributionsGrid habit={habit} contributions={contributions} />
    </div>

    <Calendar
      className="rounded-lg border shadow-sm w-full [--cell-size:theme(spacing.16)]"
    />
  </div>
}

