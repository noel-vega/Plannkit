import { createFileRoute } from '@tanstack/react-router'
import { HabitCardList } from '@/components/HabitCard'
import { Suspense } from 'react'
import { queryClient } from '@/lib/react-query'
import { getListHabitsQueryOptions } from '@/api'
import { CreateHabitDialog } from '@/components/CreateHabitForm'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export const Route = createFileRoute('/habits/')({
  beforeLoad: () => {
    const today = new Date();
    queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { today }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-3 md:px-0">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center py-8">
          <h1 className="text-2xl font-semibold">Habits</h1>
          <CreateHabitDialog>
            <Button size="sm">
              <PlusIcon /><span>Add Habit</span>
            </Button>
          </CreateHabitDialog>
        </header>
        <Suspense fallback={"Loading habits..."}>
          <HabitCardList />
        </Suspense>
      </div>
    </div>
  )
}

