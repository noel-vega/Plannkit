import { createFileRoute } from '@tanstack/react-router'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { getListRoutinesQueryOptions, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { Suspense } from 'react'
import { HabitsList, RoutineList } from '@/features/habits/components/routine-list'
import { EmptyHabits } from '@/features/habits/components/empty-habits'

export const Route = createFileRoute('/_app/habits/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getListRoutinesQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: { routines, habits } } = useListRoutinesQuery()
  const allHabits = [...habits, ...routines.flatMap(x => x.habits)]
  const isEmpty = routines.length === 0 && habits.length === 0

  return (
    <Page>
      <Container className="space-y-6 pt-8">
        <WeekDayIndicator habits={allHabits} />
        <TodaysProgress habits={allHabits} />
        <Suspense fallback="loading">
          {isEmpty ? (
            <EmptyHabits />
          ) : (
            <section className="space-y-8">
              <RoutineList routines={routines} />
              <HabitsList habits={habits} />
            </section>
          )}
        </Suspense>
      </Container>
    </Page>
  )
}


