import { createFileRoute, Link } from '@tanstack/react-router'
import { HabitCard } from '@/features/habits/components/habit-card'
import { CreateHabitDialogDrawer } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useDialog } from '@/hooks'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { Page } from '@/components/layout/page'
import { useTranslation } from 'react-i18next'
import { getListHabitsQueryOptions, useListHabits } from '@/features/habits/hooks'
import { WeekDayIndicator } from '@/features/habits/components/week-day-indicator'
import type { HabitWithContributions } from '@/features/habits/types'
import { Container } from '@/components/layout/container'

export const Route = createFileRoute('/app/habits/')({
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
      <Container className="max-w-6xl space-y-6 @container">
        <Header />
        <WeekDayIndicator habits={habits.data} />
        <TodaysProgress habits={habits.data} />
        <HabitsList habits={habits.data} />
      </Container>
    </Page>
  )
}

function HabitsList({ habits }: { habits: HabitWithContributions[] }) {
  return (
    <>
      <div className="text-lg font-medium flex items-center">
        <div className="h-px w-[18px] bg-border" />
        <p className="px-2">
          My Daily Habits
        </p>
        <div className="h-px w-full flex-1 bg-border" />
      </div>
      <ul className="space-y-4">
        {habits.map(habit => <li key={habit.id}>
          <Link key={habit.id} to="/app/habits/$id" params={{ id: habit.id }}>
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

    <header className="flex items-center gap-4 pb-2">
      <p className="hidden @md:block text-2xl mr-auto font-medium">
        {format(new Date(), 'EEEE, MMMM d')}
      </p>
      <Button variant="secondary" className="flex-1 @md:flex-none">
        <PlusIcon /><span>Routine</span>
      </Button>
      <Button variant="secondary" className="flex-1 @md:flex-none" onClick={createHabitDialog.handleOpenDialog}>
        <PlusIcon /><span>{t("Habit")}</span>
      </Button>
      <CreateHabitDialogDrawer {...createHabitDialog} />
    </header>
  )
}
