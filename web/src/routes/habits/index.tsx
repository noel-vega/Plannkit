import { createFileRoute } from '@tanstack/react-router'
import { HabitCardList } from '@/features/habits/components/HabitCard'
import { CreateHabitDialog } from '@/features/habits/components/CreateHabitForm'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getListHabitsQueryOptions } from '@/features/habits/api'

export const Route = createFileRoute('/habits/')({
  loader: async ({ context: { queryClient } }) => {
    return await queryClient.ensureQueryData(getListHabitsQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const initialHabits = Route.useLoaderData()
  const habits = useQuery({ ...getListHabitsQueryOptions(), initialData: initialHabits })
  return (
    <div className="p-8 max-w-6xl w-full">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Habits</h1>
        <CreateHabitDialog>
          <Button>
            <PlusIcon /><span>Add Habit</span>
          </Button>
        </CreateHabitDialog>
      </header>
      <HabitCardList habits={habits.data} />
    </div >
  )
}
