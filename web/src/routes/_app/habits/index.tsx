import { createFileRoute } from '@tanstack/react-router'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { getListRoutinesQueryOptions, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { Suspense } from 'react'
import { HabitsList, RoutineList } from '@/features/habits/components/routine-list'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { SparklesIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDialog } from '@/hooks'
import { CreateRoutineDialogDrawer } from '@/features/habits/components/create-routine-form'
import { CreateHabitDialogDrawer } from '@/features/habits/components/create-habit-form'
import { useTranslation } from 'react-i18next'

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
            <EmptyHabitsPage />
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

function EmptyHabitsPage() {
  const { t } = useTranslation()
  const createRoutineDialog = useDialog()
  const createHabitDialog = useDialog()

  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SparklesIcon />
        </EmptyMedia>
        <EmptyTitle>{t("Start building your daily habits")}</EmptyTitle>
        <EmptyDescription>{t("Create a routine to group related habits, or add a standalone habit to start tracking your progress.")}</EmptyDescription>
      </EmptyHeader>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={createRoutineDialog.handleOpenDialog}>
          <PlusIcon className="size-3.5" />
          {t("Create routine")}
        </Button>
        <Button variant="outline" size="sm" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon className="size-3.5" />
          {t("Create habit")}
        </Button>
      </div>
      <CreateRoutineDialogDrawer {...createRoutineDialog} />
      <CreateHabitDialogDrawer {...createHabitDialog} />
    </Empty>
  )
}

