import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { getListHabitsQueryOptions, useListHabits, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { Suspense } from 'react'
import { RoutineList } from '@/features/habits/components/routine-list'

export const Route = createFileRoute('/_app/habits/')({
  loader: async ({ context: { queryClient } }) => {
    const habits = await queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { habits }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const habits = useListHabits({ initialData: loaderData.habits })
  const routines = useListRoutinesQuery()
  const { routines: routinesList, habits: ungroupedHabits } = routines.data
  return (
    <Page>
      <Container className="space-y-6">
        <header>
          <p className="font-medium">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </header>
        <WeekDayIndicator habits={habits.data} />
        <TodaysProgress habits={habits.data} />
        <Suspense fallback="loading">
          <RoutineList routines={routinesList} ungroupedHabits={ungroupedHabits} />
        </Suspense>
      </Container>
    </Page>
  )
}
