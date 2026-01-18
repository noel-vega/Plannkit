import { createFileRoute, Link } from '@tanstack/react-router'
import { HabitCard } from '@/features/habits/components/habit-card'
import { CreateHabitDialog } from '@/features/habits/components/create-habit-form'
import { Button } from '@/components/ui/button'
import { PlusIcon, SunIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getListHabitsQueryOptions } from '@/features/habits/api'
import { useDialog } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { TodaysProgress } from '@/features/habits/components/today-progress'

export const Route = createFileRoute('/habits/')({
  loader: async ({ context: { queryClient } }) => {
    const habits = await queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { habits }
  },
  component: Page,
})

function Page() {
  const loaderData = Route.useLoaderData()
  const habits = useQuery({ ...getListHabitsQueryOptions(), initialData: loaderData.habits })
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <Header />
      <div className="py-8">
        <TodaysProgress habits={habits.data} />
      </div>

      <ul className="space-y-4">
        {habits.data.map(habit => <li key={habit.id}>
          <Link key={habit.id} to="/habits/$id" params={{ id: habit.id }}>
            <HabitCard habit={habit} />
          </Link>
        </li>)}
      </ul>
    </div >
  )
}

function HabitGroup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <SunIcon />
            <span>Morning Routine</span>
          </div>
        </CardTitle>

      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  )
}

function Header() {
  const createHabitDialog = useDialog()
  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          {format(new Date(), 'EEEE, MMMM d')}
        </div>
        <Button onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon /><span>Add Habit</span>
        </Button>
      </header>
      <CreateHabitDialog {...createHabitDialog} />
    </>
  )
}
