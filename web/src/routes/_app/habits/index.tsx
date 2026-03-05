import { createFileRoute, Link } from '@tanstack/react-router'
import { HabitCard } from '@/features/habits/components/habit-card'
import { CreateHabitDialogDrawer } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon, SproutIcon } from 'lucide-react'
import { useDialog } from '@/hooks'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { useTranslation } from 'react-i18next'
import { getListHabitsQueryOptions, useListHabits } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import type { HabitWithContributions } from '@/features/habits/types'
import { Container } from '@/components/layout/container'

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
    <Page title="Habits">
      <div className="border-b py-4 px-8">
        <div className="flex items-center gap-6">
          <SproutIcon />
          <h2 className="text-2xl font-semibold">Habits</h2>
        </div>
      </div>
      <Container className="space-y-6">
        <Header />
        <WeekDayIndicator habits={habits.data} />
        <TodaysProgress habits={habits.data} />
        <HabitsList habits={habits.data} />
      </Container>
    </Page>
  )
}

function HabitsList({ habits }: { habits: HabitWithContributions[] }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="text-lg font-medium flex items-center">
        <div className="h-px w-4.5 bg-border" />
        <p className="px-2">
          {t("My Daily Habits")}
        </p>
        <div className="h-px w-full flex-1 bg-border" />
      </div>
      <ul className="space-y-4">
        {habits.map(habit => <li key={habit.id}>
          <Link key={habit.id} to="/habits/$id" params={{ id: habit.id }}>
            <HabitCard habit={habit} />
          </Link>
        </li>)}
      </ul>
    </>
  )
}

function Header() {
  const { t } = useTranslation()
  const createHabitDialog = useDialog()
  return (

    <header >
      <div className="flex items-center gap-4 pb-2">
        <p className="hidden @md:block text-lg mr-auto font-medium">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <Button variant="secondary" className="flex-1 @md:flex-none">
          <PlusIcon /><span>{t("Routine")}</span>
        </Button>
        <Button variant="secondary" className="flex-1 @md:flex-none" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon /><span>{t("Habit")}</span>
        </Button>
        <CreateHabitDialogDrawer {...createHabitDialog} />
      </div>
    </header>
  )
}
