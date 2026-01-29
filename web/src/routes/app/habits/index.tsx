import { createFileRoute, Link } from '@tanstack/react-router'
import { HabitCard } from '@/features/habits/components/habit-card'
import { CreateHabitDialogDrawer } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getListHabitsQueryOptions } from '@/features/habits/api'
import { useDialog } from '@/hooks'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { WeekdayIndicator } from '@/features/habits/components/week-day-indicator'
import { Page } from '@/components/layout/page'
import { useTranslation } from 'react-i18next'


export const Route = createFileRoute('/app/habits/')({
  loader: async ({ context: { queryClient } }) => {
    const habits = await queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { habits }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const loaderData = Route.useLoaderData()
  const habits = useQuery({ ...getListHabitsQueryOptions(), initialData: loaderData.habits })

  const createHabitDialog = useDialog()
  return (
    <Page title="Habits">
      <div className="max-w-5xl space-y-6 @container">
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
        </header>
        <CreateHabitDialogDrawer {...createHabitDialog} />
        <div className="@xl:hidden">
          <WeekdayIndicator habits={habits.data} day={new Date()} around={1} />
        </div>
        <div className="hidden @xl:block @4xl:hidden">
          <WeekdayIndicator habits={habits.data} day={new Date()} around={2} />
        </div>
        <div className="hidden @4xl:block">
          <WeekdayIndicator habits={habits.data} day={new Date()} around={3} />
        </div>

        {habits.data.length === 0 ? (
          <div className="bg-secondary border rounded p-8">
            <p>Add your first habit to get started!</p>
          </div>
        ) : (
          <>
            <TodaysProgress habits={habits.data} />
            <div className="text-lg font-medium flex items-center">
              <div className="h-px w-[18px] bg-border" />
              <p className="px-2">
                My Daily Habits
              </p>
              <div className="h-px w-full flex-1 bg-border" />
            </div>
            <ul className="space-y-4">
              {habits.data.map(habit => <li key={habit.id}>
                <Link key={habit.id} to="/app/habits/$id" params={{ id: habit.id }}>
                  <HabitCard habit={habit} />
                </Link>
              </li>)}
            </ul>
          </>
        )}
      </div>
    </Page>
  )
}
