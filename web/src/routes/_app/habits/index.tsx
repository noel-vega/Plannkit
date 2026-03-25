import { createFileRoute } from '@tanstack/react-router'
import { CreateHabitDialogDrawer } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useDialog } from '@/hooks'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { useTranslation } from 'react-i18next'
import { getListHabitsQueryOptions, useListHabits, useListRoutinesQuery } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import { Container } from '@/components/layout/container'
import { CreateRoutineDialogDrawer } from '@/features/habits/components/create-routine-form'
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
  const { t } = useTranslation()
  const routines = useListRoutinesQuery()
  const { routines: routinesList, habits: ungroupedHabits } = routines.data

  return (
    <>
      <div className="text-lg font-medium flex items-center">
        <div className="h-px w-4.5 bg-border" />
        <p className="px-2">
          {t("My Daily Habits")}
        </p>
        <div className="h-px w-full flex-1 bg-border" />
      </div>

      <RoutineList routines={routinesList} ungroupedHabits={ungroupedHabits} />
    </>
  )
}

function Header() {
  const { t } = useTranslation()
  const createHabitDialog = useDialog()
  const createRoutineDialog = useDialog()
  return (
    <header >
      <div className="flex items-center gap-4 pb-2">
        <p className="hidden @md:block mr-auto font-medium">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <Button onClick={createRoutineDialog.handleOpenDialog} variant="secondary" className="flex-1 @md:flex-none">
          <PlusIcon /><span>{t("Routine")}</span>
        </Button>
        <Button variant="secondary" className="flex-1 @md:flex-none" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon /><span>{t("Habit")}</span>
        </Button>
        <CreateRoutineDialogDrawer {...createRoutineDialog} />
        <CreateHabitDialogDrawer {...createHabitDialog} />
      </div>
    </header>
  )
}
