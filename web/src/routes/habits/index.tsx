import { createFileRoute, Link } from '@tanstack/react-router'
import { HabitCard } from '@/features/habits/components/habit-card'
import { CreateHabitDialog } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getListHabitsQueryOptions } from '@/features/habits/api'
import { useDialog } from '@/hooks'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'
import { WeekdayIndicator } from '@/features/habits/components/week-day-indicator'
import { Page } from '@/components/page'

export const Route = createFileRoute('/habits/')({
  loader: async ({ context: { queryClient } }) => {
    const habits = await queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { habits }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const habits = useQuery({ ...getListHabitsQueryOptions(), initialData: loaderData.habits })
  return (
    <Page title="Habits">
      <div className="max-w-5xl space-y-6">
        <Header />
        <WeekdayIndicator habits={habits.data} />

        {habits.data.length === 0 ? (
          <div className="bg-secondary border rounded p-8">
            <p>Add your first habit to get started!</p>
          </div>
        ) : (
          <>
            <TodaysProgress habits={habits.data} />

            <ul className="space-y-4">
              {habits.data.map(habit => <li key={habit.id}>
                <Link key={habit.id} to="/habits/$id" params={{ id: habit.id }}>
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


function Header() {
  const createHabitDialog = useDialog(true)
  return (
    <>
      <header className="flex items-center gap-4 pb-2">
        <p className="text-2xl mr-auto font-medium">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <Button variant="secondary">
          <PlusIcon /><span>Routine</span>
        </Button>
        <Button variant="secondary" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon /><span>Habit</span>
        </Button>
      </header>
      <CreateHabitDialog {...createHabitDialog} />
    </>
  )
}
