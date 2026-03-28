import { createFileRoute } from '@tanstack/react-router'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { getListHabitsQueryOptions, useListHabits, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { Suspense } from 'react'
import { HabitsList, RoutineList } from '@/features/habits/components/routine-list'

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
      <Container className="space-y-6 pt-8">
        <WeekDayIndicator habits={habits.data} />
        <TodaysProgress habits={habits.data} />
        <Suspense fallback="loading">
          <section className="space-y-8">
            <RoutineList routines={routinesList} />
            <HabitsList habits={ungroupedHabits} />
          </section>
        </Suspense>
      </Container>
    </Page>
  )
}
