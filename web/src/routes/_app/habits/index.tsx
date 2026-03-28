import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { getListHabitsQueryOptions, useListHabits, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { Suspense } from 'react'
import { RoutineListV2 } from '@/features/habits/components/routine-list-v2'

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
  return (
    <Page>
      <Container className="space-y-6">
        <Header />
        <WeekDayIndicator habits={habits.data} />
        <TodaysProgress habits={habits.data} />
        <Suspense fallback="loading">
          <HabitsList />
        </Suspense>
      </Container>
    </Page>
  )
}

function HabitsList() {
  const routines = useListRoutinesQuery()
  const { routines: routinesList, habits: ungroupedHabits } = routines.data

  return (
    <RoutineListV2 routines={routinesList} ungroupedHabits={ungroupedHabits} />
  )
}

function Header() {
  return (
    <header>
      <p className="font-medium">
        {format(new Date(), 'EEEE, MMMM d')}
      </p>
    </header>
  )
}
